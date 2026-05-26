import { useOrderManagement } from '../hooks/useOrderManagement'
import { OrderBoard } from './orders/OrderBoard'
import { OrderCreateForm } from './orders/OrderCreateForm'
import { OrderDetail } from './orders/OrderDetail'
import { OrderEvents } from './orders/OrderEvents'
import { OrderMetrics } from './orders/OrderMetrics'

export function OrderManagement() {
  const orders = useOrderManagement()

  return (
    <>
      <OrderMetrics summary={orders.summary} />

      <section className="order-layout">
        <OrderBoard
          currentPage={orders.currentPage}
          loadState={orders.loadState}
          notice={orders.notice}
          orders={orders.orders}
          pageSize={orders.pageSize}
          query={orders.query}
          selectedOrder={orders.selectedOrder}
          selectedStatus={orders.selectedStatus}
          totalElements={orders.totalElements}
          totalPages={orders.totalPages}
          onPageChange={orders.setCurrentPage}
          onQueryChange={orders.setQuery}
          onSelectOrder={orders.handleSelectOrder}
          onStatusChange={orders.setSelectedStatus}
        />

        <aside className="order-side">
          <OrderCreateForm
            amountInput={orders.amountInput}
            createState={orders.createState}
            orderForm={orders.orderForm}
            onAmountInputChange={orders.setAmountInput}
            onFormChange={orders.setOrderForm}
            onSubmit={orders.handleCreateOrder}
          />

          <OrderDetail
            order={orders.selectedOrder}
            statusDraft={orders.statusDraft}
            updateState={orders.updateState}
            onStatusDraftChange={orders.setStatusDraft}
            onUpdateStatus={orders.handleUpdateStatus}
          />

          <OrderEvents events={orders.events} notice={orders.notice} />
        </aside>
      </section>
    </>
  )
}
