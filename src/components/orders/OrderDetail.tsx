import { CheckCircle2, PackageCheck, RefreshCw } from 'lucide-react'
import type { RequestState } from '../../types/coupon'
import type { Order, OrderStatus } from '../../types/order'
import { ORDER_STATUS, PAYMENT_LABEL, STATUS_LABEL } from '../../utils/orders/constants'
import { formatCurrency, formatDateTime, getStatusClass } from '../../utils/orders/formatters'
import { PanelTitle } from '../PanelTitle'

type OrderDetailProps = {
  order: Order | null
  statusDraft: OrderStatus | ''
  updateState: RequestState
  onStatusDraftChange: (status: OrderStatus) => void
  onUpdateStatus: (status?: OrderStatus) => void
}

export function OrderDetail({
  order,
  statusDraft,
  updateState,
  onStatusDraftChange,
  onUpdateStatus,
}: OrderDetailProps) {
  return (
    <section className="panel order-detail">
      <PanelTitle icon={<PackageCheck size={18} />} title="주문 상세" action={order ? STATUS_LABEL[order.status] : 'Empty'} />

      {order ? (
        <>
          <div className="detail-heading">
            <div>
              <strong>{order.orderId}</strong>
              <span>{order.customerName}</span>
            </div>
            <span className={`status-badge ${getStatusClass(order.status)}`}>{STATUS_LABEL[order.status]}</span>
          </div>

          <dl className="status-list">
            <div>
              <dt>상품</dt>
              <dd>{order.productName}</dd>
            </div>
            <div>
              <dt>결제</dt>
              <dd>{PAYMENT_LABEL[order.paymentMethod]}</dd>
            </div>
            <div>
              <dt>금액</dt>
              <dd>{formatCurrency(order.amount)}</dd>
            </div>
            <div>
              <dt>쿠폰</dt>
              <dd>{order.couponCode ?? '없음'}</dd>
            </div>
            <div>
              <dt>지역</dt>
              <dd>{order.address}</dd>
            </div>
            <div>
              <dt>주문 시간</dt>
              <dd>{formatDateTime(order.createdAt)}</dd>
            </div>
            <div>
              <dt>수정 시간</dt>
              <dd>{formatDateTime(order.updatedAt)}</dd>
            </div>
          </dl>

          <div className="order-actions">
            <select value={statusDraft || order.status} onChange={(event) => onStatusDraftChange(event.target.value as OrderStatus)}>
              {ORDER_STATUS.filter((status) => status.value !== 'ALL').map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <button className="secondary-button" disabled={updateState === 'loading'} type="button" onClick={() => onUpdateStatus()}>
              <RefreshCw className={updateState === 'loading' ? 'spin' : undefined} size={16} />
              상태 변경
            </button>
            <button
              className="primary-button"
              disabled={updateState === 'loading' || order.status === 'COMPLETED'}
              type="button"
              onClick={() => onUpdateStatus('COMPLETED')}
            >
              <CheckCircle2 size={16} />
              처리 완료
            </button>
          </div>
        </>
      ) : (
        <p className="empty-text">주문을 생성하거나 목록에서 선택하세요.</p>
      )}
    </section>
  )
}
