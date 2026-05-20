import type { Order, OrderStatus, OrderSummary } from '../../types/order'
import { EMPTY_SUMMARY } from './constants'

export function isActiveStatus(status: OrderStatus) {
  return status !== 'COMPLETED'
}

export function applyStatusChangeToSummary(
  summary: OrderSummary,
  previousStatus: OrderStatus,
  nextStatus: OrderStatus,
): OrderSummary {
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

export function createSummaryFromOrders(orders: Order[]): OrderSummary {
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
