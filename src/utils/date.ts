export function toInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function toApiDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value
}

export function formatDateTime(value: string | null) {
  if (!value) return '-'
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!match) return value

  const [, year, month, day, hour, minute] = match
  return `${year}.${month}.${day} ${hour}:${minute}`
}
