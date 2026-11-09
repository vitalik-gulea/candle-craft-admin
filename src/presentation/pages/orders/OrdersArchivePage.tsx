import { OrdersListView } from '../../features/orders/OrdersListView'
import { useOrdersArchiveStore } from '../../stores/orders-archive.store'

export function OrdersArchivePage() {
  const items = useOrdersArchiveStore((state) => state.items)
  const total = useOrdersArchiveStore((state) => state.total)
  const filters = useOrdersArchiveStore((state) => state.filters)
  const isLoading = useOrdersArchiveStore((state) => state.isLoading)
  const errorCode = useOrdersArchiveStore((state) => state.errorCode)
  const errorDetails = useOrdersArchiveStore((state) => state.errorDetails)
  const load = useOrdersArchiveStore((state) => state.load)
  const clearError = useOrdersArchiveStore((state) => state.clearError)

  return (
    <OrdersListView
      mode="archive"
      items={items}
      total={total}
      filters={filters}
      isLoading={isLoading}
      errorCode={errorCode}
      errorDetails={errorDetails}
      load={load}
      clearError={clearError}
    />
  )
}
