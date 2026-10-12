import { Pagination } from '@heroui/react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order } from '../../../domain/orders/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import { formatChisinauDateTime } from '../../../shared/utils/chisinau-time'
import { formatOrderMoney, getOrderCustomerName } from './order-display'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrdersTableProps {
  items: Order[]
  total: number
  page: number
  limit: number
  locale: Locale
  onPageChange: (page: number) => void
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

function getVisiblePages(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages]
  if (page >= totalPages - 3) {
    return [1, 'ellipsis-start', ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)]
  }
  return [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', totalPages]
}

const headerClassName = 'shrink-0 text-[13px] font-bold text-muted'
const cellClassName = 'shrink-0 truncate text-sm text-accent'

export function OrdersTable({
  items,
  total,
  page,
  limit,
  locale,
  onPageChange,
}: OrdersTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const visiblePages = useMemo(() => getVisiblePages(page, totalPages), [page, totalPages])
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full overflow-x-auto rounded-xl border border-field-border bg-white">
        <div className="min-w-[1280px] p-6">
          <div className="flex w-full items-center gap-4 border-b border-field-border pb-3">
            <p className={`${headerClassName} w-[80px]`}>{t('orders.columns.number')}</p>
            <p className={`${headerClassName} w-[150px]`}>{t('orders.columns.date')}</p>
            <p className={`${headerClassName} min-w-[140px] flex-1`}>
              {t('orders.columns.customer')}
            </p>
            <p className={`${headerClassName} w-[140px]`}>{t('orders.columns.phone')}</p>
            <p className={`${headerClassName} w-[100px]`}>{t('orders.columns.total')}</p>
            <p className={`${headerClassName} w-[130px]`}>{t('orders.columns.source')}</p>
            <p className={`${headerClassName} w-[120px]`}>{t('orders.columns.delivery')}</p>
            <p className={`${headerClassName} w-[90px]`}>{t('orders.columns.payment')}</p>
            <p className={`${headerClassName} w-[110px]`}>{t('orders.columns.paymentResult')}</p>
            <p className={`${headerClassName} w-[130px]`}>{t('orders.columns.status')}</p>
          </div>

          {items.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.02 }}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="flex w-full cursor-pointer items-center gap-4 border-b border-field-border py-3 transition-colors last:border-b-0 hover:bg-surface-soft"
            >
              <button
                type="button"
                className="w-[80px] shrink-0 text-left text-sm font-semibold text-accent hover:underline"
              >
                {order.displayNumber}
              </button>
              <p className={`${cellClassName} w-[150px]`}>
                {formatChisinauDateTime(order.createdAt, locale)}
              </p>
              <div className="flex min-w-[140px] flex-1 items-center gap-2">
                <p className="truncate text-sm font-semibold text-accent">
                  {getOrderCustomerName(order)}
                </p>
                {order.isB2b ? (
                  <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {t('orders.b2bBadge')}
                  </span>
                ) : null}
              </div>
              <p className={`${cellClassName} w-[140px]`}>{order.phone}</p>
              <p className={`${cellClassName} w-[100px] font-semibold`}>
                {formatOrderMoney(order.total)}
              </p>
              <p className={`${cellClassName} w-[130px]`}>{t(`orders.source.${order.source}`)}</p>
              <p className={`${cellClassName} w-[120px]`}>
                {t(`orders.deliveryMethod.${order.deliveryMethod}`)}
              </p>
              <p className={`${cellClassName} w-[90px]`}>
                {t(`orders.paymentMethod.${order.paymentMethod}`)}
              </p>
              <p className={`${cellClassName} w-[110px]`}>
                {order.paymentMethod === 'online' && order.paymentResult
                  ? t(`orders.paymentResult.${order.paymentResult}`)
                  : '—'}
              </p>
              <div className="w-[130px] shrink-0">
                <OrderStatusBadge status={order.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {totalPages > 1 ? (
        <Pagination className="w-full justify-between">
          <Pagination.Summary>
            {t('orders.pagination.summary', {
              from: String(from),
              to: String(to),
              total: String(total),
            })}
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous isDisabled={page === 1} onPress={() => onPageChange(page - 1)}>
                <Pagination.PreviousIcon />
                {t('orders.pagination.prev')}
              </Pagination.Previous>
            </Pagination.Item>
            {visiblePages.map((item) =>
              typeof item === 'string' ? (
                <Pagination.Item key={item}>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              ) : (
                <Pagination.Item key={item}>
                  <Pagination.Link isActive={item === page} onPress={() => onPageChange(item)}>
                    {item}
                  </Pagination.Link>
                </Pagination.Item>
              ),
            )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === totalPages}
                onPress={() => onPageChange(page + 1)}
              >
                {t('orders.pagination.next')}
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      ) : null}
    </div>
  )
}
