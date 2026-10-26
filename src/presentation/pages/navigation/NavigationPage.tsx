import { Alert, Button, Spinner } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { NavigationItem } from '../../../domain/navigation/types'
import { useTranslation } from '../../../shared/i18n'
import { DeleteNavigationItemModal } from '../../features/navigation/DeleteNavigationItemModal'
import { NavigationItemModal } from '../../features/navigation/NavigationItemModal'
import { NavigationOrderList } from '../../features/navigation/NavigationOrderList'
import { useNavigationStore } from '../../stores/navigation.store'

export function NavigationPage() {
  const { t, locale } = useTranslation()
  const items = useNavigationStore((state) => state.items)
  const isLoading = useNavigationStore((state) => state.isLoading)
  const isMutating = useNavigationStore((state) => state.isMutating)
  const errorCode = useNavigationStore((state) => state.errorCode)
  const load = useNavigationStore((state) => state.load)
  const remove = useNavigationStore((state) => state.remove)
  const reorder = useNavigationStore((state) => state.reorder)
  const clearError = useNavigationStore((state) => state.clearError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<NavigationItem | null>(null)

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    clearError()
    setEditingItem(null)
    setIsModalOpen(true)
  }

  function openEdit(item: NavigationItem) {
    clearError()
    setEditingItem(item)
    setIsModalOpen(true)
  }

  async function confirmDelete(item: NavigationItem) {
    await remove(item.id)
    setDeletingItem(null)
  }

  const errorMessage =
    errorCode && !isModalOpen
      ? errorCode === 'NOT_FOUND'
        ? t('navigation.errors.notFound')
        : errorCode === 'FORBIDDEN'
          ? t('navigation.errors.forbidden')
          : errorCode === 'VALIDATION'
            ? t('navigation.errors.validation')
            : t('navigation.errors.unknown')
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex w-full flex-col gap-8"
    >
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-[32px] font-bold text-accent">{t('nav.navigation')}</h1>
          <p className="text-sm text-muted">{t('navigation.subtitle')}</p>
        </div>
        <Button
          onPress={openCreate}
          className="gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-white"
        >
          <svg className="size-4" aria-hidden="true">
            <use href="#plus-icon" />
          </svg>
          {t('navigation.add')}
        </Button>
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
                <Alert.Description>{errorMessage}</Alert.Description>
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
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-field-border bg-white/60">
          <p className="text-accent">{t('navigation.empty')}</p>
        </div>
      ) : (
        <NavigationOrderList
          items={items}
          locale={locale}
          isDisabled={isMutating}
          onCommit={(orderedIds) => void reorder(orderedIds)}
          onEdit={openEdit}
          onDelete={setDeletingItem}
        />
      )}

      <NavigationItemModal
        isOpen={isModalOpen}
        item={editingItem}
        onClose={() => setIsModalOpen(false)}
      />

      <DeleteNavigationItemModal
        item={deletingItem}
        locale={locale}
        isPending={isMutating}
        onClose={() => setDeletingItem(null)}
        onConfirm={(item) => void confirmDelete(item)}
      />
    </motion.div>
  )
}
