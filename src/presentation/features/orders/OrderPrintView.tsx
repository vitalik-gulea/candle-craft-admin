import type { Order } from '../../../domain/orders/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import { formatChisinauDateTime } from '../../../shared/utils/chisinau-time'
import {
  formatOrderMoney,
  getItemDiscountTotal,
  getOrderCustomerName,
  hasItemDiscount,
  isZeroAmount,
} from './order-display'

interface OrderPrintViewProps {
  order: Order
  locale: Locale
}

const thClassName = 'border-b border-black py-1 pe-2 text-left font-semibold'
const tdClassName = 'border-b border-neutral-300 py-1.5 pe-2 align-top'

export function OrderPrintView({ order, locale }: OrderPrintViewProps) {
  const { t } = useTranslation()
  const discountTotal = order.items.reduce((sum, item) => sum + getItemDiscountTotal(item), 0)
  const addressLabel =
    order.deliveryMethod !== 'pickup'
      ? t('orders.details.delivery.address')
      : t('orders.details.delivery.pickupDetails')

  return (
    <article className="hidden text-[12px] leading-relaxed text-black print:block">
      <header className="mb-4 flex items-baseline justify-between border-b-2 border-black pb-2">
        <h1 className="font-heading text-2xl font-bold">
          {t('orders.details.title', { number: order.displayNumber })}
        </h1>
        <p>{formatChisinauDateTime(order.createdAt, locale)}</p>
      </header>

      <section className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1">
        <p>
          <span className="font-semibold">{t('orders.details.customer.title')}: </span>
          {getOrderCustomerName(order)}
        </p>
        <p>
          <span className="font-semibold">{t('orders.details.customer.phone')}: </span>
          {order.phone}
        </p>
        <p>
          <span className="font-semibold">{t('orders.details.customer.email')}: </span>
          {order.email}
        </p>
        <p>
          <span className="font-semibold">{t('orders.details.delivery.method')}: </span>
          {t(`orders.deliveryMethod.${order.deliveryMethod}`)}
        </p>
        <p className="col-span-2">
          <span className="font-semibold">{addressLabel}: </span>
          {[order.deliveryPostalCode, order.deliveryCity, order.deliveryAddress]
            .filter(Boolean)
            .join(', ') || '—'}
        </p>
        {order.isB2b ? (
          <>
            <p>
              <span className="font-semibold">{t('orders.details.company.name')}: </span>
              {order.companyName || '—'}
            </p>
            <p>
              <span className="font-semibold">{t('orders.details.company.idno')}: </span>
              {order.companyIdno || '—'}
            </p>
            <p>
              <span className="font-semibold">{t('orders.details.company.vatCode')}: </span>
              {order.companyVatCode || '—'}
            </p>
            <p>
              <span className="font-semibold">{t('orders.details.company.legalAddress')}: </span>
              {order.companyLegalAddress || '—'}
            </p>
          </>
        ) : null}
        <p>
          <span className="font-semibold">{t('orders.details.payment.method')}: </span>
          {t(`orders.paymentMethod.${order.paymentMethod}`)}
        </p>
      </section>

      <table className="mb-4 w-full border-collapse">
        <thead>
          <tr>
            <th className={thClassName}>{t('orders.details.items.product')}</th>
            <th className={`${thClassName} w-24`}>{t('orders.details.items.price')}</th>
            <th className={`${thClassName} w-12`}>{t('orders.details.items.quantity')}</th>
            <th className={`${thClassName} w-24 text-right`}>
              {t('orders.details.items.lineTotal')}
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="break-inside-avoid">
              <td className={tdClassName}>
                <p className="font-semibold">{item.name[locale]}</p>
                {item.options.map((option) => (
                  <p key={`${option.label.ro}-${option.value.ro}`}>
                    {option.label[locale]}: {option.value[locale]}
                  </p>
                ))}
                {item.sku ? (
                  <p>
                    {t('orders.details.items.sku')}: {item.sku}
                  </p>
                ) : null}
              </td>
              <td className={tdClassName}>
                {formatOrderMoney(item.unitPrice)}
                {hasItemDiscount(item) ? (
                  <span className="block text-[10px] line-through">
                    {formatOrderMoney(item.regularUnitPrice)}
                  </span>
                ) : null}
              </td>
              <td className={tdClassName}>{item.quantity}</td>
              <td className={`${tdClassName} text-right`}>{formatOrderMoney(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ms-auto mb-4 flex w-64 flex-col gap-1">
        <div className="flex justify-between">
          <dt>{t('orders.details.totals.subtotal')}</dt>
          <dd>{formatOrderMoney(order.subtotal)}</dd>
        </div>
        {discountTotal > 0 ? (
          <div className="flex justify-between">
            <dt>{t('orders.details.items.discount')}</dt>
            <dd>−{formatOrderMoney(discountTotal.toFixed(2))}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt>{t('orders.details.totals.deliveryCost')}</dt>
          <dd>
            {isZeroAmount(order.deliveryCost)
              ? t('orders.details.totals.free')
              : formatOrderMoney(order.deliveryCost)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-black pt-1 text-sm font-bold">
          <dt>{t('orders.details.totals.total')}</dt>
          <dd>{formatOrderMoney(order.total)}</dd>
        </div>
      </dl>

      {order.customerComment ? (
        <section>
          <p className="font-semibold">{t('orders.details.customerComment')}</p>
          <p className="whitespace-pre-wrap">{order.customerComment}</p>
        </section>
      ) : null}
    </article>
  )
}
