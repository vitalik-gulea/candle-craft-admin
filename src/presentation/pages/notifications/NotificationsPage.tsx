import { Alert, Button, Modal, Spinner } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Notification } from '../../../domain/notifications/types'
import { useTranslation } from '../../../shared/i18n'
import { NotificationModal } from '../../features/notifications/NotificationModal'
import { NotificationsTable } from '../../features/notifications/NotificationsTable'
import { useNotificationsStore } from '../../stores/notifications.store'

export function NotificationsPage() {
  const { t, locale } = useTranslation()
  const items = useNotificationsStore((state) => state.items)
  const isLoading = useNotificationsStore((state) => state.isLoading)
  const isMutating = useNotificationsStore((state) => state.isMutating)
  const errorCode = useNotificationsStore((state) => state.errorCode)
  const load = useNotificationsStore((state) => state.load)
  const update = useNotificationsStore((state) => state.update)
  const remove = useNotificationsStore((state) => state.remove)
  const clearError = useNotificationsStore((state) => state.clearError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Notification | null>(null)
  const [deleting, setDeleting] = useState<Notification | null>(null)

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setIsModalOpen(true)
  }

  function openEdit(notification: Notification) {
    setEditing(notification)
    setIsModalOpen(true)
  }

  const errorMessage =
    errorCode && !isModalOpen
      ? errorCode === 'NOT_FOUND'
        ? t('notifications.errors.notFound')
        : errorCode === 'FORBIDDEN'
          ? t('notifications.errors.forbidden')
          : errorCode === 'VALIDATION'
            ? t('notifications.errors.validation')
            : t('notifications.errors.unknown')
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted">{t('notifications.breadcrumbManagement')}</p>
            <svg className="size-3 text-muted" aria-hidden="true">
              <use href="#chevron-right-icon" />
            </svg>
            <p className="text-sm font-medium text-accent">{t('nav.notifications')}</p>
          </div>
          <h1 className="font-heading text-[32px] font-bold text-accent">
            {t('nav.notifications')}
          </h1>
        </div>
        {items.length > 0 ? (
          <Button
            onPress={openCreate}
            className="gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-white"
          >
            <svg className="size-4" aria-hidden="true">
              <use href="#plus-icon" />
            </svg>
            {t('notifications.add')}
          </Button>
        ) : null}
      </div>

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

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-field-border bg-white/60 px-6 text-center">
          <p className="font-heading text-xl font-bold text-accent">
            {t('notifications.empty.title')}
          </p>
          <p className="max-w-md text-sm text-muted">{t('notifications.empty.hint')}</p>
          <Button
            onPress={openCreate}
            className="gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-white"
          >
            <svg className="size-4" aria-hidden="true">
              <use href="#plus-icon" />
            </svg>
            {t('notifications.addFirst')}
          </Button>
        </div>
      ) : (
        <NotificationsTable
          items={items}
          locale={locale}
          isMutating={isMutating}
          onEdit={openEdit}
          onDelete={setDeleting}
          onToggle={(notification, isActive) => {
            clearError()
            void update(notification.id, { isActive })
          }}
        />
      )}

      <NotificationModal
        isOpen={isModalOpen}
        notification={editing}
        onClose={() => setIsModalOpen(false)}
      />

      <Modal.Backdrop
        isOpen={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="w-full max-w-md rounded-lg! border! border-field-border! bg-white! p-6! shadow-none!">
            {deleting ? (
              <>
                <Modal.Header>
                  <Modal.Heading className="font-heading text-2xl font-bold text-accent">
                    {t('notifications.delete.title')}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="pt-4">
                  <p className="text-sm text-ink">
                    {t('notifications.delete.confirm', { name: deleting.message[locale] })}
                  </p>
                </Modal.Body>
                <Modal.Footer className="flex justify-end gap-3 pt-6">
                  <Button
                    variant="outline"
                    isDisabled={isMutating}
                    onPress={() => setDeleting(null)}
                    className="h-9! rounded-md! border-field-border! bg-white! px-4! text-sm! font-semibold! text-accent! shadow-none!"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    isDisabled={isMutating}
                    onPress={async () => {
                      clearError()
                      await remove(deleting.id)
                      setDeleting(null)
                    }}
                    className="h-9! rounded-md! bg-danger! px-4! text-sm! font-semibold! text-white! shadow-none!"
                  >
                    {t('notifications.actions.delete')}
                  </Button>
                </Modal.Footer>
              </>
            ) : null}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </motion.div>
  )
}
