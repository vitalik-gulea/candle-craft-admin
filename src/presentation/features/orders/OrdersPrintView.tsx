import type { Order } from '../../../domain/orders/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import { formatChisinauDateTime } from '../../../shared/utils/chisinau-time'
import { formatOrderMoney, getOrderCustomerName } from './order-display'
import { OrderPrintView } from './OrderPrintView'

interface OrdersPrintViewProps {
  orders: Order[]
  locale: Locale
}

const thClassName = 'border-b border-black py-1 pe-2 text-left font-semibold'
const tdClassName = 'border-b border-neutral-300 py-1 pe-2 align-top'

export function OrdersPrintView({ orders, locale }: OrdersPrintViewProps) {
  const { t } = useTranslation()

  return (
    <>
    <article className="hidden text-[10px] leading-snug text-black print:block">
      <header className="mb-3 flex items-baseline justify-between border-b-2 border-black pb-2">
        <h1 className="font-heading text-xl font-bold">{t('orders.title')}</h1>
        <p>{t('orders.itemsCount', { count: String(orders.length) })}</p>
      </header>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thClassName}>{t('orders.columns.number')}</th>
            <th className={thClassName}>{t('orders.columns.date')}</th>
            <th className={thClassName}>{t('orders.columns.customer')}</th>
            <th className={thClassName}>{t('orders.columns.phone')}</th>
            <th className={thClassName}>{t('orders.columns.delivery')}</th>
            <th className={thClassName}>{t('orders.columns.payment')}</th>
            <th className={thClassName}>{t('orders.columns.status')}</th>
            <th className={`${thClassName} text-right`}>{t('orders.columns.total')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="break-inside-avoid">
              <td className={tdClassName}>{order.displayNumber}</td>
              <td className={tdClassName}>{formatChisinauDateTime(order.createdAt, locale)}</td>
              <td className={tdClassName}>{getOrderCustomerName(order)}</td>
              <td className={tdClassName}>{order.phone}</td>
              <td className={tdClassName}>{t(`orders.deliveryMethod.${order.deliveryMethod}`)}</td>
              <td className={tdClassName}>{t(`orders.paymentMethod.${order.paymentMethod}`)}</td>
              <td className={tdClassName}>{t(`orders.status.${order.status}`)}</td>
              <td className={`${tdClassName} text-right`}>{formatOrderMoney(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
      {orders.map((order) => (
        <div key={order.id} className="hidden break-before-page print:block">
          <OrderPrintView order={order} locale={locale} />
        </div>
      ))}
    </>
  )
}
