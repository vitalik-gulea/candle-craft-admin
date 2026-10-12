import { parseDate, type CalendarDate } from '@internationalized/date'
import { Calendar, DateField, DatePicker, I18nProvider, Label } from '@heroui/react'
import { useTranslation } from '../../../shared/i18n'

interface AppDatePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  ariaLabel?: string
  name?: string
  minValue?: string
  maxValue?: string
  isInvalid?: boolean
  onBlur?: () => void
  className?: string
  groupClassName?: string
}

function toCalendarDate(value: string | undefined): CalendarDate | null {
  if (!value) return null
  try {
    return parseDate(value.slice(0, 10))
  } catch {
    return null
  }
}

export function AppDatePicker({
  value,
  onChange,
  label,
  ariaLabel,
  name,
  minValue,
  maxValue,
  isInvalid,
  onBlur,
  className = 'w-full',
  groupClassName = 'h-11 bg-surface-soft',
}: AppDatePickerProps) {
  const { locale } = useTranslation()
  const calendarLabel = label ?? ariaLabel ?? ''

  return (
    <I18nProvider locale={locale === 'ru' ? 'ru-RU' : 'ro-RO'}>
      <DatePicker
        className={className}
        name={name}
        granularity="day"
        aria-label={label ? undefined : ariaLabel}
        isInvalid={isInvalid}
        value={toCalendarDate(value)}
        minValue={toCalendarDate(minValue) ?? undefined}
        maxValue={toCalendarDate(maxValue) ?? undefined}
        onBlur={onBlur}
        onChange={(next) => onChange(next ? next.toString() : '')}
      >
        {label ? <Label className="text-sm font-semibold text-accent">{label}</Label> : null}
        <DateField.Group fullWidth className={groupClassName}>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger type="button">
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label={calendarLabel}>
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({ year }) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </I18nProvider>
  )
}
