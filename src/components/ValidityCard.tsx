import { CalendarRange } from 'lucide-react'
import type { Coupon } from '../types/coupon'
import { formatDateTime } from '../utils/date'

type ValidityCardProps = {
  coupon: Coupon | null
}

export function ValidityCard({ coupon }: ValidityCardProps) {
  return (
    <article className="metric-card validity-card">
      <div className="metric-icon">
        <CalendarRange size={20} />
      </div>
      <span>유효기간</span>
      <div className="validity-range">
        <strong>시작: {coupon ? formatDateTime(coupon.startAt) : '-'}</strong>
        <strong>종료: {coupon ? formatDateTime(coupon.endAt) : '-'}</strong>
      </div>
    </article>
  )
}
