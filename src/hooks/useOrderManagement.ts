import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SubmitEventHandler } from 'react'
import {
  createOrder,
  getOrder,
  getOrderEvents,
  getOrders,
  updateOrderStatus,
} from '../api/orders'
import type { RequestState } from '../types/coupon'
import type { Order, OrderCreatePayload, OrderEvent, OrderStatus, OrderSummary } from '../types/order'
import {
  EMPTY_SUMMARY,
  INITIAL_AMOUNT_INPUT,
  INITIAL_ORDER_FORM,
  STATUS_LABEL,
  type OrderStatusFilter,
} from '../utils/orders/constants'
import { toErrorMessage } from '../utils/orders/formatters'
import { applyStatusChangeToSummary, createSummaryFromOrders } from '../utils/orders/summary'

export function useOrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>('ALL')
  const [query, setQuery] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrderSummary>(EMPTY_SUMMARY)
  const [events, setEvents] = useState<OrderEvent[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [orderForm, setOrderForm] = useState<OrderCreatePayload>(INITIAL_ORDER_FORM)
  const [amountInput, setAmountInput] = useState(INITIAL_AMOUNT_INPUT)
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
        getOrderEvents(5),
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
        amount: Number(amountInput),
      })
      setOrderForm(INITIAL_ORDER_FORM)
      setAmountInput(INITIAL_AMOUNT_INPUT)
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

  return {
    amountInput,
    createState,
    events,
    handleCreateOrder,
    handleSelectOrder,
    handleUpdateStatus,
    loadState,
    notice,
    orderForm,
    orders,
    query,
    selectedOrder,
    selectedStatus,
    setAmountInput,
    setOrderForm,
    setQuery,
    setSelectedStatus,
    setStatusDraft,
    statusDraft,
    summary,
    updateState,
  }
}
