import { create } from 'zustand'
import { countNewOrdersUseCase } from '../../application/orders/count-new-orders.use-case'
import { listOrdersUseCase } from '../../application/orders/list-orders.use-case'
import { OrderError } from '../../domain/orders/errors'
import type { Order, OrderListFilters } from '../../domain/orders/types'
import { ordersApi } from '../../infrastructure/orders/orders.api'

export const ORDERS_PAGE_SIZE = 20

interface OrdersState {
  items: Order[]
  total: number
  filters: OrderListFilters
  newCount: number
  isLoading: boolean
  errorCode: OrderError['code'] | null
  errorDetails: string | string[] | null
  load: (filters?: OrderListFilters) => Promise<void>
  loadNewCount: () => Promise<void>
  clearError: () => void
}

let latestRequestId = 0

export const useOrdersStore = create<OrdersState>((set, get) => ({
  items: [],
  total: 0,
  filters: { page: 1, limit: ORDERS_PAGE_SIZE },
  newCount: 0,
  isLoading: false,
  errorCode: null,
  errorDetails: null,

  async load(filters) {
    const nextFilters = filters ?? get().filters
    const requestId = ++latestRequestId
    set({ isLoading: true, errorCode: null, errorDetails: null, filters: nextFilters })
    try {
      const result = await listOrdersUseCase(ordersApi, nextFilters)
      if (requestId !== latestRequestId) return
      set({ items: result.items, total: result.total, isLoading: false })
    } catch (error) {
      if (requestId !== latestRequestId) return
      const code = error instanceof OrderError ? error.code : 'UNKNOWN'
      const details = error instanceof OrderError ? error.details : null
      set({ items: [], total: 0, isLoading: false, errorCode: code, errorDetails: details })
    }
  },

  async loadNewCount() {
    try {
      const count = await countNewOrdersUseCase(ordersApi)
      set({ newCount: count })
    } catch {
      set({ newCount: 0 })
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
