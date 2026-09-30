import { Alert, Button, Spinner } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCategorySummariesUseCase } from '../../../application/categories/list-category-summaries.use-case'
import type { CategorySummary } from '../../../domain/categories/types'
import { categoriesApi } from '../../../infrastructure/categories/categories.api'
import { useTranslation } from '../../../shared/i18n'
import { getStockDisplayStatus } from '../../features/products/product-display'
import { ProductsTable } from '../../features/products/ProductsTable'
import {
  ProductsToolbar,
  type StockStatusFilter,
} from '../../features/products/ProductsToolbar'
import { useProductsStore } from '../../stores/products.store'

function mapErrorMessage(
  code: string | null,
  t: (key: string) => string,
): string | null {
  if (!code) return null
  if (code === 'CONFLICT') return t('products.errors.conflict')
  if (code === 'VALIDATION') return t('products.errors.validation')
  if (code === 'NOT_FOUND') return t('products.errors.notFound')
  return t('products.errors.unknown')
}

export function ProductsPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const items = useProductsStore((state) => state.items)
  const filters = useProductsStore((state) => state.filters)
  const isLoading = useProductsStore((state) => state.isLoading)
  const errorCode = useProductsStore((state) => state.errorCode)
  const errorDetails = useProductsStore((state) => state.errorDetails)
  const load = useProductsStore((state) => state.load)
  const setFilters = useProductsStore((state) => state.setFilters)
  const clearError = useProductsStore((state) => state.clearError)
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [stockStatus, setStockStatus] = useState<StockStatusFilter>('all')

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void listCategorySummariesUseCase(categoriesApi)
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const visibleItems = useMemo(() => {
    if (stockStatus === 'all') return items
    return items.filter((item) => getStockDisplayStatus(item.stockQuantity) === stockStatus)
  }, [items, stockStatus])

  const errorMessage = mapErrorMessage(errorCode, t)
  const detailsText = Array.isArray(errorDetails)
    ? errorDetails.join(', ')
    : errorDetails

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[32px] font-bold text-accent">
            {t('products.title')}
          </h1>
          <p className="text-sm text-muted">{t('products.subtitle')}</p>
        </div>
        <Button
          onPress={() => navigate('/products/new')}
          className="gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-white"
        >
          <svg className="size-4" aria-hidden="true">
            <use href="#plus-icon" />
          </svg>
          {t('products.addProduct')}
        </Button>
      </div>

      <ProductsToolbar
        filters={filters}
        stockStatus={stockStatus}
        categories={categories}
        locale={locale}
        total={visibleItems.length}
        onFiltersChange={(next) => {
          clearError()
          void setFilters(next)
        }}
        onStockStatusChange={setStockStatus}
      />

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
                {detailsText ? (
                  <Alert.Description>{detailsText}</Alert.Description>
                ) : null}
              </Alert.Content>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-field-border bg-white/60">
          <p className="text-accent">{t('common.empty')}</p>
          <Button variant="secondary" onPress={() => void load()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <ProductsTable items={visibleItems} categories={categories} locale={locale} />
      )}
    </motion.div>
  )
}
