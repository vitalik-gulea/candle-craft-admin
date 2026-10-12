import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { ORDER_STATUSES, type OrderHistoryEntry } from '../../../domain/orders/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import { formatChisinauDateTime } from '../../../shared/utils/chisinau-time'

interface OrderHistoryTimelineProps {
  entries: OrderHistoryEntry[]
  locale: Locale
}

const KNOWN_FIELDS = [
  'status',
  'firstName',
  'lastName',
  'phone',
  'email',
  'deliveryCity',
  'deliveryPostalCode',
  'deliveryAddress',
  'adminComment',
] as const

function isStatusValue(value: string): boolean {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

export function OrderHistoryTimeline({ entries, locale }: OrderHistoryTimelineProps) {
  const { t } = useTranslation()

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [entries],
  )

  function fieldLabel(field: string): string {
    return (KNOWN_FIELDS as readonly string[]).includes(field)
      ? t(`orders.details.history.fields.${field}`)
      : field
  }

  function valueLabel(field: string, value: string | null): string {
    if (value === null || value === '') return t('orders.details.history.emptyValue')
    if (field === 'status' && isStatusValue(value)) return t(`orders.status.${value}`)
    return value
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-field-border bg-white p-6">
      <h2 className="font-heading text-xl font-bold text-accent">
        {t('orders.details.history.title')}
      </h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink">{t('orders.details.history.empty')}</p>
      ) : (
        <ol className="flex flex-col">
          {sorted.map((entry, index) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.03 }}
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              <div className="flex flex-col items-center">
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-accent" />
                <span className="w-px flex-1 bg-field-border" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-xs text-ink">
                  {formatChisinauDateTime(entry.createdAt, locale)} ·{' '}
                  {entry.actorEmail ?? t('orders.details.history.system')}
                </p>
                <p className="text-sm font-semibold text-accent">{fieldLabel(entry.field)}</p>
                <p className="break-words text-sm text-ink">
                  <span className="line-through">{valueLabel(entry.field, entry.oldValue)}</span>
                  {' → '}
                  <span className="font-semibold text-accent">
                    {valueLabel(entry.field, entry.newValue)}
                  </span>
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  )
}
