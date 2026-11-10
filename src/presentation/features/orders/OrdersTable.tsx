import { Button, Pagination } from '@heroui/react'
import { motion } from 'framer-motion'
import { useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { canArchiveOrder, type Order } from '../../../domain/orders/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import { formatChisinauDateTimeCompact } from '../../../shared/utils/chisinau-time'
import { formatOrderMoney, getOrderCustomerName } from './order-display'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrdersTableProps {
  items: Order[]
  total: number
  page: number
  limit: number
  locale: Locale
  mode: 'active' | 'archive'
  isActionPending: boolean
  onPageChange: (page: number) => void
  onAction: (order: Order) => void
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

const headerClassName = 'text-[13px] font-bold text-muted'
const cellClassName = 'truncate text-[13px] text-accent'

interface OrderColumn {
  key: string
  label: string
  className: string
  render: (order: Order) => ReactNode
}

export function OrdersTable({
  items,
  total,
  page,
  limit,
  locale,
  mode,
  isActionPending,
  onPageChange,
  onAction,
}: OrdersTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const visiblePages = useMemo(() => getVisiblePages(page, totalPages), [page, totalPages])
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)
  const isArchive = mode === 'archive'
  const wideOnly = 'hidden 2xl:block'

  const columns: OrderColumn[] = [
    {
      key: 'number',
      label: t('orders.columns.number'),
      className: 'w-[56px] shrink-0',
      render: (order) => (
        <button
          type="button"
          className="text-left text-[13px] font-semibold text-accent hover:underline"
        >
          {order.displayNumber}
        </button>
      ),
    },
    {
      key: 'date',
      label: t('orders.columns.date'),
      className: 'w-[120px] shrink-0',
      render: (order) => (
        <p className={cellClassName}>{formatChisinauDateTimeCompact(order.createdAt, locale)}</p>
      ),
    },
    {
      key: 'customer',
      label: t('orders.columns.customer'),
      className: 'min-w-[120px] flex-1',
      render: (order) => (
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold text-accent">{getOrderCustomerName(order)}</p>
          {order.isB2b ? (
            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
              {t('orders.b2bBadge')}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'phone',
      label: t('orders.columns.phone'),
      className: `w-[120px] shrink-0 hidden xl:block`,
      render: (order) => <p className={cellClassName}>{order.phone}</p>,
    },
    {
      key: 'total',
      label: t('orders.columns.total'),
      className: 'w-[85px] shrink-0',
      render: (order) => (
        <p className={`${cellClassName} font-semibold`}>{formatOrderMoney(order.total)}</p>
      ),
    },
    {
      key: 'source',
      label: t('orders.columns.source'),
      className: `w-[130px] shrink-0 ${wideOnly}`,
      render: (order) => <p className={cellClassName}>{t(`orders.source.${order.source}`)}</p>,
    },
    {
      key: 'delivery',
      label: t('orders.columns.delivery'),
      className: `w-[120px] shrink-0 hidden xl:block`,
      render: (order) => (
        <p className="truncate text-xs text-accent">
          {t(`orders.deliveryMethod.${order.deliveryMethod}`)}
        </p>
      ),
    },
    {
      key: 'payment',
      label: t('orders.columns.payment'),
      className: `w-[90px] shrink-0 ${wideOnly}`,
      render: (order) => (
        <p className={cellClassName}>{t(`orders.paymentMethod.${order.paymentMethod}`)}</p>
      ),
    },
    {
      key: 'paymentResult',
      label: t('orders.columns.paymentResult'),
      className: `w-[110px] shrink-0 ${wideOnly}`,
      render: (order) => (
        <p className={cellClassName}>
          {order.paymentMethod === 'online' && order.paymentResult
            ? t(`orders.paymentResult.${order.paymentResult}`)
            : '—'}
        </p>
      ),
    },
    {
      key: 'status',
      label: t('orders.columns.status'),
      className: 'w-[100px] shrink-0',
      render: (order) => <OrderStatusBadge status={order.status} />,
    },
    ...(isArchive
      ? [
          {
            key: 'archivedAt',
            label: t('orders.archive.archivedAt'),
            className: 'w-[120px] shrink-0',
            render: (order: Order) => (
              <p className={cellClassName}>
                {order.archivedAt ? formatChisinauDateTimeCompact(order.archivedAt, locale) : '—'}
              </p>
            ),
          },
        ]
      : []),
    {
      key: 'actions',
      label: t('common.actions'),
      className: 'w-[90px] shrink-0',
      render: (order) => (
        <div
          onClick={(event) => event.stopPropagation()}
          title={
            !isArchive && !canArchiveOrder(order) ? t('orders.archive.onlyFinalHint') : undefined
          }
        >
          {renderAction(order)}
        </div>
      ),
    },
  ]

  function renderAction(order: Order) {
    return (
      <Button
        variant="outline"
        isDisabled={isActionPending || (!isArchive && !canArchiveOrder(order))}
        onPress={() => onAction(order)}
        className="h-8! rounded-md! border-field-border! bg-white! px-3! text-[13px]! font-semibold! text-accent! shadow-none!"
      >
        {isArchive ? t('orders.archive.restore') : t('orders.archive.button')}
      </Button>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-3 lg:hidden">
        {items.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.02 }}
            onClick={() => navigate(`/orders/${order.id}`)}
            className="flex w-full cursor-pointer flex-col gap-3 rounded-xl border border-field-border bg-white p-4 active:bg-surface-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm font-bold text-accent">{order.displayNumber}</p>
                <p className="text-xs text-muted">
                  {formatChisinauDateTimeCompact(order.createdAt, locale)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-sm font-semibold text-accent">
                  {getOrderCustomerName(order)}
                </p>
                {order.isB2b ? (
                  <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {t('orders.b2bBadge')}
                  </span>
                ) : null}
              </div>
              <a
                href={`tel:${order.phone}`}
                onClick={(event) => event.stopPropagation()}
                className="w-fit text-[13px] text-accent underline-offset-2 hover:underline"
              >
                {order.phone}
              </a>
              <p className="text-xs text-muted">
                {t(`orders.deliveryMethod.${order.deliveryMethod}`)} ·{' '}
                {t(`orders.paymentMethod.${order.paymentMethod}`)}
              </p>
              {isArchive && order.archivedAt ? (
                <p className="text-xs text-muted">
                  {t('orders.archive.archivedAt')}:{' '}
                  {formatChisinauDateTimeCompact(order.archivedAt, locale)}
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-field-border pt-3">
              <p className="text-base font-bold text-accent">{formatOrderMoney(order.total)}</p>
              <div onClick={(event) => event.stopPropagation()}>{renderAction(order)}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="hidden w-full rounded-xl border border-field-border bg-white lg:block">
        <div className="p-4 2xl:p-6">
          <div className="flex w-full items-center gap-3 border-b border-field-border pb-3 2xl:gap-4">
            {columns.map((column) => (
              <p key={column.key} className={`${headerClassName} ${column.className}`}>
                {column.label}
              </p>
            ))}
          </div>

          {items.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.02 }}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="flex w-full cursor-pointer items-center gap-3 border-b border-field-border py-3 transition-colors last:border-b-0 hover:bg-surface-soft 2xl:gap-4"
            >
              {columns.map((column) => (
                <div key={column.key} className={column.className}>
                  {column.render(order)}
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {totalPages > 1 ? (
        <Pagination className="w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
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
                <span className="hidden sm:inline">{t('orders.pagination.prev')}</span>
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
                <span className="hidden sm:inline">{t('orders.pagination.next')}</span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      ) : null}
    </div>
  )
}
