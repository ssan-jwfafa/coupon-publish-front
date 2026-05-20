import type { OrderStatus } from '../../types/order'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatRelativeTime(value: string) {
  const createdAt = new Date(value).getTime()
  const diffMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60_000))

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffMinutes < 1_440) return `${Math.floor(diffMinutes / 60)}시간 전`
  return `${Math.floor(diffMinutes / 1_440)}일 전`
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function getStatusClass(status: OrderStatus) {
  if (status === 'COMPLETED') return 'done'
  if (status === 'ON_HOLD') return 'hold'
  if (status === 'SHIPPING') return 'shipping'
  return 'working'
}

export function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
