import { Button } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TrashItem } from '../../../domain/trash/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface TrashListProps {
  items: TrashItem[]
  locale: Locale
  isMutating: boolean
  onRestore: (item: TrashItem) => void
  onPermanentDelete: (item: TrashItem) => void
}

const DAY_MS = 24 * 60 * 60 * 1000

function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS))
}

function formatDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === 'ro' ? 'ro-RO' : 'ru-RU')
}

export function TrashList({
  items,
  locale,
  isMutating,
  onRestore,
  onPermanentDelete,
}: TrashListProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full rounded-lg border border-field-border bg-white p-4 sm:p-6">
      <div className="hidden w-full items-center border-b border-field-border pb-3 xl:flex">
        <p className="w-[120px] shrink-0 text-[13px] font-bold text-muted">
          {t('trash.columns.type')}
        </p>
        <p className="min-w-0 flex-1 text-[13px] font-bold text-muted">
          {t('trash.columns.name')}
        </p>
        <p className="w-[140px] shrink-0 text-[13px] font-bold text-muted">
          {t('trash.columns.deletedAt')}
        </p>
        <p className="w-[280px] shrink-0 text-[13px] font-bold text-muted">
          {t('trash.columns.purgeIn')}
        </p>
        <p className="w-[280px] shrink-0 text-right text-[13px] font-bold text-muted">
          {t('trash.columns.actions')}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 overflow-hidden border-b border-field-border py-3 last:border-b-0 xl:flex-nowrap xl:gap-0"
          >
            <div className="shrink-0 xl:w-[120px]">
              <span className="inline-flex rounded-md border border-field-border bg-surface-soft px-2 py-1 text-[11px] font-semibold text-ink">
                {t(`trash.types.${item.type}`)}
              </span>
            </div>
            <p className="min-w-0 flex-1 basis-[calc(100%-110px)] truncate text-sm font-semibold text-accent xl:basis-0">
              {item.name[locale]}
            </p>
            <p className="shrink-0 text-xs text-ink xl:w-[140px] xl:text-sm">
              {formatDate(item.deletedAt, locale)}
            </p>
            <p className="min-w-0 text-xs text-ink xl:w-[280px] xl:shrink-0 xl:text-sm">
              {t('trash.purgeInDays', { days: String(daysUntil(item.purgeAt)) })}
            </p>
            <div className="flex shrink-0 basis-full flex-wrap items-center justify-end gap-2 pt-1 xl:w-[280px] xl:basis-auto xl:pt-0">
              <Button
                size="sm"
                variant="outline"
                isDisabled={isMutating}
                onPress={() => onRestore(item)}
                className="h-8! rounded-md! border-field-border! bg-white! px-3! text-[13px]! font-semibold! text-accent! shadow-none!"
              >
                {t('trash.actions.restore')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                isDisabled={isMutating}
                onPress={() => onPermanentDelete(item)}
                className="h-8! rounded-md! border-danger/30! bg-white! px-3! text-[13px]! font-semibold! text-danger! shadow-none!"
              >
                {t('trash.actions.permanentDelete')}
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
