const TIME_ZONE = 'Europe/Chisinau'

const wallClockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function offsetMinutesAt(utcMs: number): number {
  const parts = wallClockFormatter.formatToParts(new Date(utcMs))
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)
  const wallAsUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour'),
    read('minute'),
    read('second'),
  )
  return Math.round((wallAsUtc - Math.floor(utcMs / 1000) * 1000) / 60000)
}

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+'
  const abs = Math.abs(minutes)
  const hh = String(Math.floor(abs / 60)).padStart(2, '0')
  const mm = String(abs % 60).padStart(2, '0')
  return `${sign}${hh}:${mm}`
}

export function chisinauDayBoundaryIso(date: string, boundary: 'start' | 'end'): string {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes, seconds, millis] = boundary === 'start' ? [0, 0, 0, 0] : [23, 59, 59, 999]
  const wallMs = Date.UTC(year, month - 1, day, hours, minutes, seconds, millis)

  const firstGuess = offsetMinutesAt(wallMs - offsetMinutesAt(wallMs) * 60000)
  const offset = offsetMinutesAt(wallMs - firstGuess * 60000)

  const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
  return `${date}T${time}${formatOffset(offset)}`
}

export function formatChisinauDateTime(value: string, locale: 'ro' | 'ru'): string {
  return new Date(value).toLocaleString(locale === 'ru' ? 'ru-RU' : 'ro-RO', {
    timeZone: TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
