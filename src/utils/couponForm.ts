import type { Coupon, CouponFormState } from '../types/coupon'
import { toInputValue } from './date'

const nowInputValue = () => toInputValue(new Date(Date.now() - 60 * 1000))

const nextYearInputValue = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return toInputValue(date)
}

export const getNextCouponName = (coupons: Coupon[]) => {
  const lastCouponId = coupons.reduce((maxId, coupon) => Math.max(maxId, coupon.couponId), 0)
  return `쿠폰${lastCouponId + 1}`
}

export const createInitialCouponForm = (coupons: Coupon[] = []): CouponFormState => ({
  name: getNextCouponName(coupons),
  maxCount: 100,
  startAt: nowInputValue(),
  endAt: nextYearInputValue(),
})
