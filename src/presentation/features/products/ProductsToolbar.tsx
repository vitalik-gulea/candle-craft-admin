import { ListBox, SearchField, Select } from '@heroui/react'
import { useEffect, useState, type ReactNode } from 'react'
import type { Key } from 'react-aria-components'
import type { CategorySummary } from '../../../domain/categories/types'
import type { ProductListFilters } from '../../../domain/products/types'
import type { Locale } from '../../../shared/i18n'
import { useTranslation } from '../../../shared/i18n'
import type { StockDisplayStatus } from './product-display'

export type StockStatusFilter = StockDisplayStatus | 'all'

interface ProductsToolbarProps {
  filters: ProductListFilters
  stockStatus: StockStatusFilter
  categories: CategorySummary[]
  locale: Locale
  total: number
  onFiltersChange: (filters: ProductListFilters) => void
  onStockStatusChange: (status: StockStatusFilter) => void
}

function categoryLabel(
  categoryId: string | undefined,
  categories: CategorySummary[],
  locale: Locale,
  allLabel: string,
): string {
  if (!categoryId) return allLabel
  return categories.find((item) => item.id === categoryId)?.name[locale] ?? allLabel
}

function stockStatusLabel(status: StockStatusFilter, t: (key: string) => string): string {
  if (status === 'all') return t('common.all')
  return t(`products.stockStatus.${status}`)
}

const filterOptionClassName =
  'min-h-0! w-full! rounded-[4px]! bg-transparent! px-3! py-1.5! text-sm! font-medium! leading-[18px]! text-accent! shadow-none! outline-none! data-[hovered=true]:bg-accent/10! data-[focused=true]:bg-accent/10! data-[selected=true]:bg-accent/15!'

function FilterOption({ id, label, depth = 1 }: { id: string; label: string; depth?: number }) {
  return (
    <ListBox.Item id={id} textValue={label} className={filterOptionClassName}>
      <span style={{ paddingInlineStart: (depth - 1) * 16 }}>{label}</span>
    </ListBox.Item>
  )
}

function FilterSelect({
  ariaLabel,
  label,
  valueLabel,
  selectedKey,
  onSelectionChange,
  children,
}: {
  ariaLabel: string
  label: string
  valueLabel: string
  selectedKey: string
  onSelectionChange: (key: Key | null) => void
  children: ReactNode
}) {
  return (
    <Select
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
      aria-label={ariaLabel}
      className="w-fit shrink-0"
    >
      <Select.Trigger className="inline-flex! h-[34px]! min-h-[34px]! w-auto! shrink-0! items-center! gap-2! rounded-[6px]! border! border-field-border! bg-white! px-3! py-2! pe-3! text-sm! font-medium! text-accent! shadow-none!">
        <span className="whitespace-nowrap text-sm font-medium leading-[18px] text-accent">
          {label}: {valueLabel}
        </span>
        <Select.Indicator className="static! inset-auto! end-auto! my-0! size-3! h-3! w-3! shrink-0! text-accent!">
          <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
            <use href="#filter-chevron-icon" />
          </svg>
        </Select.Indicator>
      </Select.Trigger>
      <Select.Popover
        offset={6}
        className="w-auto! min-w-(--trigger-width)! rounded-[6px]! border! border-field-border! bg-[#eef2df]! p-1! shadow-none!"
      >
        <ListBox className="bg-transparent! p-0! outline-none!">{children}</ListBox>
      </Select.Popover>
    </Select>
  )
}

export function ProductsToolbar({
  filters,
  stockStatus,
  categories,
  locale,
  total,
  onFiltersChange,
  onStockStatusChange,
}: ProductsToolbarProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState(filters.search ?? '')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = search.trim() || undefined
      if (nextSearch === filters.search) return
      onFiltersChange({ ...filters, search: nextSearch })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search, filters, onFiltersChange])

  return (
    <div className="flex w-full items-center justify-between rounded-xl border border-field-border bg-white p-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <SearchField
          value={search}
          onChange={setSearch}
          aria-label={t('common.search')}
          className="group w-[260px] shrink-0"
        >
          <SearchField.Group className="h-[34px]! w-full! items-center! gap-2! overflow-hidden! rounded-[6px]! border! border-field-border! bg-surface-soft! px-3! py-2! shadow-none!">
            <SearchField.SearchIcon className="pointer-events-none ms-0! me-0! size-[14px]! h-[14px]! w-[14px]! shrink-0! text-muted!">
              <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
                <use href="#filter-search-icon" />
              </svg>
            </SearchField.SearchIcon>
            <SearchField.Input
              placeholder={t('products.searchPlaceholder')}
              className="min-w-0! flex-1! bg-transparent! px-0! py-0! ps-0! pe-0! text-sm! font-normal! leading-[18px]! text-accent! outline-none! placeholder:text-muted!"
            />
            <SearchField.ClearButton className="me-0! size-4! group-data-[empty=true]:hidden!" />
          </SearchField.Group>
        </SearchField>

        <FilterSelect
          ariaLabel={t('products.filters.categoryLabel')}
          label={t('products.filters.categoryLabel')}
          valueLabel={categoryLabel(filters.categoryId, categories, locale, t('common.all'))}
          selectedKey={filters.categoryId ?? 'all'}
          onSelectionChange={(key) =>
            onFiltersChange({
              ...filters,
              categoryId: !key || key === 'all' ? undefined : String(key),
            })
          }
        >
          <FilterOption id="all" label={t('common.all')} />
          {categories.map((category) => (
            <FilterOption
              key={category.id}
              id={category.id}
              label={category.name[locale]}
              depth={category.depth}
            />
          ))}
        </FilterSelect>

        <FilterSelect
          ariaLabel={t('products.filters.statusLabel')}
          label={t('products.filters.statusLabel')}
          valueLabel={stockStatusLabel(stockStatus, t)}
          selectedKey={stockStatus}
          onSelectionChange={(key) => {
            if (key) onStockStatusChange(key as StockStatusFilter)
          }}
        >
          <FilterOption id="all" label={t('common.all')} />
          <FilterOption id="active" label={t('products.stockStatus.active')} />
          <FilterOption id="low" label={t('products.stockStatus.low')} />
          <FilterOption id="outOfStock" label={t('products.stockStatus.outOfStock')} />
        </FilterSelect>
      </div>

      <p className="w-[120px] shrink-0 text-right text-sm font-normal leading-[18px] text-muted">
        {t('products.itemsCount', { count: String(total) })}
      </p>
    </div>
  )
}
