import { Alert, Button, Spinner } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import type { OrderListFilters } from '../../../domain/orders/types'
import { useTranslation } from '../../../shared/i18n'
import { OrdersTable } from '../../features/orders/OrdersTable'
import { OrdersToolbar } from '../../features/orders/OrdersToolbar'
import { ORDERS_PAGE_SIZE, useOrdersStore } from '../../stores/orders.store'

function mapErrorMessage(code: string | null, t: (key: string) => string): string | null {
  if (!code) return null
  if (code === 'FORBIDDEN') return t('orders.errors.forbidden')
  if (code === 'VALIDATION') return t('orders.errors.validation')
  return t('orders.errors.unknown')
}

export function OrdersPage() {
  const { t, locale } = useTranslation()
  const items = useOrdersStore((state) => state.items)
  const total = useOrdersStore((state) => state.total)
  const filters = useOrdersStore((state) => state.filters)
  const isLoading = useOrdersStore((state) => state.isLoading)
  const errorCode = useOrdersStore((state) => state.errorCode)
  const errorDetails = useOrdersStore((state) => state.errorDetails)
  const load = useOrdersStore((state) => state.load)
  const loadNewCount = useOrdersStore((state) => state.loadNewCount)
  const clearError = useOrdersStore((state) => state.clearError)

  useEffect(() => {
    void load()
    void loadNewCount()
  }, [load, loadNewCount])

  const applyFilters = useCallback(
    (next: OrderListFilters) => {
      clearError()
      void load({ ...next, page: 1, limit: next.limit ?? ORDERS_PAGE_SIZE })
    },
    [load, clearError],
  )

  const changePage = useCallback(
    (page: number) => {
      void load({ ...filters, page })
    },
    [load, filters],
  )

  const errorMessage = mapErrorMessage(errorCode, t)
  const detailsText = Array.isArray(errorDetails) ? errorDetails.join(', ') : errorDetails
  const showDetails = errorCode === 'VALIDATION' && detailsText

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[32px] font-bold text-accent">{t('orders.title')}</h1>
        <p className="text-sm text-muted">{t('orders.subtitle')}</p>
      </div>

      <OrdersToolbar filters={filters} total={total} onFiltersChange={applyFilters} />

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
                {showDetails ? <Alert.Description>{detailsText}</Alert.Description> : null}
              </Alert.Content>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isLoading && items.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        errorMessage ? null : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-field-border bg-white/60">
            <p className="text-accent">{t('common.empty')}</p>
            <Button variant="secondary" onPress={() => void load()}>
              {t('common.retry')}
            </Button>
          </div>
        )
      ) : (
        <div className={isLoading ? 'pointer-events-none opacity-60 transition-opacity' : undefined}>
          <OrdersTable
            items={items}
            total={total}
            page={filters.page ?? 1}
            limit={filters.limit ?? ORDERS_PAGE_SIZE}
            locale={locale}
            onPageChange={changePage}
          />
        </div>
      )}
    </motion.div>
  )
}
