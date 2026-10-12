import type { OrderStatus } from '../../../domain/orders/types'
import { useTranslation } from '../../../shared/i18n'
import { ORDER_STATUS_CLASS_NAMES } from './order-display'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_CLASS_NAMES[status]}`}
    >
      {t(`orders.status.${status}`)}
    </span>
  )
}
