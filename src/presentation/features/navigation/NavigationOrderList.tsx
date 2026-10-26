import { Button } from '@heroui/react'
import { Reorder, useDragControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { NavigationItem } from '../../../domain/navigation/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface NavigationOrderListProps {
  items: NavigationItem[]
  locale: Locale
  isDisabled: boolean
  onCommit: (orderedIds: string[]) => void
  onEdit: (item: NavigationItem) => void
  onDelete: (item: NavigationItem) => void
}

interface NavigationOrderRowProps {
  item: NavigationItem
  locale: Locale
  isDisabled: boolean
  onDragEnd: () => void
  onEdit: (item: NavigationItem) => void
  onDelete: (item: NavigationItem) => void
}

function NavigationOrderRow({
  item,
  locale,
  isDisabled,
  onDragEnd,
  onEdit,
  onDelete,
}: NavigationOrderRowProps) {
  const { t } = useTranslation()
  const controls = useDragControls()
  const otherLocale: Locale = locale === 'ro' ? 'ru' : 'ro'

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="flex w-full items-center gap-3 border-b border-field-border bg-white px-4 py-3 last:border-b-0"
      whileDrag={{ scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10 }}
    >
      <button
        type="button"
        disabled={isDisabled}
        aria-label={t('navigation.dragHandle')}
        onPointerDown={(event) => controls.start(event)}
        className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted hover:bg-surface-soft active:cursor-grabbing disabled:opacity-50"
      >
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="5.5" cy="3.5" r="1.25" />
          <circle cx="10.5" cy="3.5" r="1.25" />
          <circle cx="5.5" cy="8" r="1.25" />
          <circle cx="10.5" cy="8" r="1.25" />
          <circle cx="5.5" cy="12.5" r="1.25" />
          <circle cx="10.5" cy="12.5" r="1.25" />
        </svg>
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[15px] font-semibold text-accent">
          {item.label[locale]}
          <span className="ml-2 text-[13px] font-normal text-muted">{item.label[otherLocale]}</span>
        </p>
        <p className="truncate text-[13px] text-muted">{item.url}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          isDisabled={isDisabled}
          onPress={() => onEdit(item)}
          className="h-8! rounded-md! border-field-border! bg-white! px-3! text-[13px]! font-semibold! text-accent! shadow-none!"
        >
          {t('navigation.edit')}
        </Button>
        <Button
          variant="outline"
          isDisabled={isDisabled}
          onPress={() => onDelete(item)}
          className="h-8! rounded-md! border-field-border! bg-white! px-3! text-[13px]! font-semibold! text-danger! shadow-none!"
        >
          {t('navigation.deleteAction')}
        </Button>
      </div>
    </Reorder.Item>
  )
}

export function NavigationOrderList({
  items,
  locale,
  isDisabled,
  onCommit,
  onEdit,
  onDelete,
}: NavigationOrderListProps) {
  const [order, setOrder] = useState(items)
  const orderRef = useRef(order)

  useEffect(() => {
    setOrder(items)
    orderRef.current = items
  }, [items])

  function updateOrder(next: NavigationItem[]) {
    orderRef.current = next
    setOrder(next)
  }

  function commit() {
    const next = orderRef.current
    const changed = next.some((item, index) => item.id !== items[index]?.id)
    if (changed) onCommit(next.map((item) => item.id))
  }

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={updateOrder}
      className="m-0 flex w-full list-none flex-col overflow-hidden rounded-xl border border-field-border bg-white p-0"
    >
      {order.map((item) => (
        <NavigationOrderRow
          key={item.id}
          item={item}
          locale={locale}
          isDisabled={isDisabled}
          onDragEnd={commit}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Reorder.Group>
  )
}
