import type { Dispatch, SetStateAction } from 'react'

export type Coupon = {
  couponId: number
  name: string
  maxCount: number
  startAt: string
  endAt: string
}

export type CouponIssue = {
  couponIssueId: number
  couponId: number
  userId: string
  status: 'ISSUED' | 'CANCELED'
  issuedAt: string
  canceledAt: string | null
}

export type Remaining = {
  remainingCount: number
}

export type Statistics = {
  couponId: number
  issuedCount: number
  lastIssuedAt: string | null
  updatedAt: string | null
}

export type Notice = {
  tone: 'success' | 'error' | 'info'
  message: string
}

export type RequestState = 'idle' | 'loading'

export type CouponFormState = {
  name: string
  maxCount: number
  startAt: string
  endAt: string
}

export type SetCouponForm = Dispatch<SetStateAction<CouponFormState>>
