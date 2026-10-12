import { create } from 'zustand'
import { changeOrderStatusUseCase } from '../../application/orders/change-order-status.use-case'
import { getOrderUseCase } from '../../application/orders/get-order.use-case'
import { listOrderHistoryUseCase } from '../../application/orders/list-order-history.use-case'
import { updateOrderUseCase } from '../../application/orders/update-order.use-case'
import { OrderError } from '../../domain/orders/errors'
import type {
  Order,
  OrderHistoryEntry,
  OrderStatus,
  UpdateOrderInput,
} from '../../domain/orders/types'
import { ordersApi } from '../../infrastructure/orders/orders.api'

export type OrderMutationResult = 'ok' | 'conflict' | 'error'

interface OrderDetailState {
  order: Order | null
  history: OrderHistoryEntry[]
  isLoading: boolean
  isMutating: boolean
  errorCode: OrderError['code'] | null
  errorDetails: string | string[] | null
  load: (id: string) => Promise<void>
  reset: () => void
  changeStatus: (status: OrderStatus) => Promise<OrderMutationResult>
  update: (input: UpdateOrderInput) => Promise<boolean>
  clearError: () => void
}

let latestRequestId = 0

function toError(error: unknown) {
  return {
    errorCode: error instanceof OrderError ? error.code : ('UNKNOWN' as const),
    errorDetails: error instanceof OrderError ? error.details : null,
  }
}

async function fetchOrderWithHistory(id: string) {
  const [order, history] = await Promise.all([
    getOrderUseCase(ordersApi, id),
    listOrderHistoryUseCase(ordersApi, id),
  ])
  return { order, history }
}

function refreshHistory(id: string, fallback: OrderHistoryEntry[]) {
  return listOrderHistoryUseCase(ordersApi, id).catch(() => fallback)
}

export const useOrderDetailStore = create<OrderDetailState>((set, get) => ({
  order: null,
  history: [],
  isLoading: false,
  isMutating: false,
  errorCode: null,
  errorDetails: null,

  async load(id) {
    const requestId = ++latestRequestId
    set({ isLoading: true, errorCode: null, errorDetails: null })
    try {
      const { order, history } = await fetchOrderWithHistory(id)
      if (requestId !== latestRequestId) return
      set({ order, history, isLoading: false })
    } catch (error) {
      if (requestId !== latestRequestId) return
      set({ order: null, history: [], isLoading: false, ...toError(error) })
    }
  },

  reset() {
    latestRequestId++
    set({
      order: null,
      history: [],
      isLoading: false,
      isMutating: false,
      errorCode: null,
      errorDetails: null,
    })
  },

  async changeStatus(status) {
    const current = get().order
    if (!current) return 'error'
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const order = await changeOrderStatusUseCase(ordersApi, current.id, status)
      const history = await refreshHistory(current.id, get().history)
      set({ order, history, isMutating: false })
      return 'ok'
    } catch (error) {
      if (error instanceof OrderError && error.code === 'CONFLICT') {
        try {
          const fresh = await fetchOrderWithHistory(current.id)
          set({ ...fresh, isMutating: false })
        } catch (reloadError) {
          set({ isMutating: false, ...toError(reloadError) })
        }
        return 'conflict'
      }
      set({ isMutating: false, ...toError(error) })
      return 'error'
    }
  },

  async update(input) {
    const current = get().order
    if (!current) return false
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const order = await updateOrderUseCase(ordersApi, current.id, input)
      const history = await refreshHistory(current.id, get().history)
      set({ order, history, isMutating: false })
      return true
    } catch (error) {
      set({ isMutating: false, ...toError(error) })
      return false
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
