import { Button } from '@heroui/react'
import { Reorder, useDragControls } from 'framer-motion'
import { useState } from 'react'
import type { UnitOfSale } from '../../../domain/units-of-sale/types'
import { useTranslation } from '../../../shared/i18n'

interface UnitsOfSaleTableProps {
  items: UnitOfSale[]
  isMutating: boolean
  onEdit: (unit: UnitOfSale) => void
  onDisable: (unit: UnitOfSale) => void
  onEnable: (unit: UnitOfSale) => void
  onReorder: (orderedIds: string[]) => void
}

interface UnitRowProps {
  unit: UnitOfSale
  isMutating: boolean
  onEdit: (unit: UnitOfSale) => void
  onDisable: (unit: UnitOfSale) => void
  onEnable: (unit: UnitOfSale) => void
  onDragEnd: () => void
}

function UnitRow({ unit, isMutating, onEdit, onDisable, onEnable, onDragEnd }: UnitRowProps) {
  const { t } = useTranslation()
  const controls = useDragControls()

  return (
    <Reorder.Item
      as="div"
      value={unit}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      className={`relative flex w-full items-center border-b border-field-border bg-white py-3 last:border-b-0 ${
        unit.isActive ? '' : 'opacity-60'
      }`}
    >
      <button
        type="button"
        aria-label={t('unitsOfSale.dragHandle')}
        onPointerDown={(event) => controls.start(event)}
        className="w-10 shrink-0 cursor-grab touch-none text-muted active:cursor-grabbing"
      >
        <svg className="mx-auto size-5" aria-hidden="true">
          <use href="#grip-vertical-icon" />
        </svg>
      </button>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-accent">{unit.name.ro}</p>
      <p className="min-w-0 flex-1 truncate text-sm text-accent">{unit.name.ru}</p>
      <div className="w-[140px] shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 text-sm ${
            unit.isActive ? 'font-medium text-accent' : 'text-muted'
          }`}
        >
          <span
            className={`size-2 rounded-full ${unit.isActive ? 'bg-accent' : 'border border-muted'}`}
          />
          {unit.isActive ? t('unitsOfSale.status.active') : t('unitsOfSale.status.disabled')}
        </span>
      </div>
      <div className="flex w-[100px] shrink-0 items-center justify-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          isDisabled={isMutating}
          aria-label={t('unitsOfSale.actions.edit')}
          onPress={() => onEdit(unit)}
        >
          <svg className="size-4 text-accent" aria-hidden="true">
            <use href="#pencil-icon" />
          </svg>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          isDisabled={isMutating}
          aria-label={
            unit.isActive ? t('unitsOfSale.actions.disable') : t('unitsOfSale.actions.enable')
          }
          onPress={() => (unit.isActive ? onDisable(unit) : onEnable(unit))}
        >
          <svg className="size-4 text-accent" aria-hidden="true">
            <use href={`#${unit.isActive ? 'power-icon' : 'rotate-ccw-icon'}`} />
          </svg>
        </Button>
      </div>
    </Reorder.Item>
  )
}

export function UnitsOfSaleTable({
  items,
  isMutating,
  onEdit,
  onDisable,
  onEnable,
  onReorder,
}: UnitsOfSaleTableProps) {
  const { t } = useTranslation()
  const [order, setOrder] = useState(items)
  const [knownItems, setKnownItems] = useState(items)

  if (items !== knownItems) {
    setKnownItems(items)
    setOrder(items)
  }

  return (
    <div className="w-full rounded-xl border border-field-border bg-white p-6">
      <div className="flex w-full items-center border-b border-field-border pb-3">
        <div className="w-10 shrink-0" />
        <p className="min-w-0 flex-1 text-[13px] font-bold text-muted">
          {t('unitsOfSale.columns.ro')}
        </p>
        <p className="min-w-0 flex-1 text-[13px] font-bold text-muted">
          {t('unitsOfSale.columns.ru')}
        </p>
        <p className="w-[140px] shrink-0 text-[13px] font-bold text-muted">
          {t('unitsOfSale.columns.status')}
        </p>
        <p className="w-[100px] shrink-0 text-center text-[13px] font-bold text-muted">
          {t('unitsOfSale.columns.actions')}
        </p>
      </div>

      <Reorder.Group as="div" axis="y" values={order} onReorder={setOrder}>
        {order.map((unit) => (
          <UnitRow
            key={unit.id}
            unit={unit}
            isMutating={isMutating}
            onEdit={onEdit}
            onDisable={onDisable}
            onEnable={onEnable}
            onDragEnd={() => onReorder(order.map((item) => item.id))}
          />
        ))}
      </Reorder.Group>
    </div>
  )
}
