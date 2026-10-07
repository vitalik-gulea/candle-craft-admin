import { Alert, Button, Spinner } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProductsUseCase } from '../../../application/products/list-products.use-case'
import { productsApi } from '../../../infrastructure/products/products.api'
import { useTranslation } from '../../../shared/i18n'
import { filterCategoryTree, flattenCategoryTree } from '../../../domain/categories/tree'
import type { CategoryTreeNode } from '../../../domain/categories/types'
import { CategoryTreeRow } from '../../features/categories/CategoryTreeRow'
import { DeleteCategoryBranchModal } from '../../features/categories/DeleteCategoryBranchModal'
import { CategoriesToolbar } from '../../features/categories/CategoriesToolbar'
import { useCategoriesStore } from '../../stores/categories.store'

function mapErrorMessage(code: string | null, t: (key: string) => string): string | null {
  if (!code) return null
  if (code === 'CONFLICT') return t('categories.errors.conflict')
  if (code === 'VALIDATION') return t('categories.errors.validation')
  if (code === 'NOT_FOUND') return t('categories.errors.notFound')
  return t('categories.errors.unknown')
}

export function CategoriesPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const items = useCategoriesStore((state) => state.items)
  const tree = useCategoriesStore((state) => state.tree)
  const isLoading = useCategoriesStore((state) => state.isLoading)
  const isMutating = useCategoriesStore((state) => state.isMutating)
  const errorCode = useCategoriesStore((state) => state.errorCode)
  const errorDetails = useCategoriesStore((state) => state.errorDetails)
  const load = useCategoriesStore((state) => state.load)
  const setStatus = useCategoriesStore((state) => state.setStatus)
  const trash = useCategoriesStore((state) => state.trash)
  const clearError = useCategoriesStore((state) => state.clearError)

  const [search, setSearch] = useState('')
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [pendingBranchDelete, setPendingBranchDelete] = useState<CategoryTreeNode | null>(null)
  const [productsCountByCategory, setProductsCountByCategory] = useState<Map<string, number>>(
    new Map(),
  )

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void listProductsUseCase(productsApi)
      .then((products) => {
        const counts = new Map<string, number>()
        for (const product of products) {
          if (!product.mainCategoryId) continue
          counts.set(product.mainCategoryId, (counts.get(product.mainCategoryId) ?? 0) + 1)
        }
        setProductsCountByCategory(counts)
      })
      .catch(() => setProductsCountByCategory(new Map()))
  }, [items])

  const query = search.trim().toLowerCase()
  const visibleTree = useMemo(() => {
    if (!query) return tree
    return filterCategoryTree(tree, (node) => node.name[locale].toLowerCase().includes(query))
  }, [tree, query, locale])
  const total = query ? flattenCategoryTree(visibleTree).length : items.length

  function toggleNode(id: string) {
    setCollapsedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleTrash(category: CategoryTreeNode) {
    clearError()
    const ok = await trash(category.id)
    if (ok) return
    if (useCategoriesStore.getState().errorCode === 'CONFLICT' && category.children.length > 0) {
      clearError()
      setPendingBranchDelete(category)
    }
  }

  async function handleConfirmBranchDelete(category: CategoryTreeNode) {
    clearError()
    await trash(category.id, true)
    setPendingBranchDelete(null)
  }

  const errorMessage = mapErrorMessage(errorCode, t)
  const detailsText = Array.isArray(errorDetails) ? errorDetails.join(', ') : errorDetails

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <h1 className="font-heading text-[32px] font-bold text-accent">{t('nav.categories')}</h1>
        <Button
          onPress={() => navigate('/categories/new')}
          className="gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-white"
        >
          <svg className="size-4" aria-hidden="true">
            <use href="#plus-icon" />
          </svg>
          {t('categories.addCategory')}
        </Button>
      </div>

      <CategoriesToolbar search={search} total={total} onSearchChange={setSearch} />

      <AnimatePresence>
        {errorMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>{errorMessage}</Alert.Title>
                {detailsText ? <Alert.Description>{detailsText}</Alert.Description> : null}
              </Alert.Content>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : visibleTree.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-field-border bg-white/60">
          <p className="text-accent">{t('common.empty')}</p>
          <Button variant="secondary" onPress={() => void load()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-field-border bg-white">
          {visibleTree.map((node) => (
            <CategoryTreeRow
              key={node.id}
              node={node}
              level={1}
              locale={locale}
              productsCountByCategory={productsCountByCategory}
              collapsedIds={collapsedIds}
              forceExpanded={query !== ''}
              isMutating={isMutating}
              onToggle={toggleNode}
              onEdit={(item) => navigate(`/categories/${item.id}/edit`)}
              onSetStatus={(id, status) => {
                clearError()
                void setStatus(id, status)
              }}
              onTrash={(item) => void handleTrash(item)}
            />
          ))}
        </div>
      )}
      <DeleteCategoryBranchModal
        category={pendingBranchDelete}
        locale={locale}
        isPending={isMutating}
        onClose={() => setPendingBranchDelete(null)}
        onConfirm={(item) => void handleConfirmBranchDelete(item)}
      />
    </motion.div>
  )
}
