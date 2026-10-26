import { Button, Dropdown, ListBox, SearchField, Select } from '@heroui/react'
import { useEffect, useState } from 'react'
import {
  DELIVERY_METHODS,
  ORDER_SOURCES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_RESULTS,
  type OrderListFilters,
} from '../../../domain/orders/types'
import { useTranslation } from '../../../shared/i18n'
import { chisinauDayBoundaryIso } from '../../../shared/utils/chisinau-time'
import { AppDatePicker } from '../ui/AppDatePicker'
import { toDateInputValue } from './order-display'

interface OrdersToolbarProps {
  filters: OrderListFilters
  total: number
  isExporting: boolean
  onFiltersChange: (filters: OrderListFilters) => void
  onExport: (format: 'csv' | 'pdf') => void
}

type EnumFilterKey = 'status' | 'deliveryMethod' | 'paymentMethod' | 'paymentResult' | 'source'

const ALL_KEY = 'all'

const filterOptionClassName =
  'min-h-0! w-full! rounded-[4px]! bg-transparent! px-3! py-1.5! text-sm! font-medium! leading-[18px]! text-accent! shadow-none! outline-none! data-[hovered=true]:bg-accent/10! data-[focused=true]:bg-accent/10! data-[selected=true]:bg-accent/15!'

const dateGroupClassName =
  'h-[34px]! rounded-[6px]! border! border-field-border! bg-white! text-sm! font-medium! text-accent! shadow-none!'

interface EnumFilterSelectProps {
  label: string
  valueLabel: string
  selectedKey: string
  options: { id: string; label: string }[]
  allLabel: string
  onChange: (value: string | undefined) => void
}

function EnumFilterSelect({
  label,
  valueLabel,
  selectedKey,
  options,
  allLabel,
  onChange,
}: EnumFilterSelectProps) {
  return (
    <Select
      selectedKey={selectedKey}
      onSelectionChange={(key) => onChange(!key || key === ALL_KEY ? undefined : String(key))}
      aria-label={label}
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
        <ListBox className="bg-transparent! p-0! outline-none!">
          <ListBox.Item id={ALL_KEY} textValue={allLabel} className={filterOptionClassName}>
            {allLabel}
          </ListBox.Item>
          {options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.id}
              textValue={option.label}
              className={filterOptionClassName}
            >
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

export function OrdersToolbar({
  filters,
  total,
  isExporting,
  onFiltersChange,
  onExport,
}: OrdersToolbarProps) {
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

  const enumFilters: {
    key: EnumFilterKey
    label: string
    values: readonly string[]
    translationGroup: string
  }[] = [
    {
      key: 'status',
      label: t('orders.filters.status'),
      values: ORDER_STATUSES,
      translationGroup: 'status',
    },
    {
      key: 'deliveryMethod',
      label: t('orders.filters.deliveryMethod'),
      values: DELIVERY_METHODS,
      translationGroup: 'deliveryMethod',
    },
    {
      key: 'paymentMethod',
      label: t('orders.filters.paymentMethod'),
      values: PAYMENT_METHODS,
      translationGroup: 'paymentMethod',
    },
    {
      key: 'paymentResult',
      label: t('orders.filters.paymentResult'),
      values: PAYMENT_RESULTS,
      translationGroup: 'paymentResult',
    },
    {
      key: 'source',
      label: t('orders.filters.source'),
      values: ORDER_SOURCES,
      translationGroup: 'source',
    },
  ]

  const hasActiveFilters =
    search.trim() !== '' ||
    enumFilters.some((item) => filters[item.key] !== undefined) ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined

  function changeDate(key: 'dateFrom' | 'dateTo', value: string) {
    const iso = value ? chisinauDayBoundaryIso(value, key === 'dateFrom' ? 'start' : 'end') : undefined
    onFiltersChange({ ...filters, [key]: iso })
  }

  function reset() {
    setSearch('')
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    })
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-field-border bg-white p-4">
      <div className="flex w-full items-center justify-between gap-4">
        <SearchField
          value={search}
          onChange={setSearch}
          aria-label={t('common.search')}
          className="group w-[320px] shrink-0"
        >
          <SearchField.Group className="h-[34px]! w-full! items-center! gap-2! overflow-hidden! rounded-[6px]! border! border-field-border! bg-surface-soft! px-3! py-2! shadow-none!">
            <SearchField.SearchIcon className="pointer-events-none ms-0! me-0! size-[14px]! h-[14px]! w-[14px]! shrink-0! text-muted!">
              <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden="true">
                <use href="#filter-search-icon" />
              </svg>
            </SearchField.SearchIcon>
            <SearchField.Input
              placeholder={t('orders.searchPlaceholder')}
              className="min-w-0! flex-1! bg-transparent! px-0! py-0! ps-0! pe-0! text-sm! font-normal! leading-[18px]! text-accent! outline-none! placeholder:text-muted!"
            />
            <SearchField.ClearButton className="me-0! size-4! group-data-[empty=true]:hidden!" />
          </SearchField.Group>
        </SearchField>

        <div className="flex shrink-0 items-center gap-4">
          <p className="text-right text-sm font-normal leading-[18px] text-muted">
            {t('orders.itemsCount', { count: String(total) })}
          </p>
          <Dropdown>
            <Button
              variant="secondary"
              isPending={isExporting}
              isDisabled={total === 0}
              className="h-[34px]! rounded-md! px-3! text-sm! font-semibold! text-accent!"
            >
              {t('orders.export.button')}
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu onAction={(key) => onExport(key === 'pdf' ? 'pdf' : 'csv')}>
                <Dropdown.Item id="csv" textValue={t('orders.export.csv')}>
                  {t('orders.export.csv')}
                </Dropdown.Item>
                <Dropdown.Item id="pdf" textValue={t('orders.export.pdf')}>
                  {t('orders.export.pdf')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-3">
        {enumFilters.map((item) => {
          const current = filters[item.key]
          return (
            <EnumFilterSelect
              key={item.key}
              label={item.label}
              allLabel={t('common.all')}
              selectedKey={current ?? ALL_KEY}
              valueLabel={
                current ? t(`orders.${item.translationGroup}.${current}`) : t('common.all')
              }
              options={item.values.map((value) => ({
                id: value,
                label: t(`orders.${item.translationGroup}.${value}`),
              }))}
              onChange={(value) => onFiltersChange({ ...filters, [item.key]: value })}
            />
          )
        })}

        <div className="flex items-center gap-2 text-sm font-medium text-accent">
          {t('orders.filters.dateFrom')}
          <AppDatePicker
            ariaLabel={t('orders.filters.dateFrom')}
            value={toDateInputValue(filters.dateFrom)}
            maxValue={toDateInputValue(filters.dateTo) || undefined}
            onChange={(value) => changeDate('dateFrom', value)}
            className="w-[170px]"
            groupClassName={dateGroupClassName}
          />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-accent">
          {t('orders.filters.dateTo')}
          <AppDatePicker
            ariaLabel={t('orders.filters.dateTo')}
            value={toDateInputValue(filters.dateTo)}
            minValue={toDateInputValue(filters.dateFrom) || undefined}
            onChange={(value) => changeDate('dateTo', value)}
            className="w-[170px]"
            groupClassName={dateGroupClassName}
          />
        </div>

        {hasActiveFilters ? (
          <Button
            variant="ghost"
            onPress={reset}
            className="h-[34px]! rounded-md! px-3! text-sm! font-semibold! text-accent!"
          >
            {t('orders.filters.reset')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
