import type { Order, OrderCreatePayload, OrderEvent, OrderPage, OrderStatus, OrderSummary } from '../types/order'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export class OrderApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'OrderApiError'
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new OrderApiError(body?.message ?? `HTTP ${response.status}`, response.status)
  }

  const text = await response.text()

  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export function createOrder(payload: OrderCreatePayload) {
  return request<Order>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getOrders(params: { status?: OrderStatus; query?: string; page?: number; size?: number } = {}) {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set('status', params.status)
  if (params.query) searchParams.set('query', params.query)
  searchParams.set('page', String(params.page ?? 0))
  searchParams.set('size', String(params.size ?? 20))

  return request<OrderPage>(`/api/orders?${searchParams.toString()}`)
}

export function getOrder(orderId: string) {
  return request<Order>(`/api/orders/${orderId}`)
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  return request<Order>(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getOrderSummary() {
  return request<OrderSummary>('/api/orders/summary')
}

export function getOrderEvents(limit = 5) {
  return request<OrderEvent[]>(`/api/orders/events?limit=${limit}`)
}
