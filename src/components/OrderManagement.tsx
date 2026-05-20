import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SubmitEventHandler } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  PackageCheck,
  PlusCircle,
  RefreshCw,
  Search,
  Truck,
} from 'lucide-react'
import {
  createOrder,
  getOrder,
  getOrderEvents,
  getOrders,
  updateOrderStatus,
} from '../api/orders'
import type { Order, OrderCreatePayload, OrderEvent, OrderStatus, OrderSummary, PaymentMethod } from '../types/order'
import type { RequestState } from '../types/coupon'
import { MetricCard } from './MetricCard'
import { PanelTitle } from './PanelTitle'

type OrderStatusFilter = 'ALL' | OrderStatus

const ORDER_STATUS: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PAYMENT_CONFIRMED', label: '결제확인' },
  { value: 'PREPARING', label: '상품준비' },
  { value: 'SHIPPING', label: '배송중' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'ON_HOLD', label: '보류' },
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  PAYMENT_CONFIRMED: '결제확인',
  PREPARING: '상품준비',
  SHIPPING: '배송중',
  COMPLETED: '완료',
  ON_HOLD: '보류',
}

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CARD: '카드',
  EASY_PAY: '간편결제',
  BANK_TRANSFER: '계좌이체',
}

const EMPTY_SUMMARY: OrderSummary = {
  activeOrderCount: 0,
  paymentConfirmedCount: 0,
  preparingCount: 0,
  shippingCount: 0,
  completedCount: 0,
  onHoldCount: 0,
  todayRevenue: 0,
}

const INITIAL_ORDER_FORM: OrderCreatePayload = {
  customerName: '',
  productName: '',
  paymentMethod: 'EASY_PAY',
  amount: 10000,
  couponCode: '',
  address: '',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRelativeTime(value: string) {
  const createdAt = new Date(value).getTime()
  const diffMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60_000))

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffMinutes < 1_440) return `${Math.floor(diffMinutes / 60)}시간 전`
  return `${Math.floor(diffMinutes / 1_440)}일 전`
}

function getStatusClass(status: OrderStatus) {
  if (status === 'COMPLETED') return 'done'
  if (status === 'ON_HOLD') return 'hold'
  if (status === 'SHIPPING') return 'shipping'
  return 'working'
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function isActiveStatus(status: OrderStatus) {
  return status !== 'COMPLETED'
}

function applyStatusChangeToSummary(summary: OrderSummary, previousStatus: OrderStatus, nextStatus: OrderStatus): OrderSummary {
  if (previousStatus === nextStatus) {
    return summary
  }

  const nextSummary = { ...summary }
  const summaryKeyByStatus: Record<OrderStatus, keyof OrderSummary> = {
    PAYMENT_CONFIRMED: 'paymentConfirmedCount',
    PREPARING: 'preparingCount',
    SHIPPING: 'shippingCount',
    COMPLETED: 'completedCount',
    ON_HOLD: 'onHoldCount',
  }

  nextSummary[summaryKeyByStatus[previousStatus]] = Math.max(0, nextSummary[summaryKeyByStatus[previousStatus]] - 1)
  nextSummary[summaryKeyByStatus[nextStatus]] += 1

  if (isActiveStatus(previousStatus) && !isActiveStatus(nextStatus)) {
    nextSummary.activeOrderCount = Math.max(0, nextSummary.activeOrderCount - 1)
  }

  if (!isActiveStatus(previousStatus) && isActiveStatus(nextStatus)) {
    nextSummary.activeOrderCount += 1
  }

  return nextSummary
}

function createSummaryFromOrders(orders: Order[]): OrderSummary {
  const today = new Date().toDateString()

  return orders.reduce<OrderSummary>((nextSummary, order) => {
    if (isActiveStatus(order.status)) {
      nextSummary.activeOrderCount += 1
    }

    if (order.status === 'PAYMENT_CONFIRMED') nextSummary.paymentConfirmedCount += 1
    if (order.status === 'PREPARING') nextSummary.preparingCount += 1
    if (order.status === 'SHIPPING') nextSummary.shippingCount += 1
    if (order.status === 'COMPLETED') nextSummary.completedCount += 1
    if (order.status === 'ON_HOLD') nextSummary.onHoldCount += 1

    if (new Date(order.createdAt).toDateString() === today) {
      nextSummary.todayRevenue += order.amount
    }

    return nextSummary
  }, { ...EMPTY_SUMMARY })
}

export function OrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>('ALL')
  const [query, setQuery] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrderSummary>(EMPTY_SUMMARY)
  const [events, setEvents] = useState<OrderEvent[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [orderForm, setOrderForm] = useState<OrderCreatePayload>(INITIAL_ORDER_FORM)
  const [statusDraft, setStatusDraft] = useState<OrderStatus | ''>('')
  const [notice, setNotice] = useState('주문 데이터를 불러오는 중입니다.')
  const [loadState, setLoadState] = useState<RequestState>('idle')
  const [createState, setCreateState] = useState<RequestState>('idle')
  const [updateState, setUpdateState] = useState<RequestState>('idle')

  const selectedOrder = useMemo(
    () => orders.find((order) => order.orderId === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  )

  const loadOrders = useCallback(async (overrides?: { status?: OrderStatusFilter; query?: string }) => {
    setLoadState('loading')
    try {
      const effectiveStatus = overrides?.status ?? selectedStatus
      const effectiveQuery = overrides?.query ?? query
      const status = effectiveStatus === 'ALL' ? undefined : effectiveStatus
      const [orderPage, dashboardOrderPage, eventResult] = await Promise.all([
        getOrders({ status, query: effectiveQuery.trim() || undefined, page: 0, size: 20 }),
        getOrders({ page: 0, size: 100 }),
        getOrderEvents(20),
      ])

      setOrders(orderPage.content)
      setSummary(createSummaryFromOrders(dashboardOrderPage.content))
      setEvents(eventResult)
      setSelectedOrderId((currentId) => {
        if (orderPage.content.some((order) => order.orderId === currentId)) {
          return currentId
        }
        return orderPage.content[0]?.orderId ?? ''
      })
      setNotice(`주문 ${orderPage.totalElements}건을 불러왔습니다.`)
    } catch (error) {
      setNotice(toErrorMessage(error, '주문 데이터를 불러오지 못했습니다.'))
    } finally {
      setLoadState('idle')
    }
  }, [query, selectedStatus])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadOrders()
    }, 350)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [loadOrders])

  async function handleSelectOrder(orderId: string) {
    setSelectedOrderId(orderId)
    setStatusDraft('')
    try {
      const order = await getOrder(orderId)
      setOrders((currentOrders) => currentOrders.map((item) => (item.orderId === order.orderId ? order : item)))
    } catch (error) {
      setNotice(toErrorMessage(error, '주문 상세를 불러오지 못했습니다.'))
    }
  }

  const handleCreateOrder: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setCreateState('loading')
    try {
      const order = await createOrder({
        ...orderForm,
        amount: Number(orderForm.amount),
      })
      setOrderForm(INITIAL_ORDER_FORM)
      setSelectedStatus('ALL')
      setQuery('')
      setSelectedOrderId(order.orderId)
      setNotice(`${order.orderId} 주문이 생성되었습니다.`)
      await loadOrders({ status: 'ALL', query: '' })
    } catch (error) {
      setNotice(toErrorMessage(error, '주문 생성에 실패했습니다.'))
    } finally {
      setCreateState('idle')
    }
  }

  async function handleUpdateStatus(status?: OrderStatus) {
    if (!selectedOrder) return

    const previousStatus = selectedOrder.status
    const nextStatus = status ?? (statusDraft || selectedOrder.status)
    setUpdateState('loading')
    try {
      const order = await updateOrderStatus(selectedOrder.orderId, nextStatus)
      setOrders((currentOrders) => currentOrders.map((item) => (item.orderId === order.orderId ? order : item)))
      setSummary((currentSummary) => applyStatusChangeToSummary(currentSummary, previousStatus, order.status))
      setSelectedOrderId(order.orderId)
      setStatusDraft('')
      setNotice(`${order.orderId} 상태가 ${STATUS_LABEL[order.status]}로 변경되었습니다.`)
      await loadOrders()
    } catch (error) {
      setNotice(toErrorMessage(error, '주문 상태 변경에 실패했습니다.'))
    } finally {
      setUpdateState('idle')
    }
  }

  return (
    <>
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

      <section className="order-layout">
        <section className="panel order-board">
          <PanelTitle icon={<ClipboardCheck size={18} />} title="주문 큐" action={loadState === 'loading' ? 'Loading' : 'Live'} />

          <div className="order-controls">
            <div className="input-with-icon">
              <Search size={16} />
              <input
                aria-label="주문 검색"
                placeholder="주문번호, 고객명, 상품명 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="status-tabs" aria-label="주문 상태 필터">
              {ORDER_STATUS.map((status) => (
                <button
                  className={selectedStatus === status.value ? 'active' : undefined}
                  key={status.value}
                  type="button"
                  onClick={() => setSelectedStatus(status.value)}
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
                  onClick={() => handleSelectOrder(order.orderId)}
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

        <aside className="order-side">
          <form className="panel order-create-form" onSubmit={handleCreateOrder}>
            <PanelTitle icon={<PlusCircle size={18} />} title="주문 생성" action="POST" />
            <label>
              고객명
              <input
                required
                value={orderForm.customerName}
                onChange={(event) => setOrderForm((form) => ({ ...form, customerName: event.target.value }))}
              />
            </label>
            <label>
              상품명
              <input
                required
                value={orderForm.productName}
                onChange={(event) => setOrderForm((form) => ({ ...form, productName: event.target.value }))}
              />
            </label>
            <div className="two-col">
              <label>
                결제
                <select
                  value={orderForm.paymentMethod}
                  onChange={(event) => setOrderForm((form) => ({ ...form, paymentMethod: event.target.value as PaymentMethod }))}
                >
                  <option value="CARD">카드</option>
                  <option value="EASY_PAY">간편결제</option>
                  <option value="BANK_TRANSFER">계좌이체</option>
                </select>
              </label>
              <label>
                금액
                <input
                  min={1}
                  required
                  type="number"
                  value={orderForm.amount}
                  onChange={(event) => setOrderForm((form) => ({ ...form, amount: Number(event.target.value) }))}
                />
              </label>
            </div>
            <label>
              쿠폰 코드
              <input
                value={orderForm.couponCode}
                onChange={(event) => setOrderForm((form) => ({ ...form, couponCode: event.target.value }))}
              />
            </label>
            <label>
              주소
              <input
                required
                value={orderForm.address}
                onChange={(event) => setOrderForm((form) => ({ ...form, address: event.target.value }))}
              />
            </label>
            <button className="primary-button" disabled={createState === 'loading'} type="submit">
              <PlusCircle size={16} />
              {createState === 'loading' ? '생성 중' : '주문 생성'}
            </button>
          </form>

          <section className="panel order-detail">
            <PanelTitle icon={<PackageCheck size={18} />} title="주문 상세" action={selectedOrder ? STATUS_LABEL[selectedOrder.status] : 'Empty'} />

            {selectedOrder ? (
              <>
                <div className="detail-heading">
                  <div>
                    <strong>{selectedOrder.orderId}</strong>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>{STATUS_LABEL[selectedOrder.status]}</span>
                </div>

                <dl className="status-list">
                  <div>
                    <dt>상품</dt>
                    <dd>{selectedOrder.productName}</dd>
                  </div>
                  <div>
                    <dt>결제</dt>
                    <dd>{PAYMENT_LABEL[selectedOrder.paymentMethod]}</dd>
                  </div>
                  <div>
                    <dt>금액</dt>
                    <dd>{formatCurrency(selectedOrder.amount)}</dd>
                  </div>
                  <div>
                    <dt>쿠폰</dt>
                    <dd>{selectedOrder.couponCode ?? '없음'}</dd>
                  </div>
                  <div>
                    <dt>지역</dt>
                    <dd>{selectedOrder.address}</dd>
                  </div>
                </dl>

                <div className="order-actions">
                  <select value={statusDraft || selectedOrder.status} onChange={(event) => setStatusDraft(event.target.value as OrderStatus)}>
                    {ORDER_STATUS.filter((status) => status.value !== 'ALL').map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button className="secondary-button" disabled={updateState === 'loading'} type="button" onClick={() => handleUpdateStatus()}>
                    <RefreshCw className={updateState === 'loading' ? 'spin' : undefined} size={16} />
                    상태 변경
                  </button>
                  <button
                    className="primary-button"
                    disabled={updateState === 'loading' || selectedOrder.status === 'COMPLETED'}
                    type="button"
                    onClick={() => handleUpdateStatus('COMPLETED')}
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

          <section className="panel event-panel">
            <PanelTitle icon={<Clock3 size={18} />} title="실시간 이벤트" action="Redis" />
            <ol>
              {events.length === 0 ? (
                <li>{notice}</li>
              ) : (
                events.map((event) => <li key={event.eventId}>{event.message}</li>)
              )}
            </ol>
          </section>
        </aside>
      </section>
    </>
  )
}
