import { Button, Dropdown } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CategoryTreeNode } from '../../../domain/categories/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface CategoryTreeRowProps {
  node: CategoryTreeNode
  level: number
  locale: Locale
  productsCountByCategory: Map<string, number>
  collapsedIds: Set<string>
  forceExpanded: boolean
  isMutating: boolean
  onToggle: (id: string) => void
  onEdit: (category: CategoryTreeNode) => void
  onSetStatus: (id: string, status: 'draft' | 'published') => void
  onTrash: (category: CategoryTreeNode) => void
}

function StatusBadge({ status }: { status: CategoryTreeNode['status'] }) {
  const { t } = useTranslation()

  if (status === 'published') {
    return (
      <span className="inline-flex shrink-0 rounded-md bg-warning px-2 py-1 text-[11px] font-semibold text-white">
        {t('categories.status.published')}
      </span>
    )
  }

  return (
    <span className="inline-flex shrink-0 rounded-md bg-[#efece6] px-2 py-1 text-[11px] font-semibold text-muted">
      {t('categories.status.draft')}
    </span>
  )
}

export function CategoryTreeRow({
  node,
  level,
  locale,
  productsCountByCategory,
  collapsedIds,
  forceExpanded,
  isMutating,
  onToggle,
  onEdit,
  onSetStatus,
  onTrash,
}: CategoryTreeRowProps) {
  const { t } = useTranslation()
  const hasChildren = node.children.length > 0
  const isExpanded = forceExpanded || !collapsedIds.has(node.id)

  return (
    <div className="flex w-full flex-col">
      <div
        className="flex w-full items-center gap-3 border-b border-field-border bg-white px-4 py-3"
        style={{ paddingInlineStart: 16 + (level - 1) * 28 }}
      >
        {hasChildren ? (
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onPress={() => onToggle(node.id)}
            aria-label={isExpanded ? t('categories.collapse') : t('categories.expand')}
            aria-expanded={isExpanded}
            className="size-7 shrink-0 rounded-md p-1.5"
          >
            <svg
              className={`size-3.5 text-accent transition-transform ${isExpanded ? '' : '-rotate-90'}`}
              aria-hidden="true"
            >
              <use href="#chevron-down-icon" />
            </svg>
          </Button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden="true" />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className={`truncate text-accent ${level === 1 ? 'font-heading text-lg font-bold' : 'text-[15px] font-semibold'}`}
          >
            {node.name[locale]}
          </p>
          {hasChildren ? (
            <p className="text-xs text-muted">
              {t('categories.subcategoriesCount', { count: String(node.children.length) })}
            </p>
          ) : null}
        </div>

        <p className="hidden shrink-0 text-sm font-semibold text-muted sm:block">
          {t('categories.productsCount', {
            count: String(productsCountByCategory.get(node.id) ?? 0),
          })}
        </p>
        <StatusBadge status={node.status} />

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(node)}
            className="rounded-md border border-field-border px-3 py-1.5 text-[13px] font-semibold text-accent"
          >
            {t('categories.actions.edit')}
          </button>
          <Dropdown>
            <Dropdown.Trigger>
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                isDisabled={isMutating}
                aria-label={t('common.actions')}
                className="size-7 rounded-md border border-field-border p-1.5"
              >
                <svg className="size-3.5 text-accent" aria-hidden="true">
                  <use href="#more-horizontal-icon" />
                </svg>
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  const action = String(key)
                  if (action === 'hide') onSetStatus(node.id, 'draft')
                  if (action === 'show') onSetStatus(node.id, 'published')
                  if (action === 'trash') onTrash(node)
                }}
              >
                {node.status === 'published' ? (
                  <Dropdown.Item id="hide" textValue={t('categories.actions.hide')}>
                    {t('categories.actions.hide')}
                  </Dropdown.Item>
                ) : null}
                {node.status === 'draft' ? (
                  <Dropdown.Item id="show" textValue={t('categories.actions.show')}>
                    {t('categories.actions.show')}
                  </Dropdown.Item>
                ) : null}
                <Dropdown.Item id="trash" textValue={t('categories.actions.trash')}>
                  {t('categories.actions.trash')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded ? (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <CategoryTreeRow
                key={child.id}
                node={child}
                level={level + 1}
                locale={locale}
                productsCountByCategory={productsCountByCategory}
                collapsedIds={collapsedIds}
                forceExpanded={forceExpanded}
                isMutating={isMutating}
                onToggle={onToggle}
                onEdit={onEdit}
                onSetStatus={onSetStatus}
                onTrash={onTrash}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
