import { Button, Checkbox, Dropdown } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CategorySummary } from '../../../domain/categories/types'
import type { Product } from '../../../domain/products/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import { useProductsStore } from '../../stores/products.store'
import {
  formatProductPrice,
  formatStockQuantity,
  getStockDisplayStatus,
  type StockDisplayStatus,
} from './product-display'

interface ProductsTableProps {
  items: Product[]
  categories: CategorySummary[]
  locale: Locale
}

const PAGE_SIZE = 8

function StockStatusBadge({ status }: { status: StockDisplayStatus }) {
  const { t } = useTranslation()
  const label = t(`products.stockStatus.${status}`)

  if (status === 'active') {
    return (
      <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
        {label}
      </span>
    )
  }

  if (status === 'low') {
    return (
      <span className="inline-flex rounded-full bg-danger px-2.5 py-1 text-xs font-semibold text-white">
        {label}
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
      {label}
    </span>
  )
}

export function ProductsTable({ items, categories, locale }: ProductsTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setStatus = useProductsStore((state) => state.setStatus)
  const copy = useProductsStore((state) => state.copy)
  const trash = useProductsStore((state) => state.trash)
  const restore = useProductsStore((state) => state.restore)
  const permanentlyDelete = useProductsStore((state) => state.permanentlyDelete)
  const isMutating = useProductsStore((state) => state.isMutating)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [knownItems, setKnownItems] = useState(items)

  if (items !== knownItems) {
    setKnownItems(items)
    setPage(1)
    setSelectedIds(new Set())
  }

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories) {
      map.set(category.id, category.name[locale])
    }
    return map
  }, [categories, locale])

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pageItems = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page],
  )

  const allOnPageSelected =
    pageItems.length > 0 && pageItems.every((item) => selectedIds.has(item.id))

  function toggleRow(id: string, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAllOnPage(selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const item of pageItems) {
        if (selected) next.add(item.id)
        else next.delete(item.id)
      }
      return next
    })
  }

  async function bulkHide() {
    await Promise.all([...selectedIds].map((id) => setStatus(id, 'hidden')))
    setSelectedIds(new Set())
  }

  async function bulkDelete() {
    await Promise.all([...selectedIds].map((id) => trash(id)))
    setSelectedIds(new Set())
  }

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }
    if (page <= 3) return [1, 2, 3, 'ellipsis', totalPages] as const
    if (page >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages] as const
    }
    return [1, 'ellipsis', page, 'ellipsis', totalPages] as const
  }, [page, totalPages])

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="w-full rounded-xl border border-field-border bg-white p-6">
        <div className="flex w-full items-center border-b border-field-border pb-3">
          <Checkbox
            isSelected={allOnPageSelected}
            onChange={(selected) => toggleAllOnPage(selected)}
            aria-label={t('common.all')}
            className="shrink-0"
          >
            <Checkbox.Content>
              <Checkbox.Control className="size-5 rounded border-[1.5px] border-field-border">
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox.Content>
          </Checkbox>
          <div className="w-4 shrink-0" />
          <p className="w-[60px] shrink-0 text-[13px] font-bold text-muted">
            {t('products.columns.image')}
          </p>
          <p className="min-w-0 flex-1 text-[13px] font-bold text-muted">
            {t('products.columns.name')}
          </p>
          <p className="w-[150px] shrink-0 text-[13px] font-bold text-muted">
            {t('products.columns.category')}
          </p>
          <p className="w-[100px] shrink-0 text-[13px] font-bold text-muted">
            {t('products.columns.price')}
          </p>
          <p className="w-[120px] shrink-0 text-[13px] font-bold text-muted">
            {t('products.columns.stock')}
          </p>
          <p className="w-[140px] shrink-0 text-[13px] font-bold text-muted">
            {t('products.columns.status')}
          </p>
          <p className="w-[60px] shrink-0 text-center text-[13px] font-bold text-muted">
            {t('products.columns.actions')}
          </p>
        </div>

        {pageItems.map((product) => {
          const stockStatus = getStockDisplayStatus(product.stockQuantity)
          const categoryName = product.mainCategoryId
            ? (categoryNameById.get(product.mainCategoryId) ?? '—')
            : '—'

          return (
            <div
              key={product.id}
              className="flex w-full items-center border-b border-field-border py-3 last:border-b-0"
            >
              <Checkbox
                isSelected={selectedIds.has(product.id)}
                onChange={(selected) => toggleRow(product.id, selected)}
                aria-label={product.name[locale]}
                className="shrink-0"
              >
                <Checkbox.Content>
                  <Checkbox.Control className="size-5 rounded border-[1.5px] border-field-border">
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox.Content>
              </Checkbox>
              <div className="w-4 shrink-0" />
              <div className="w-[60px] shrink-0">
                {product.mainImageUrl ? (
                  <img
                    src={product.mainImageUrl}
                    alt={product.mainImageAlt[locale] ?? product.name[locale]}
                    className="size-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-md bg-surface-soft text-muted">
                    <svg className="size-4" aria-hidden="true">
                      <use href="/icons.svg#image-icon" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="w-5 shrink-0" />
              <button
                type="button"
                onClick={() => navigate(`/products/${product.id}`)}
                className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-accent hover:underline"
              >
                {product.name[locale]}
              </button>
              <p className="w-[150px] shrink-0 text-sm text-muted">{categoryName}</p>
              <p className="w-[100px] shrink-0 text-sm font-semibold text-accent">
                {formatProductPrice(product.effectivePrice ?? product.regularPrice)}
              </p>
              <p className="w-[120px] shrink-0 text-sm text-accent">
                {formatStockQuantity(product.stockQuantity, t('products.stockUnit'))}
              </p>
              <div className="w-[140px] shrink-0">
                <StockStatusBadge status={stockStatus} />
              </div>
              <div className="flex w-[60px] shrink-0 items-center justify-center">
                <Dropdown>
                  <Dropdown.Trigger>
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      isDisabled={isMutating}
                      aria-label={t('common.actions')}
                      className="p-1.5"
                    >
                      <svg className="size-4 text-accent" aria-hidden="true">
                        <use href="/icons.svg#more-horizontal-icon" />
                      </svg>
                    </Button>
                  </Dropdown.Trigger>
                  <Dropdown.Popover>
                    <Dropdown.Menu
                      onAction={(key) => {
                        const action = String(key)
                        if (action === 'edit') navigate(`/products/${product.id}`)
                        if (action === 'hide') void setStatus(product.id, 'hidden')
                        if (action === 'show') void setStatus(product.id, 'published')
                        if (action === 'copy') void copy(product.id)
                        if (action === 'trash') void trash(product.id)
                        if (action === 'restore') void restore(product.id)
                        if (action === 'delete') void permanentlyDelete(product.id)
                      }}
                    >
                      <Dropdown.Item id="edit" textValue={t('products.actions.edit')}>
                        {t('products.actions.edit')}
                      </Dropdown.Item>
                      {product.status === 'published' ? (
                        <Dropdown.Item id="hide" textValue={t('products.actions.hide')}>
                          {t('products.actions.hide')}
                        </Dropdown.Item>
                      ) : null}
                      {product.status === 'hidden' || product.status === 'draft' ? (
                        <Dropdown.Item id="show" textValue={t('products.actions.show')}>
                          {t('products.actions.show')}
                        </Dropdown.Item>
                      ) : null}
                      {!product.deletedAt ? (
                        <Dropdown.Item id="copy" textValue={t('products.actions.copy')}>
                          {t('products.actions.copy')}
                        </Dropdown.Item>
                      ) : null}
                      {!product.deletedAt ? (
                        <Dropdown.Item id="trash" textValue={t('products.actions.trash')}>
                          {t('products.actions.trash')}
                        </Dropdown.Item>
                      ) : null}
                      {product.deletedAt ? (
                        <Dropdown.Item id="restore" textValue={t('products.actions.restore')}>
                          {t('products.actions.restore')}
                        </Dropdown.Item>
                      ) : null}
                      {product.deletedAt ? (
                        <Dropdown.Item
                          id="delete"
                          textValue={t('products.actions.permanentlyDelete')}
                        >
                          {t('products.actions.permanentlyDelete')}
                        </Dropdown.Item>
                      ) : null}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedIds.size > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex w-full items-center justify-between rounded-lg bg-accent px-5 py-3"
          >
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-white">
                {t('products.bulk.selected', { count: String(selectedIds.size) })}
              </p>
              <div className="h-4 w-px bg-white/30" />
              <button
                type="button"
                onClick={() => void bulkHide()}
                disabled={isMutating}
                className="flex items-center gap-1.5 text-sm text-white disabled:opacity-50"
              >
                <svg className="size-3.5" aria-hidden="true">
                  <use href="/icons.svg#eye-off-icon" />
                </svg>
                {t('products.bulk.hide')}
              </button>
              <button
                type="button"
                onClick={() => void bulkDelete()}
                disabled={isMutating}
                className="flex items-center gap-1.5 text-sm text-danger disabled:opacity-50"
              >
                <svg className="size-3.5" aria-hidden="true">
                  <use href="/icons.svg#trash-icon" />
                </svg>
                {t('products.bulk.delete')}
              </button>
            </div>
            <p className="text-[13px] text-muted">{t('products.bulk.hint')}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {items.length > 0 ? (
        <div className="flex w-full items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-field-border px-4 py-2 text-sm font-semibold text-muted disabled:opacity-40"
          >
            {t('products.pagination.prev')}
          </button>

          {visiblePages.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={
                  item === page
                    ? 'rounded-md bg-accent px-4 py-2 text-sm font-bold text-white'
                    : 'rounded-md border border-field-border px-4 py-2 text-sm font-semibold text-accent'
                }
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-md border-[1.5px] border-accent px-4 py-2 text-sm font-semibold text-accent disabled:opacity-40"
          >
            {t('products.pagination.next')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
