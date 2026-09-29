import { Button, Switch } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Notification } from '../../../domain/notifications/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface NotificationsTableProps {
  items: Notification[]
  locale: Locale
  isMutating: boolean
  onEdit: (notification: Notification) => void
  onDelete: (notification: Notification) => void
  onToggle: (notification: Notification, isActive: boolean) => void
}

function StatusBadge({ notification }: { notification: Notification }) {
  const { t } = useTranslation()

  if (notification.isVisible) {
    return (
      <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
        {t('notifications.status.visible')}
      </span>
    )
  }

  const isExpired = notification.isActive
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        isExpired ? 'bg-danger/10 text-danger' : 'bg-surface-soft text-muted'
      }`}
    >
      {isExpired ? t('notifications.status.expired') : t('notifications.status.hidden')}
    </span>
  )
}

function formatExpiresAt(value: string, locale: Locale): string {
  return new Date(value).toLocaleString(locale === 'ru' ? 'ru-RU' : 'ro-RO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function NotificationsTable({
  items,
  locale,
  isMutating,
  onEdit,
  onDelete,
  onToggle,
}: NotificationsTableProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full rounded-xl border border-field-border bg-white p-6">
      <div className="flex w-full items-center border-b border-field-border pb-3">
        <p className="w-[70px] shrink-0 text-[13px] font-bold text-muted" />
        <p className="min-w-0 flex-1 text-[13px] font-bold text-muted">
          {t('notifications.columns.message')}
        </p>
        <p className="w-[130px] shrink-0 text-[13px] font-bold text-muted">
          {t('notifications.columns.status')}
        </p>
        <p className="w-[180px] shrink-0 text-[13px] font-bold text-muted">
          {t('notifications.columns.expires')}
        </p>
        <p className="w-[100px] shrink-0 text-center text-[13px] font-bold text-muted">
          {t('notifications.columns.actions')}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {items.map((notification) => (
          <motion.div
            key={notification.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex w-full items-center border-b border-field-border py-3 last:border-b-0"
          >
            <div className="w-[70px] shrink-0">
              <Switch
                isSelected={notification.isActive}
                isDisabled={isMutating}
                onChange={(selected) => onToggle(notification, selected)}
                aria-label={
                  notification.isActive
                    ? t('notifications.actions.hide')
                    : t('notifications.actions.show')
                }
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-4">
              <p className="truncate text-sm font-semibold text-accent">
                {notification.message[locale]}
              </p>
              <p className="truncate text-xs text-muted">
                {notification.message[locale === 'ro' ? 'ru' : 'ro']}
              </p>
            </div>
            <div className="w-[130px] shrink-0">
              <StatusBadge notification={notification} />
            </div>
            <p className="w-[180px] shrink-0 text-sm text-accent">
              {notification.expiresAt
                ? formatExpiresAt(notification.expiresAt, locale)
                : t('notifications.neverExpires')}
            </p>
            <div className="flex w-[100px] shrink-0 items-center justify-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                isDisabled={isMutating}
                aria-label={t('notifications.actions.edit')}
                onPress={() => onEdit(notification)}
              >
                <svg className="size-4 text-accent" aria-hidden="true">
                  <use href="/icons.svg#pencil-icon" />
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                isDisabled={isMutating}
                aria-label={t('notifications.actions.delete')}
                onPress={() => onDelete(notification)}
              >
                <svg className="size-4 text-danger" aria-hidden="true">
                  <use href="/icons.svg#trash-icon" />
                </svg>
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
