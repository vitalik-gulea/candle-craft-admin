import { Alert, Button, Spinner } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { UnitOfSale } from '../../../domain/units-of-sale/types'
import { useTranslation } from '../../../shared/i18n'
import { UnitOfSaleModal } from '../../features/units-of-sale/UnitOfSaleModal'
import { UnitsOfSaleTable } from '../../features/units-of-sale/UnitsOfSaleTable'
import { useUnitsOfSaleStore } from '../../stores/units-of-sale.store'

export function UnitsOfSalePage() {
  const { t } = useTranslation()
  const items = useUnitsOfSaleStore((state) => state.items)
  const isLoading = useUnitsOfSaleStore((state) => state.isLoading)
  const isMutating = useUnitsOfSaleStore((state) => state.isMutating)
  const errorCode = useUnitsOfSaleStore((state) => state.errorCode)
  const load = useUnitsOfSaleStore((state) => state.load)
  const disable = useUnitsOfSaleStore((state) => state.disable)
  const enable = useUnitsOfSaleStore((state) => state.enable)
  const reorder = useUnitsOfSaleStore((state) => state.reorder)
  const clearError = useUnitsOfSaleStore((state) => state.clearError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<UnitOfSale | null>(null)

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditingUnit(null)
    setIsModalOpen(true)
  }

  function openEdit(unit: UnitOfSale) {
    setEditingUnit(unit)
    setIsModalOpen(true)
  }

  const nextSortOrder = items.reduce((max, item) => Math.max(max, item.sortOrder + 1), 0)
  const errorMessage =
    errorCode && !isModalOpen
      ? errorCode === 'NOT_FOUND'
        ? t('unitsOfSale.errors.notFound')
        : errorCode === 'FORBIDDEN'
          ? t('unitsOfSale.errors.forbidden')
          : errorCode === 'VALIDATION'
            ? t('unitsOfSale.errors.validation')
            : t('unitsOfSale.errors.unknown')
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
            <p className="text-sm text-muted">{t('unitsOfSale.breadcrumbCatalog')}</p>
            <svg className="size-3 text-muted" aria-hidden="true">
              <use href="/icons.svg#chevron-right-icon" />
            </svg>
            <p className="text-sm font-medium text-accent">{t('nav.unitsOfSale')}</p>
          </div>
          <h1 className="font-heading text-[32px] font-bold text-accent">
            {t('nav.unitsOfSale')}
          </h1>
        </div>
        {items.length > 0 ? (
          <Button
            onPress={openCreate}
            className="gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-white"
          >
            <svg className="size-4" aria-hidden="true">
              <use href="/icons.svg#plus-icon" />
            </svg>
            {t('unitsOfSale.add')}
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
            {t('unitsOfSale.empty.title')}
          </p>
          <p className="max-w-md text-sm text-muted">{t('unitsOfSale.empty.hint')}</p>
          <Button
            onPress={openCreate}
            className="gap-2 rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-white"
          >
            <svg className="size-4" aria-hidden="true">
              <use href="/icons.svg#plus-icon" />
            </svg>
            {t('unitsOfSale.addFirst')}
          </Button>
        </div>
      ) : (
        <UnitsOfSaleTable
          items={items}
          isMutating={isMutating}
          onEdit={openEdit}
          onDisable={(unit) => {
            clearError()
            void disable(unit.id)
          }}
          onEnable={(unit) => {
            clearError()
            void enable(unit.id)
          }}
          onReorder={(ids) => {
            clearError()
            void reorder(ids)
          }}
        />
      )}

      <UnitOfSaleModal
        isOpen={isModalOpen}
        unit={editingUnit}
        defaultSortOrder={nextSortOrder}
        onClose={() => setIsModalOpen(false)}
      />
    </motion.div>
  )
}
