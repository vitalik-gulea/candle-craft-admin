import { create } from 'zustand'
import { listArchivedOrdersUseCase } from '../../application/orders/list-archived-orders.use-case'
import { OrderError } from '../../domain/orders/errors'
import type { Order, OrderListFilters } from '../../domain/orders/types'
import { ordersApi } from '../../infrastructure/orders/orders.api'
import { ORDERS_PAGE_SIZE } from './orders.store'

interface OrdersArchiveState {
  items: Order[]
  total: number
  filters: OrderListFilters
  isLoading: boolean
  errorCode: OrderError['code'] | null
  errorDetails: string | string[] | null
  load: (filters?: OrderListFilters) => Promise<void>
  clearError: () => void
}

let latestRequestId = 0

export const useOrdersArchiveStore = create<OrdersArchiveState>((set, get) => ({
  items: [],
  total: 0,
  filters: { page: 1, limit: ORDERS_PAGE_SIZE },
  isLoading: false,
  errorCode: null,
  errorDetails: null,

  async load(filters) {
    const nextFilters = filters ?? get().filters
    const requestId = ++latestRequestId
    set({ isLoading: true, errorCode: null, errorDetails: null, filters: nextFilters })
    try {
      const result = await listArchivedOrdersUseCase(ordersApi, nextFilters)
      if (requestId !== latestRequestId) return
      set({ items: result.items, total: result.total, isLoading: false })
    } catch (error) {
      if (requestId !== latestRequestId) return
      const code = error instanceof OrderError ? error.code : 'UNKNOWN'
      const details = error instanceof OrderError ? error.details : null
      set({ items: [], total: 0, isLoading: false, errorCode: code, errorDetails: details })
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
