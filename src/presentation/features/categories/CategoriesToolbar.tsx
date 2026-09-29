import { SearchField } from '@heroui/react'
import { useTranslation } from '../../../shared/i18n'

interface CategoriesToolbarProps {
  search: string
  total: number
  onSearchChange: (value: string) => void
}

export function CategoriesToolbar({ search, total, onSearchChange }: CategoriesToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full items-center justify-between rounded-xl border border-field-border bg-white p-4">
      <SearchField
        value={search}
        onChange={onSearchChange}
        aria-label={t('common.search')}
        className="w-[320px] shrink-0"
      >
        <SearchField.Group className="rounded-md border border-field-border bg-surface-soft px-3 py-2">
          <SearchField.SearchIcon>
            <svg className="size-3.5 text-muted" aria-hidden="true">
              <use href="/icons.svg#search-icon" />
            </svg>
          </SearchField.SearchIcon>
          <SearchField.Input
            placeholder={t('categories.searchPlaceholder')}
            className="text-sm text-accent placeholder:text-muted"
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <p className="shrink-0 text-sm font-semibold text-ink">
        {t('categories.itemsCount', { count: String(total) })}
      </p>
    </div>
  )
}
