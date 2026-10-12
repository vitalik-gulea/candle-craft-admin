import { Alert, Button, Chip, Spinner, Tabs, toast } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect } from 'react'
import {
  TELEGRAM_SUBSCRIBER_STATUSES,
  type TelegramSubscriberDecision,
  type TelegramSubscriberStatus,
} from '../../../domain/telegram/types'
import { useTranslation } from '../../../shared/i18n'
import { TelegramSubscribersTable } from '../../features/telegram/TelegramSubscribersTable'
import { TELEGRAM_PAGE_SIZE, useTelegramStore } from '../../stores/telegram.store'

function mapErrorMessage(code: string | null, t: (key: string) => string): string | null {
  if (!code) return null
  if (code === 'FORBIDDEN') return t('telegram.errors.forbidden')
  if (code === 'VALIDATION') return t('telegram.errors.validation')
  return t('telegram.errors.unknown')
}

export function TelegramPage() {
  const { t, locale } = useTranslation()
  const items = useTelegramStore((state) => state.items)
  const total = useTelegramStore((state) => state.total)
  const filters = useTelegramStore((state) => state.filters)
  const pendingCount = useTelegramStore((state) => state.pendingCount)
  const isLoading = useTelegramStore((state) => state.isLoading)
  const mutatingId = useTelegramStore((state) => state.mutatingId)
  const errorCode = useTelegramStore((state) => state.errorCode)
  const load = useTelegramStore((state) => state.load)
  const loadPendingCount = useTelegramStore((state) => state.loadPendingCount)
  const changeStatus = useTelegramStore((state) => state.changeStatus)

  const status = filters.status ?? 'pending'

  useEffect(() => {
    void load()
    void loadPendingCount()
  }, [load, loadPendingCount])

  const changeTab = useCallback(
    (next: TelegramSubscriberStatus) => {
      void load({ status: next, page: 1, limit: TELEGRAM_PAGE_SIZE })
    },
    [load],
  )

  const changePage = useCallback(
    (page: number) => {
      void load({ ...filters, page })
    },
    [load, filters],
  )

  const handleDecision = useCallback(
    async (id: string, decision: TelegramSubscriberDecision) => {
      const result = await changeStatus(id, decision)
      if (result === 'ok') toast.success(t('telegram.toasts.statusChanged'))
      else if (result === 'conflict') toast.danger(t('telegram.toasts.statusConflict'))
      else toast.danger(t('telegram.errors.unknown'))
    },
    [changeStatus, t],
  )

  const errorMessage = mapErrorMessage(errorCode, t)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[32px] font-bold text-accent">{t('telegram.title')}</h1>
        <p className="text-sm text-muted">{t('telegram.subtitle')}</p>
      </div>

      <Tabs
        selectedKey={status}
        onSelectionChange={(key) => changeTab(String(key) as TelegramSubscriberStatus)}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label={t('telegram.title')}>
            {TELEGRAM_SUBSCRIBER_STATUSES.map((item) => (
              <Tabs.Tab key={item} id={item}>
                <span className="flex items-center gap-2">
                  {t(`telegram.tabs.${item}`)}
                  {item === 'pending' && pendingCount > 0 ? (
                    <Chip size="sm" className="bg-warning! text-ink!">
                      {pendingCount}
                    </Chip>
                  ) : null}
                </span>
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      <AnimatePresence>
        {errorMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>{errorMessage}</Alert.Title>
              </Alert.Content>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {isLoading && items.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        errorMessage ? null : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-field-border bg-white/60">
            <p className="text-accent">{t('telegram.empty')}</p>
            <Button variant="secondary" onPress={() => void load()}>
              {t('common.retry')}
            </Button>
          </div>
        )
      ) : (
        <div className={isLoading ? 'pointer-events-none opacity-60 transition-opacity' : undefined}>
          <TelegramSubscribersTable
            items={items}
            total={total}
            page={filters.page ?? 1}
            limit={filters.limit ?? TELEGRAM_PAGE_SIZE}
            locale={locale}
            mutatingId={mutatingId}
            onPageChange={changePage}
            onDecision={(id, decision) => void handleDecision(id, decision)}
          />
        </div>
      )}
    </motion.div>
  )
}
