import type { Order } from '../../../domain/orders/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import { formatOrderMoney, hasItemDiscount, isZeroAmount } from './order-display'

interface OrderItemsCardProps {
  order: Order
  locale: Locale
}

const headerClassName = 'shrink-0 text-[13px] font-bold text-muted'

export function OrderItemsCard({ order, locale }: OrderItemsCardProps) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-field-border bg-white p-6">
      <h2 className="font-heading text-xl font-bold text-accent">{t('orders.details.items.title')}</h2>

      <div className="flex w-full flex-col overflow-x-auto">
        <div className="flex min-w-[640px] flex-col">
          <div className="flex w-full items-center gap-4 border-b border-field-border pb-3">
            <p className={`${headerClassName} min-w-0 flex-1`}>
              {t('orders.details.items.product')}
            </p>
            <p className={`${headerClassName} w-[110px]`}>{t('orders.details.items.price')}</p>
            <p className={`${headerClassName} w-[60px] text-center`}>
              {t('orders.details.items.quantity')}
            </p>
            <p className={`${headerClassName} w-[110px] text-right`}>
              {t('orders.details.items.lineTotal')}
            </p>
          </div>

          {order.items.map((item) => {
            const discounted = hasItemDiscount(item)
            return (
              <div
                key={item.id}
                className="flex w-full items-start gap-4 border-b border-field-border py-4 last:border-b-0"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name[locale]}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="size-14 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-surface-soft text-muted">
                      <svg className="size-5" aria-hidden="true">
                        <use href="#image-icon" />
                      </svg>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="text-sm font-semibold text-accent">{item.name[locale]}</p>
                    {item.options.length > 0 ? (
                      <ul className="flex flex-col gap-0.5">
                        {item.options.map((option) => (
                          <li key={`${option.label.ro}-${option.value.ro}`} className="text-xs text-ink">
                            {option.label[locale]}: {option.value[locale]}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {item.sku ? (
                      <p className="text-xs text-ink">
                        {t('orders.details.items.sku')}: {item.sku}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex w-[110px] shrink-0 flex-col gap-0.5">
                  <p className="text-sm font-semibold text-accent">
                    {formatOrderMoney(item.unitPrice)}
                  </p>
                  {discounted ? (
                    <p className="text-xs text-ink line-through">
                      {formatOrderMoney(item.regularUnitPrice)}
                    </p>
                  ) : null}
                </div>
                <p className="w-[60px] shrink-0 text-center text-sm text-accent">
                  {item.quantity}
                </p>
                <p className="w-[110px] shrink-0 text-right text-sm font-semibold text-accent">
                  {formatOrderMoney(item.lineTotal)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <dl className="ms-auto flex w-full max-w-xs flex-col gap-2 border-t border-field-border pt-4">
        <div className="flex justify-between text-sm text-ink">
          <dt>{t('orders.details.totals.subtotal')}</dt>
          <dd className="font-semibold text-accent">{formatOrderMoney(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-sm text-ink">
          <dt>{t('orders.details.totals.deliveryCost')}</dt>
          <dd className="font-semibold text-accent">
            {isZeroAmount(order.deliveryCost)
              ? t('orders.details.totals.free')
              : formatOrderMoney(order.deliveryCost)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-field-border pt-2 text-base">
          <dt className="font-semibold text-accent">{t('orders.details.totals.total')}</dt>
          <dd className="font-bold text-accent">{formatOrderMoney(order.total)}</dd>
        </div>
      </dl>
    </section>
  )
}
