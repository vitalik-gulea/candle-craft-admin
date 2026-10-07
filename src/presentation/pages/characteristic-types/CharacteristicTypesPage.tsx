import { Alert, Button, Spinner } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { CharacteristicType } from '../../../domain/characteristic-types/types'
import { useTranslation } from '../../../shared/i18n'
import { CharacteristicTypeModal } from '../../features/characteristic-types/CharacteristicTypeModal'
import { CharacteristicTypesTable } from '../../features/characteristic-types/CharacteristicTypesTable'
import { useCharacteristicTypesStore } from '../../stores/characteristic-types.store'

export function CharacteristicTypesPage() {
  const { t } = useTranslation()
  const items = useCharacteristicTypesStore((state) => state.items)
  const isLoading = useCharacteristicTypesStore((state) => state.isLoading)
  const isMutating = useCharacteristicTypesStore((state) => state.isMutating)
  const errorCode = useCharacteristicTypesStore((state) => state.errorCode)
  const load = useCharacteristicTypesStore((state) => state.load)
  const disable = useCharacteristicTypesStore((state) => state.disable)
  const enable = useCharacteristicTypesStore((state) => state.enable)
  const reorder = useCharacteristicTypesStore((state) => state.reorder)
  const clearError = useCharacteristicTypesStore((state) => state.clearError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<CharacteristicType | null>(null)

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditingType(null)
    setIsModalOpen(true)
  }

  function openEdit(type: CharacteristicType) {
    setEditingType(type)
    setIsModalOpen(true)
  }

  const nextSortOrder = items.reduce((max, item) => Math.max(max, item.sortOrder + 1), 0)
  const errorMessage =
    errorCode && !isModalOpen
      ? errorCode === 'NOT_FOUND'
        ? t('characteristicTypes.errors.notFound')
        : errorCode === 'FORBIDDEN'
          ? t('characteristicTypes.errors.forbidden')
          : errorCode === 'VALIDATION'
            ? t('characteristicTypes.errors.validation')
            : t('characteristicTypes.errors.unknown')
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
            <p className="text-sm text-muted">{t('characteristicTypes.breadcrumbCatalog')}</p>
            <svg className="size-3 text-muted" aria-hidden="true">
              <use href="#chevron-right-icon" />
            </svg>
            <p className="text-sm font-medium text-accent">{t('nav.characteristicTypes')}</p>
          </div>
          <h1 className="font-heading text-[32px] font-bold text-accent">
            {t('nav.characteristicTypes')}
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
            {t('characteristicTypes.add')}
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
            {t('characteristicTypes.empty.title')}
          </p>
          <p className="max-w-md text-sm text-muted">{t('characteristicTypes.empty.hint')}</p>
          <Button
            onPress={openCreate}
            className="gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-white"
          >
            <svg className="size-4" aria-hidden="true">
              <use href="#plus-icon" />
            </svg>
            {t('characteristicTypes.addFirst')}
          </Button>
        </div>
      ) : (
        <CharacteristicTypesTable
          items={items}
          isMutating={isMutating}
          onEdit={openEdit}
          onDisable={(type) => {
            clearError()
            void disable(type.id)
          }}
          onEnable={(type) => {
            clearError()
            void enable(type.id)
          }}
          onReorder={(ids) => {
            clearError()
            void reorder(ids)
          }}
        />
      )}

      <CharacteristicTypeModal
        isOpen={isModalOpen}
        type={editingType}
        defaultSortOrder={nextSortOrder}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  )
}
