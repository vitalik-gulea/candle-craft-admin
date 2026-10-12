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
      <div className="w-full overflow-x-auto rounded-xl border border-field-border bg-white">
        <div className="min-w-[1000px] p-6">
          <div className="flex w-full items-center gap-4 border-b border-field-border pb-3">
            <p className={`${headerClassName} min-w-[180px] flex-1`}>
              {t('telegram.columns.subscriber')}
            </p>
            <p className={`${headerClassName} w-[150px]`}>{t('telegram.columns.username')}</p>
            <p className={`${headerClassName} w-[150px]`}>{t('telegram.columns.createdAt')}</p>
            <p className={`${headerClassName} w-[110px]`}>{t('telegram.columns.status')}</p>
            <p className={`${headerClassName} w-[200px]`}>{t('telegram.columns.decidedBy')}</p>
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
                className="flex w-full items-center gap-4 border-b border-field-border py-3 last:border-b-0"
              >
                <p className="min-w-[180px] flex-1 truncate text-sm font-semibold text-accent">
                  {subscriber.displayName}
                </p>
                <p className={`${cellClassName} w-[150px]`}>
                  {subscriber.username ? `@${subscriber.username}` : '—'}
                </p>
                <p className={`${cellClassName} w-[150px]`}>
                  {formatChisinauDateTime(subscriber.createdAt, locale)}
                </p>
                <div className="w-[110px] shrink-0">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS_NAMES[subscriber.status]}`}
                  >
                    {t(`telegram.status.${subscriber.status}`)}
                  </span>
                </div>
                <div className="flex w-[200px] shrink-0 flex-col">
                  <p className="truncate text-sm text-accent">{subscriber.decidedByEmail ?? '—'}</p>
                  {subscriber.decidedAt ? (
                    <p className="truncate text-xs text-ink">
                      {formatChisinauDateTime(subscriber.decidedAt, locale)}
                    </p>
                  ) : null}
                </div>
                <div className="flex w-[200px] shrink-0 items-center gap-2">
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
        <Pagination className="w-full justify-between">
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
                {t('telegram.pagination.prev')}
              </Pagination.Previous>
            </Pagination.Item>
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === totalPages}
                onPress={() => onPageChange(page + 1)}
              >
                {t('telegram.pagination.next')}
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      ) : null}
    </div>
  )
}
