import { AlertTriangle, Bell, CheckCircle2, CreditCard, Truck } from 'lucide-react'
import type { OrderSummary } from '../../types/order'
import { formatCurrency } from '../../utils/orders/formatters'
import { MetricCard } from '../MetricCard'

type OrderMetricsProps = {
  summary: OrderSummary
}

export function OrderMetrics({ summary }: OrderMetricsProps) {
  return (
    <section className="metrics-grid order-metrics" aria-label="Order summary">
      <MetricCard icon={<Bell size={20} />} label="실시간 접수" value={`${summary.activeOrderCount}건`} detail="완료 전 주문 기준" />
      <MetricCard
        icon={<CreditCard size={20} />}
        label="결제 확인"
        value={`${summary.paymentConfirmedCount}건`}
        detail={`상품준비 ${summary.preparingCount}건`}
      />
      <MetricCard icon={<Truck size={20} />} label="배송 진행" value={`${summary.shippingCount}건`} detail="송장 등록 대상" />
      <MetricCard icon={<AlertTriangle size={20} />} label="보류/확인" value={`${summary.onHoldCount}건`} detail="운영자 확인 필요" />
      <MetricCard icon={<CheckCircle2 size={20} />} label="오늘 매출" value={formatCurrency(summary.todayRevenue)} detail={`완료 ${summary.completedCount}건`} />
    </section>
  )
}
