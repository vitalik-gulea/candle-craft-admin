import { Alert, Button, Spinner, toast } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { archiveOrderUseCase } from '../../../application/orders/archive-order.use-case'
import { exportOrdersUseCase } from '../../../application/orders/export-orders.use-case'
import type { OrdersRepository } from '../../../application/orders/ports'
import { restoreOrderUseCase } from '../../../application/orders/restore-order.use-case'
import { OrderError } from '../../../domain/orders/errors'
import type { Order, OrderListFilters } from '../../../domain/orders/types'
import { ordersApi } from '../../../infrastructure/orders/orders.api'
import { useTranslation } from '../../../shared/i18n'
import { ORDERS_PAGE_SIZE } from '../../stores/orders.store'
import { ArchiveOrderDialog } from './ArchiveOrderDialog'
import { buildOrdersCsv, downloadTextFile } from './orders-csv'
import { OrdersPrintView } from './OrdersPrintView'
import { OrdersTable } from './OrdersTable'
import { OrdersTabs } from './OrdersTabs'
import { OrdersToolbar } from './OrdersToolbar'

function mapErrorMessage(code: string | null, t: (key: string) => string): string | null {
  if (!code) return null
  if (code === 'FORBIDDEN') return t('orders.errors.forbidden')
  if (code === 'VALIDATION') return t('orders.errors.validation')
  return t('orders.errors.unknown')
}

interface OrdersListViewProps {
  mode: 'active' | 'archive'
  items: Order[]
  total: number
  filters: OrderListFilters
  isLoading: boolean
  errorCode: string | null
  errorDetails: string | string[] | null
  load: (filters?: OrderListFilters) => Promise<void>
  clearError: () => void
  onChanged?: () => void
}

export function OrdersListView({
  mode,
  items,
  total,
  filters,
  isLoading,
  errorCode,
  errorDetails,
  load,
  clearError,
  onChanged,
}: OrdersListViewProps) {
  const { t, locale } = useTranslation()
  const isArchive = mode === 'archive'
  const [archiveTarget, setArchiveTarget] = useState<Order | null>(null)
  const [isActionPending, setIsActionPending] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFailed, setExportFailed] = useState(false)
  const [printOrders, setPrintOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    if (!printOrders) return
    const handleAfterPrint = () => setPrintOrders(null)
    window.addEventListener('afterprint', handleAfterPrint)
    const frame = window.requestAnimationFrame(() => window.print())
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [printOrders])

  const exportOrders = useCallback(
    async (format: 'csv' | 'pdf') => {
      setExportFailed(false)
      setIsExporting(true)
      try {
        const repository: OrdersRepository = isArchive
          ? { ...ordersApi, list: ordersApi.listArchive }
          : ordersApi
        const orders = await exportOrdersUseCase(repository, { ...filters, page: 1 })
        if (format === 'csv') {
          const date = new Date().toISOString().slice(0, 10)
          downloadTextFile(buildOrdersCsv(orders, locale, t), `orders-${date}.csv`, 'text/csv;charset=utf-8')
        } else {
          setPrintOrders(orders)
        }
      } catch {
        setExportFailed(true)
      } finally {
        setIsExporting(false)
      }
    },
    [filters, isArchive, locale, t],
  )

  useEffect(() => {
    void load()
  }, [load])

  async function runArchiveAction(order: Order) {
    setIsActionPending(true)
    try {
      if (isArchive) {
        await restoreOrderUseCase(ordersApi, order.id)
        toast.success(t('orders.archive.toasts.restored'))
      } else {
        await archiveOrderUseCase(ordersApi, order.id)
        toast.success(t('orders.archive.toasts.archived'))
      }
    } catch (error) {
      const code = error instanceof OrderError ? error.code : 'UNKNOWN'
      if (code === 'CONFLICT') toast.warning(t('orders.archive.errors.conflict'))
      else if (code === 'NOT_FOUND') toast.danger(t('orders.archive.errors.notFound'))
      else if (code === 'FORBIDDEN') toast.danger(t('orders.errors.forbidden'))
      else toast.danger(t('orders.errors.unknown'))
    } finally {
      setIsActionPending(false)
      const page = filters.page ?? 1
      const isLastOnPage = items.length === 1 && page > 1
      void load({ ...filters, page: isLastOnPage ? page - 1 : page })
      onChanged?.()
    }
  }

  function handleRowAction(order: Order) {
    if (isArchive) void runArchiveAction(order)
    else setArchiveTarget(order)
  }

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
    <>
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8 print:hidden"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[32px] font-bold text-accent">
          {isArchive ? t('orders.archive.title') : t('orders.title')}
        </h1>
        <p className="text-sm text-muted">
          {isArchive ? t('orders.archive.subtitle') : t('orders.subtitle')}
        </p>
      </div>

      <OrdersTabs active={isArchive ? 'archive' : 'orders'} />

      <OrdersToolbar
        filters={filters}
        total={total}
        isExporting={isExporting}
        onFiltersChange={applyFilters}
        onExport={(format) => void exportOrders(format)}
      />

      <AnimatePresence>
        {errorMessage || exportFailed ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>{errorMessage ?? t('orders.export.failed')}</Alert.Title>
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
            mode={mode}
            isActionPending={isActionPending}
            onPageChange={changePage}
            onAction={handleRowAction}
          />
        </div>
      )}
    </motion.div>
    {printOrders ? <OrdersPrintView orders={printOrders} locale={locale} /> : null}
    <ArchiveOrderDialog
      isOpen={archiveTarget !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) setArchiveTarget(null)
      }}
      onConfirm={() => {
        const target = archiveTarget
        setArchiveTarget(null)
        if (target) void runArchiveAction(target)
      }}
    />
    </>
  )
}
