import { OrdersListView } from '../../features/orders/OrdersListView'
import { useOrdersStore } from '../../stores/orders.store'

export function OrdersPage() {
  const items = useOrdersStore((state) => state.items)
  const total = useOrdersStore((state) => state.total)
  const filters = useOrdersStore((state) => state.filters)
  const isLoading = useOrdersStore((state) => state.isLoading)
  const errorCode = useOrdersStore((state) => state.errorCode)
  const errorDetails = useOrdersStore((state) => state.errorDetails)
  const load = useOrdersStore((state) => state.load)
  const loadNewCount = useOrdersStore((state) => state.loadNewCount)
  const clearError = useOrdersStore((state) => state.clearError)

  return (
    <OrdersListView
      mode="active"
      items={items}
      total={total}
      filters={filters}
      isLoading={isLoading}
      errorCode={errorCode}
      errorDetails={errorDetails}
      load={load}
      clearError={clearError}
      onChanged={() => void loadNewCount()}
    />
  )
}
