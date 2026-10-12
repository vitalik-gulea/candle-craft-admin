import type { Order } from '../../../domain/orders/types'
import { useTranslation } from '../../../shared/i18n'

const cardClassName = 'flex flex-col gap-4 rounded-xl border border-field-border bg-white p-6'
const cardTitleClassName = 'font-heading text-xl font-bold text-accent'

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold text-ink">{label}</dt>
      <dd className="break-words text-sm text-accent">{value || '—'}</dd>
    </div>
  )
}

export function OrderCompanyCard({ order }: { order: Order }) {
  const { t } = useTranslation()

  if (!order.isB2b) return null

  return (
    <section className={cardClassName}>
      <h2 className={cardTitleClassName}>{t('orders.details.company.title')}</h2>
      <dl className="flex flex-col gap-3">
        <InfoRow label={t('orders.details.company.name')} value={order.companyName} />
        <InfoRow label={t('orders.details.company.idno')} value={order.companyIdno} />
        <InfoRow label={t('orders.details.company.vatCode')} value={order.companyVatCode} />
        <InfoRow
          label={t('orders.details.company.legalAddress')}
          value={order.companyLegalAddress}
        />
      </dl>
    </section>
  )
}

export function OrderPaymentCard({ order }: { order: Order }) {
  const { t } = useTranslation()

  return (
    <section className={cardClassName}>
      <h2 className={cardTitleClassName}>{t('orders.details.payment.title')}</h2>
      <dl className="flex flex-col gap-3">
        <InfoRow
          label={t('orders.details.payment.method')}
          value={t(`orders.paymentMethod.${order.paymentMethod}`)}
        />
        <InfoRow
          label={t('orders.details.payment.result')}
          value={
            order.paymentMethod === 'online' && order.paymentResult
              ? t(`orders.paymentResult.${order.paymentResult}`)
              : null
          }
        />
      </dl>
    </section>
  )
}

export function OrderSourceCard({ order }: { order: Order }) {
  const { t } = useTranslation()

  return (
    <section className={cardClassName}>
      <h2 className={cardTitleClassName}>{t('orders.details.source.title')}</h2>
      <dl className="flex flex-col gap-3">
        <InfoRow
          label={t('orders.details.source.source')}
          value={t(`orders.source.${order.source}`)}
        />
        <InfoRow label={t('orders.details.source.utmSource')} value={order.utmSource} />
        <InfoRow label={t('orders.details.source.utmMedium')} value={order.utmMedium} />
        <InfoRow label={t('orders.details.source.utmCampaign')} value={order.utmCampaign} />
        <InfoRow label={t('orders.details.source.referrer')} value={order.referrer} />
      </dl>
    </section>
  )
}

export function OrderCustomerCommentCard({ order }: { order: Order }) {
  const { t } = useTranslation()

  return (
    <section className={cardClassName}>
      <h2 className={cardTitleClassName}>{t('orders.details.customerComment')}</h2>
      <p className="whitespace-pre-wrap break-words text-sm text-accent">
        {order.customerComment || '—'}
      </p>
    </section>
  )
}
