import { ClipboardCheck, Search } from 'lucide-react'
import type { Order } from '../../types/order'
import { ORDER_STATUS, STATUS_LABEL, type OrderStatusFilter } from '../../utils/orders/constants'
import { formatCurrency, formatRelativeTime, getStatusClass } from '../../utils/orders/formatters'
import type { RequestState } from '../../types/coupon'
import { PanelTitle } from '../PanelTitle'

type OrderBoardProps = {
  loadState: RequestState
  notice: string
  orders: Order[]
  query: string
  selectedOrder: Order | null
  selectedStatus: OrderStatusFilter
  onQueryChange: (query: string) => void
  onSelectOrder: (orderId: string) => void
  onStatusChange: (status: OrderStatusFilter) => void
}

export function OrderBoard({
  loadState,
  notice,
  orders,
  query,
  selectedOrder,
  selectedStatus,
  onQueryChange,
  onSelectOrder,
  onStatusChange,
}: OrderBoardProps) {
  return (
    <section className="panel order-board">
      <PanelTitle icon={<ClipboardCheck size={18} />} title="주문 큐" action={loadState === 'loading' ? 'Loading' : 'Live'} />

      <div className="order-controls">
        <div className="input-with-icon">
          <Search size={16} />
          <input
            aria-label="주문 검색"
            placeholder="주문번호, 고객명, 상품명 검색"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className="status-tabs" aria-label="주문 상태 필터">
          {ORDER_STATUS.map((status) => (
            <button
              className={selectedStatus === status.value ? 'active' : undefined}
              key={status.value}
              type="button"
              onClick={() => onStatusChange(status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      <div className="order-list">
        {orders.length === 0 ? (
          <p className="empty-text">{notice}</p>
        ) : (
          orders.map((order) => (
            <button
              className={selectedOrder?.orderId === order.orderId ? 'order-row active' : 'order-row'}
              key={order.orderId}
              type="button"
              onClick={() => onSelectOrder(order.orderId)}
            >
              <span className={`risk-dot ${order.risk.toLowerCase()}`} />
              <span>
                <strong>{order.orderId}</strong>
                <small>{order.customerName}</small>
              </span>
              <span className="order-product">{order.productName}</span>
              <span className={`status-badge ${getStatusClass(order.status)}`}>{STATUS_LABEL[order.status]}</span>
              <span className="order-amount">{formatCurrency(order.amount)}</span>
              <span className="order-time">{formatRelativeTime(order.createdAt)}</span>
            </button>
          ))
        )}
      </div>
    </section>
  )
}
