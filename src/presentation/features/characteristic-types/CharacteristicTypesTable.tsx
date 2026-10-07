import { Button } from '@heroui/react'
import { Reorder, useDragControls } from 'framer-motion'
import { useState } from 'react'
import type { CharacteristicType } from '../../../domain/characteristic-types/types'
import { useTranslation } from '../../../shared/i18n'

interface CharacteristicTypesTableProps {
  items: CharacteristicType[]
  isMutating: boolean
  onEdit: (type: CharacteristicType) => void
  onDisable: (type: CharacteristicType) => void
  onEnable: (type: CharacteristicType) => void
  onReorder: (orderedIds: string[]) => void
}

interface TypeRowProps {
  type: CharacteristicType
  isMutating: boolean
  onEdit: (type: CharacteristicType) => void
  onDisable: (type: CharacteristicType) => void
  onEnable: (type: CharacteristicType) => void
  onDragEnd: () => void
}

function TypeRow({ type, isMutating, onEdit, onDisable, onEnable, onDragEnd }: TypeRowProps) {
  const { t } = useTranslation()
  const controls = useDragControls()

  return (
    <Reorder.Item
      as="div"
      value={type}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      className={`relative flex w-full items-center border-b border-field-border bg-white py-3 last:border-b-0 ${
        type.isActive ? '' : 'opacity-60'
      }`}
    >
      <button
        type="button"
        aria-label={t('characteristicTypes.dragHandle')}
        onPointerDown={(event) => controls.start(event)}
        className="w-10 shrink-0 cursor-grab touch-none text-muted active:cursor-grabbing"
      >
        <svg className="mx-auto size-5" aria-hidden="true">
          <use href="#grip-vertical-icon" />
        </svg>
      </button>
      <p className="w-[140px] shrink-0 truncate text-sm text-muted">{type.key}</p>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-accent">{type.labelRo}</p>
      <p className="min-w-0 flex-1 truncate text-sm text-accent">{type.labelRu}</p>
      <p className="w-[80px] shrink-0 truncate text-sm text-accent">{type.unit ?? '—'}</p>
      <div className="w-[140px] shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 text-sm ${
            type.isActive ? 'font-medium text-accent' : 'text-muted'
          }`}
        >
          <span
            className={`size-2 rounded-full ${type.isActive ? 'bg-accent' : 'border border-muted'}`}
          />
          {type.isActive
            ? t('characteristicTypes.status.active')
            : t('characteristicTypes.status.disabled')}
        </span>
      </div>
      <div className="flex w-[100px] shrink-0 items-center justify-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          isDisabled={isMutating}
          aria-label={t('characteristicTypes.actions.edit')}
          onPress={() => onEdit(type)}
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
            type.isActive
              ? t('characteristicTypes.actions.disable')
              : t('characteristicTypes.actions.enable')
          }
          onPress={() => (type.isActive ? onDisable(type) : onEnable(type))}
        >
          <svg className="size-4 text-accent" aria-hidden="true">
            <use href={`#${type.isActive ? 'power-icon' : 'rotate-ccw-icon'}`} />
          </svg>
        </Button>
      </div>
    </Reorder.Item>
  )
}

export function CharacteristicTypesTable({
  items,
  isMutating,
  onEdit,
  onDisable,
  onEnable,
  onReorder,
}: CharacteristicTypesTableProps) {
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
        <p className="w-[140px] shrink-0 text-[13px] font-bold text-muted">
          {t('characteristicTypes.columns.key')}
        </p>
        <p className="min-w-0 flex-1 text-[13px] font-bold text-muted">
          {t('characteristicTypes.columns.ro')}
        </p>
        <p className="min-w-0 flex-1 text-[13px] font-bold text-muted">
          {t('characteristicTypes.columns.ru')}
        </p>
        <p className="w-[80px] shrink-0 text-[13px] font-bold text-muted">
          {t('characteristicTypes.columns.unit')}
        </p>
        <p className="w-[140px] shrink-0 text-[13px] font-bold text-muted">
          {t('characteristicTypes.columns.status')}
        </p>
        <p className="w-[100px] shrink-0 text-center text-[13px] font-bold text-muted">
          {t('characteristicTypes.columns.actions')}
        </p>
      </div>

      <Reorder.Group as="div" axis="y" values={order} onReorder={setOrder}>
        {order.map((type) => (
          <TypeRow
            key={type.id}
            type={type}
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
