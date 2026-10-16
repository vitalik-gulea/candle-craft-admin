import { Button } from '@heroui/react'
import { Reorder, useDragControls } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { CategoryTreeNode } from '../../../domain/categories/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface CategoryOrderLevelProps {
  nodes: CategoryTreeNode[]
  parentId: string | null
  level: number
  locale: Locale
  isDisabled: boolean
  onCommit: (parentId: string | null, orderedIds: string[]) => void
}

interface CategoryOrderItemProps {
  node: CategoryTreeNode
  index: number
  total: number
  level: number
  locale: Locale
  isDisabled: boolean
  onDragEnd: () => void
  onMove: (id: string, offset: -1 | 1) => void
  onCommit: (parentId: string | null, orderedIds: string[]) => void
}

function CategoryOrderItem({
  node,
  index,
  total,
  level,
  locale,
  isDisabled,
  onDragEnd,
  onMove,
  onCommit,
}: CategoryOrderItemProps) {
  const { t } = useTranslation()
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={node}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="flex w-full flex-col bg-white"
      whileDrag={{ scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10 }}
    >
      <div
        className="flex w-full items-center gap-3 border-b border-field-border px-4 py-3"
        style={{ paddingInlineStart: 16 + (level - 1) * 28 }}
      >
        <button
          type="button"
          disabled={isDisabled}
          aria-label={t('categories.order.dragHandle')}
          onPointerDown={(event) => controls.start(event)}
          className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted hover:bg-surface-soft active:cursor-grabbing disabled:opacity-50"
        >
          <svg
            className="size-4"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="5.5" cy="3.5" r="1.25" />
            <circle cx="10.5" cy="3.5" r="1.25" />
            <circle cx="5.5" cy="8" r="1.25" />
            <circle cx="10.5" cy="8" r="1.25" />
            <circle cx="5.5" cy="12.5" r="1.25" />
            <circle cx="10.5" cy="12.5" r="1.25" />
          </svg>
        </button>

        <p
          className={`min-w-0 flex-1 truncate text-accent ${level === 1 ? 'font-heading text-lg font-bold' : 'text-[15px] font-semibold'}`}
        >
          {node.name[locale]}
        </p>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            isDisabled={isDisabled || index === 0}
            onPress={() => onMove(node.id, -1)}
            aria-label={t('categories.order.moveUp')}
            className="size-7 rounded-md p-1.5"
          >
            <svg className="size-3.5 rotate-180 text-accent" aria-hidden="true">
              <use href="#chevron-down-icon" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            isDisabled={isDisabled || index === total - 1}
            onPress={() => onMove(node.id, 1)}
            aria-label={t('categories.order.moveDown')}
            className="size-7 rounded-md p-1.5"
          >
            <svg className="size-3.5 text-accent" aria-hidden="true">
              <use href="#chevron-down-icon" />
            </svg>
          </Button>
        </div>
      </div>

      {node.children.length > 0 ? (
        <CategoryOrderLevel
          nodes={node.children}
          parentId={node.id}
          level={level + 1}
          locale={locale}
          isDisabled={isDisabled}
          onCommit={onCommit}
        />
      ) : null}
    </Reorder.Item>
  )
}

export function CategoryOrderLevel({
  nodes,
  parentId,
  level,
  locale,
  isDisabled,
  onCommit,
}: CategoryOrderLevelProps) {
  const [order, setOrder] = useState(nodes)
  const orderRef = useRef(order)

  useEffect(() => {
    setOrder(nodes)
    orderRef.current = nodes
  }, [nodes])

  function updateOrder(next: CategoryTreeNode[]) {
    orderRef.current = next
    setOrder(next)
  }

  function commit(next: CategoryTreeNode[]) {
    const changed = next.some((node, index) => node.id !== nodes[index]?.id)
    if (changed) onCommit(parentId, next.map((node) => node.id))
  }

  function move(id: string, offset: -1 | 1) {
    const from = order.findIndex((node) => node.id === id)
    const to = from + offset
    if (from < 0 || to < 0 || to >= order.length) return
    const next = [...order]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    updateOrder(next)
    commit(next)
  }

  return (
    <Reorder.Group
      axis="y"
      values={order}
      onReorder={updateOrder}
      className="m-0 flex w-full list-none flex-col p-0"
    >
      {order.map((node, index) => (
        <CategoryOrderItem
          key={node.id}
          node={node}
          index={index}
          total={order.length}
          level={level}
          locale={locale}
          isDisabled={isDisabled}
          onDragEnd={() => commit(orderRef.current)}
          onMove={move}
          onCommit={onCommit}
        />
      ))}
    </Reorder.Group>
  )
}
