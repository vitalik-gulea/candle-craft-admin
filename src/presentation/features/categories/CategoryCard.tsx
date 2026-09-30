import { Button, Dropdown } from '@heroui/react'
import type { Category } from '../../../domain/categories/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'

interface CategoryCardProps {
  category: Category
  locale: Locale
  productsCount: number
  isMutating: boolean
  onEdit: (category: Category) => void
  onSetStatus: (id: string, status: 'draft' | 'published') => void
  onTrash: (id: string) => void
  onRestore: (id: string) => void
  onPermanentlyDelete: (id: string) => void
}

function StatusBadge({ status }: { status: Category['status'] }) {
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

export function CategoryCard({
  category,
  locale,
  productsCount,
  isMutating,
  onEdit,
  onSetStatus,
  onTrash,
  onRestore,
  onPermanentlyDelete,
}: CategoryCardProps) {
  const { t } = useTranslation()

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-clip rounded-xl border border-field-border bg-white">
      <div className="h-40 w-full shrink-0 bg-surface-soft">
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.alt[locale] ?? category.name[locale]}
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted">
            <svg className="size-8" aria-hidden="true">
              <use href="#image-icon" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-4 p-5">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-2">
            <p className="min-w-0 truncate font-heading text-xl font-bold text-accent">
              {category.name[locale]}
            </p>
            <StatusBadge status={category.status} />
          </div>
          <p className="line-clamp-2 w-full text-sm text-ink">
            {category.description[locale] ?? ''}
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-2">
          <p className="shrink-0 text-sm font-semibold text-muted">
            {t('categories.productsCount', { count: String(productsCount) })}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(category)}
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
                    if (action === 'hide') onSetStatus(category.id, 'draft')
                    if (action === 'show') onSetStatus(category.id, 'published')
                    if (action === 'trash') onTrash(category.id)
                    if (action === 'restore') onRestore(category.id)
                    if (action === 'delete') onPermanentlyDelete(category.id)
                  }}
                >
                  {category.status === 'published' ? (
                    <Dropdown.Item id="hide" textValue={t('categories.actions.hide')}>
                      {t('categories.actions.hide')}
                    </Dropdown.Item>
                  ) : null}
                  {category.status === 'draft' ? (
                    <Dropdown.Item id="show" textValue={t('categories.actions.show')}>
                      {t('categories.actions.show')}
                    </Dropdown.Item>
                  ) : null}
                  {!category.deletedAt ? (
                    <Dropdown.Item id="trash" textValue={t('categories.actions.trash')}>
                      {t('categories.actions.trash')}
                    </Dropdown.Item>
                  ) : null}
                  {category.deletedAt ? (
                    <Dropdown.Item id="restore" textValue={t('categories.actions.restore')}>
                      {t('categories.actions.restore')}
                    </Dropdown.Item>
                  ) : null}
                  {category.deletedAt ? (
                    <Dropdown.Item
                      id="delete"
                      textValue={t('categories.actions.permanentlyDelete')}
                    >
                      {t('categories.actions.permanentlyDelete')}
                    </Dropdown.Item>
                  ) : null}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  )
}
