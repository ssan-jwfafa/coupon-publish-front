import type { OrderCreatePayload, OrderStatus, OrderSummary, PaymentMethod } from '../../types/order'

export type OrderStatusFilter = 'ALL' | OrderStatus

export const ORDER_STATUS: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'PAYMENT_CONFIRMED', label: '결제확인' },
  { value: 'PREPARING', label: '상품준비' },
  { value: 'SHIPPING', label: '배송중' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'ON_HOLD', label: '보류' },
]

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PAYMENT_CONFIRMED: '결제확인',
  PREPARING: '상품준비',
  SHIPPING: '배송중',
  COMPLETED: '완료',
  ON_HOLD: '보류',
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CARD: '카드',
  EASY_PAY: '간편결제',
  BANK_TRANSFER: '계좌이체',
}

export const EMPTY_SUMMARY: OrderSummary = {
  activeOrderCount: 0,
  paymentConfirmedCount: 0,
  preparingCount: 0,
  shippingCount: 0,
  completedCount: 0,
  onHoldCount: 0,
  todayRevenue: 0,
}

export const INITIAL_ORDER_FORM: OrderCreatePayload = {
  customerName: '',
  productName: '',
  paymentMethod: 'EASY_PAY',
  amount: 10000,
  couponCode: '',
  address: '',
}

export const INITIAL_AMOUNT_INPUT = '10000'
