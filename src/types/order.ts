export type OrderStatus = 'PAYMENT_CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'COMPLETED' | 'ON_HOLD'

export type PaymentMethod = 'CARD' | 'EASY_PAY' | 'BANK_TRANSFER'

export type OrderRisk = 'NORMAL' | 'ATTENTION' | 'URGENT'

export type Order = {
  orderId: string
  customerName: string
  productName: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  amount: number
  couponCode: string | null
  address: string
  risk: OrderRisk
  createdAt: string
  updatedAt: string
}

export type OrderCreatePayload = {
  customerName: string
  productName: string
  paymentMethod: PaymentMethod
  amount: number
  couponCode: string
  address: string
}

export type OrderPage = {
  content: Order[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type OrderSummary = {
  activeOrderCount: number
  paymentConfirmedCount: number
  preparingCount: number
  shippingCount: number
  completedCount: number
  onHoldCount: number
  todayRevenue: number
}

export type OrderEvent = {
  eventId: number
  orderId: string
  type: 'CREATED' | 'STATUS_CHANGED'
  message: string
  occurredAt: string
}
