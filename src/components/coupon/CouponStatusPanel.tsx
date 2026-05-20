import { BarChart3, Loader2, RefreshCcw } from 'lucide-react'
import type { Coupon, RequestState } from '../../types/coupon'
import { PanelTitle } from '../PanelTitle'

type CouponStatusPanelProps = {
  currentCoupon: Coupon | null
  issuedPercent: number
  refreshState: RequestState
  selectedId: number
  onRefresh: () => void
}

export function CouponStatusPanel({
  currentCoupon,
  issuedPercent,
  refreshState,
  selectedId,
  onRefresh,
}: CouponStatusPanelProps) {
  return (
    <section className="panel status-panel">
      <PanelTitle icon={<BarChart3 size={18} />} title="실시간 현황" action="Redis" />
      <div className="progress-block">
        <div className="progress-label">
          <span>발급률</span>
          <strong>{issuedPercent}%</strong>
        </div>
        <div className="progress-track">
          <div style={{ width: `${issuedPercent}%` }} />
        </div>
      </div>

      <dl className="status-list">
        <div>
          <dt>남은 수량 key</dt>
          <dd>{currentCoupon ? `coupon:${currentCoupon.couponId}:remaining` : '-'}</dd>
        </div>
        <div>
          <dt>집계 key</dt>
          <dd>{currentCoupon ? `coupon:${currentCoupon.couponId}:statistics` : '-'}</dd>
        </div>
        <div>
          <dt>Kafka topic</dt>
          <dd>coupon-issued</dd>
        </div>
      </dl>

      <button className="secondary-button" disabled={!selectedId || refreshState === 'loading'} onClick={onRefresh} type="button">
        {refreshState === 'loading' ? <Loader2 className="spin" size={18} /> : <RefreshCcw size={18} />}
        현황 새로고침
      </button>
    </section>
  )
}
