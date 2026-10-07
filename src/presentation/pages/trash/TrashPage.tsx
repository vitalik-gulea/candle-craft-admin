import { Alert, Button, Spinner, Tabs, toast } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { TrashItem, TrashItemType } from '../../../domain/trash/types'
import { useTranslation } from '../../../shared/i18n'
import { PermanentDeleteModal } from '../../features/trash/PermanentDeleteModal'
import { TrashList } from '../../features/trash/TrashList'
import { useTrashStore, type TrashActionResult } from '../../stores/trash.store'

type TypeTab = 'all' | TrashItemType

const TABS: TypeTab[] = ['all', 'product', 'category']

function mapErrorMessage(code: string | null, t: (key: string) => string): string | null {
  if (!code) return null
  if (code === 'FORBIDDEN') return t('trash.errors.forbidden')
  return t('trash.errors.unknown')
}

export function TrashPage() {
  const { t, locale } = useTranslation()
  const items = useTrashStore((state) => state.items)
  const type = useTrashStore((state) => state.type)
  const isLoading = useTrashStore((state) => state.isLoading)
  const isMutating = useTrashStore((state) => state.isMutating)
  const errorCode = useTrashStore((state) => state.errorCode)
  const errorDetails = useTrashStore((state) => state.errorDetails)
  const load = useTrashStore((state) => state.load)
  const setType = useTrashStore((state) => state.setType)
  const restore = useTrashStore((state) => state.restore)
  const permanentlyDelete = useTrashStore((state) => state.permanentlyDelete)

  const [pendingDelete, setPendingDelete] = useState<TrashItem | null>(null)

  useEffect(() => {
    void load()
  }, [load])

  function notify(result: TrashActionResult, successKey: string) {
    if (result === 'ok') toast.success(t(successKey))
    else if (result === 'notFound') toast.danger(t('trash.errors.notFound'))
    else toast.danger(useTrashStore.getState().actionDetails ?? t('trash.errors.unknown'))
  }

  async function handleRestore(item: TrashItem) {
    notify(await restore(item), 'trash.toasts.restored')
  }

  async function handleConfirmDelete(item: TrashItem, redirectTargetId?: string) {
    const result = await permanentlyDelete(item, redirectTargetId)
    setPendingDelete(null)
    notify(result, 'trash.toasts.deleted')
  }

  const errorMessage = mapErrorMessage(errorCode, t)
  const detailsText = Array.isArray(errorDetails) ? errorDetails.join(', ') : errorDetails

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[32px] font-bold text-accent">{t('nav.trash')}</h1>
        <p className="text-sm text-muted">{t('trash.subtitle')}</p>
      </div>

      <Tabs
        selectedKey={type ?? 'all'}
        onSelectionChange={(key) => void setType(key === 'all' ? null : (key as TrashItemType))}
        className="w-fit"
      >
        <Tabs.ListContainer className="rounded-md! border! border-field-border! bg-white! shadow-none!">
          <Tabs.List aria-label={t('trash.filters.label')} className="gap-0.5! p-1!">
            {TABS.map((tab) => (
              <Tabs.Tab
                key={tab}
                id={tab}
                className="h-8! rounded-md! px-3! text-sm! font-semibold! text-accent! opacity-100! hover:opacity-100! data-[hovered=true]:opacity-100! data-[selected=true]:text-white!"
              >
                {t(`trash.filters.${tab}`)}
                <Tabs.Indicator className="rounded-md! bg-accent! shadow-none!" />
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
            <Alert
              status="danger"
              className="rounded-md! border! border-danger/25! bg-white! text-danger! shadow-none!"
            >
              <Alert.Content>
                <Alert.Title className="text-danger!">{errorMessage}</Alert.Title>
                {detailsText ? (
                  <Alert.Description className="text-ink!">{detailsText}</Alert.Description>
                ) : null}
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
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-field-border bg-white">
          <p className="text-sm text-ink">{t('trash.empty')}</p>
          {errorMessage ? (
            <Button
              variant="outline"
              onPress={() => void load()}
              className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
            >
              {t('common.retry')}
            </Button>
          ) : null}
        </div>
      ) : (
        <TrashList
          items={items}
          locale={locale}
          isMutating={isMutating}
          onRestore={(item) => void handleRestore(item)}
          onPermanentDelete={setPendingDelete}
        />
      )}

      <PermanentDeleteModal
        item={pendingDelete}
        locale={locale}
        isPending={isMutating}
        onClose={() => setPendingDelete(null)}
        onConfirm={(item, redirectTargetId) => void handleConfirmDelete(item, redirectTargetId)}
      />
    </motion.div>
  )
}
