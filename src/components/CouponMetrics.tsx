import { BarChart3, Clock3, Gift, Ticket } from 'lucide-react'
import type { Coupon, Remaining, Statistics } from '../types/coupon'
import { formatDateTime } from '../utils/date'
import { MetricCard } from './MetricCard'
import { ValidityCard } from './ValidityCard'

type CouponMetricsProps = {
  currentCoupon: Coupon | null
  remaining: Remaining | null
  statistics: Statistics | null
}

export function CouponMetrics({ currentCoupon, remaining, statistics }: CouponMetricsProps) {
  return (
    <section className="metrics-grid" aria-label="Coupon status metrics">
      <MetricCard
        icon={<Gift size={20} />}
        label="현재 쿠폰"
        value={currentCoupon ? `#${currentCoupon.couponId}` : '-'}
        detail={currentCoupon?.name ?? '선택된 쿠폰 없음'}
      />
      <MetricCard
        icon={<Ticket size={20} />}
        label="남은 수량"
        value={remaining ? remaining.remainingCount.toLocaleString() : '-'}
        detail={currentCoupon ? `총 ${currentCoupon.maxCount.toLocaleString()}개` : '쿠폰 생성 후 조회'}
      />
      <MetricCard
        icon={<BarChart3 size={20} />}
        label="Flink 집계"
        value={statistics ? statistics.issuedCount.toLocaleString() : '-'}
        detail={`마지막 ${formatDateTime(statistics?.lastIssuedAt ?? null)}`}
      />
      <MetricCard
        icon={<Clock3 size={20} />}
        label="집계 갱신"
        value={formatDateTime(statistics?.updatedAt ?? null)}
        detail="Redis statistics key"
      />
      <ValidityCard coupon={currentCoupon} />
    </section>
  )
}
