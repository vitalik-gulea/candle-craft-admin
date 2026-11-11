import { Button, Pagination } from '@heroui/react'
import { motion } from 'framer-motion'
import {
  getAvailableDecisions,
  type TelegramSubscriber,
  type TelegramSubscriberDecision,
  type TelegramSubscriberStatus,
} from '../../../domain/telegram/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import { formatChisinauDateTime } from '../../../shared/utils/chisinau-time'

interface TelegramSubscribersTableProps {
  items: TelegramSubscriber[]
  total: number
  page: number
  limit: number
  locale: Locale
  mutatingId: string | null
  onPageChange: (page: number) => void
  onDecision: (id: string, status: TelegramSubscriberDecision) => void
}

const STATUS_CLASS_NAMES: Record<TelegramSubscriberStatus, string> = {
  pending: 'bg-warning/20 text-ink',
  approved: 'bg-accent text-white',
  rejected: 'bg-danger/10 text-danger',
  revoked: 'bg-muted/20 text-ink',
}

const DECISION_CLASS_NAMES: Record<TelegramSubscriberDecision, string> = {
  approved: 'bg-accent! text-white!',
  rejected: 'border! border-danger! bg-white! text-danger!',
  revoked: 'border! border-danger! bg-white! text-danger!',
}

const headerClassName = 'shrink-0 text-[13px] font-bold text-muted'
const cellClassName = 'shrink-0 truncate text-sm text-accent'

export function TelegramSubscribersTable({
  items,
  total,
  page,
  limit,
  locale,
  mutatingId,
  onPageChange,
  onDecision,
}: TelegramSubscribersTableProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full rounded-xl border border-field-border bg-white">
        <div className="p-4 2xl:p-6">
          <div className="hidden w-full items-center gap-4 border-b border-field-border pb-3 lg:flex">
            <p className={`${headerClassName} min-w-0 flex-1`}>
              {t('telegram.columns.subscriber')}
            </p>
            <p className={`${headerClassName} w-[150px]`}>{t('telegram.columns.username')}</p>
            <p className={`${headerClassName} w-[150px]`}>{t('telegram.columns.createdAt')}</p>
            <p className={`${headerClassName} w-[110px]`}>{t('telegram.columns.status')}</p>
            <p className={`${headerClassName} hidden w-[200px] 2xl:block`}>
              {t('telegram.columns.decidedBy')}
            </p>
            <p className={`${headerClassName} w-[200px]`}>{t('telegram.columns.actions')}</p>
          </div>

          {items.map((subscriber, index) => {
            const isMutating = mutatingId === subscriber.id
            return (
              <motion.div
                key={subscriber.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.02 }}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-field-border py-3 last:border-b-0 lg:flex-nowrap"
              >
                <p className="order-1 min-w-0 flex-1 basis-[calc(100%-140px)] truncate text-sm font-semibold text-accent lg:order-none lg:basis-0">
                  {subscriber.displayName}
                </p>
                <p className={`${cellClassName} order-3 text-xs! lg:order-none lg:w-[150px] lg:text-sm!`}>
                  {subscriber.username ? `@${subscriber.username}` : '—'}
                </p>
                <p className={`${cellClassName} order-4 text-xs! text-muted! lg:order-none lg:w-[150px] lg:text-sm! lg:text-accent!`}>
                  {formatChisinauDateTime(subscriber.createdAt, locale)}
                </p>
                <div className="order-2 shrink-0 lg:order-none lg:w-[110px]">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS_NAMES[subscriber.status]}`}
                  >
                    {t(`telegram.status.${subscriber.status}`)}
                  </span>
                </div>
                <div className="hidden w-[200px] shrink-0 flex-col 2xl:flex">
                  <p className="truncate text-sm text-accent">{subscriber.decidedByEmail ?? '—'}</p>
                  {subscriber.decidedAt ? (
                    <p className="truncate text-xs text-ink">
                      {formatChisinauDateTime(subscriber.decidedAt, locale)}
                    </p>
                  ) : null}
                </div>
                <div className="order-5 flex shrink-0 basis-full items-center gap-2 pt-1 lg:order-none lg:basis-auto lg:w-[200px] lg:pt-0">
                  {getAvailableDecisions(subscriber.status).map((decision) => (
                    <Button
                      key={decision}
                      size="sm"
                      isDisabled={mutatingId !== null}
                      isPending={isMutating}
                      onPress={() => onDecision(subscriber.id, decision)}
                      className={`h-8! rounded-lg! px-3! text-xs! font-semibold! shadow-none! ${DECISION_CLASS_NAMES[decision]}`}
                    >
                      {t(`telegram.actions.${decision}`)}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {totalPages > 1 ? (
        <Pagination className="w-full flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <Pagination.Summary>
            {t('telegram.pagination.summary', {
              from: String(from),
              to: String(to),
              total: String(total),
            })}
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous isDisabled={page === 1} onPress={() => onPageChange(page - 1)}>
                <Pagination.PreviousIcon />
                <span className="hidden sm:inline">{t('telegram.pagination.prev')}</span>
              </Pagination.Previous>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === totalPages}
                onPress={() => onPageChange(page + 1)}
              >
                <span className="hidden sm:inline">{t('telegram.pagination.next')}</span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      ) : null}
    </div>
  )
}
