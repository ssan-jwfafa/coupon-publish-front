import type { Coupon, CouponIssue, Remaining, Statistics } from '../types/coupon'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
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
    throw new ApiError(body?.message ?? `HTTP ${response.status}`, response.status)
  }

  const text = await response.text()

  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export function getCoupons() {
  return request<Coupon[]>('/api/coupons')
}

export function getCoupon(couponId: number) {
  return request<Coupon>(`/api/coupons/${couponId}`)
}

export function createCoupon(payload: Omit<Coupon, 'couponId'>) {
  return request<Coupon>('/api/coupons', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteCoupon(couponId: number) {
  return request<void>(`/api/coupons/${couponId}`, { method: 'DELETE' })
}

export function issueCoupon(couponId: number, userId: string) {
  return request<CouponIssue>(`/api/coupons/${couponId}/issues`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

export function getRemaining(couponId: number) {
  return request<Remaining>(`/api/coupons/${couponId}/remaining`)
}

export function getStatistics(couponId: number) {
  return request<Statistics>(`/api/coupons/${couponId}/statistics`)
}

export function isAlreadyIssuedError(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return true
  }

  if (!(error instanceof Error)) {
    return false
  }

  return /already|duplicate|duplicated|exist|이미|중복|발급/.test(error.message.toLowerCase())
}
