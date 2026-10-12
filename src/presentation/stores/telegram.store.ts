import { create } from 'zustand'
import { changeTelegramSubscriberStatusUseCase } from '../../application/telegram/change-subscriber-status.use-case'
import { countPendingTelegramSubscribersUseCase } from '../../application/telegram/count-pending-subscribers.use-case'
import { listTelegramSubscribersUseCase } from '../../application/telegram/list-subscribers.use-case'
import { TelegramError } from '../../domain/telegram/errors'
import type {
  TelegramSubscriber,
  TelegramSubscriberDecision,
  TelegramSubscriberFilters,
} from '../../domain/telegram/types'
import { telegramApi } from '../../infrastructure/telegram/telegram.api'

export const TELEGRAM_PAGE_SIZE = 20

type ChangeResult = 'ok' | 'conflict' | 'error'

interface TelegramState {
  items: TelegramSubscriber[]
  total: number
  filters: TelegramSubscriberFilters
  pendingCount: number
  isLoading: boolean
  mutatingId: string | null
  errorCode: TelegramError['code'] | null
  errorDetails: string | string[] | null
  load: (filters?: TelegramSubscriberFilters) => Promise<void>
  loadPendingCount: () => Promise<void>
  changeStatus: (id: string, status: TelegramSubscriberDecision) => Promise<ChangeResult>
  clearError: () => void
}

let latestRequestId = 0

export const useTelegramStore = create<TelegramState>((set, get) => ({
  items: [],
  total: 0,
  filters: { status: 'pending', page: 1, limit: TELEGRAM_PAGE_SIZE },
  pendingCount: 0,
  isLoading: false,
  mutatingId: null,
  errorCode: null,
  errorDetails: null,

  async load(filters) {
    const nextFilters = filters ?? get().filters
    const requestId = ++latestRequestId
    set({ isLoading: true, errorCode: null, errorDetails: null, filters: nextFilters })
    try {
      const result = await listTelegramSubscribersUseCase(telegramApi, nextFilters)
      if (requestId !== latestRequestId) return
      set({ items: result.items, total: result.total, isLoading: false })
    } catch (error) {
      if (requestId !== latestRequestId) return
      const code = error instanceof TelegramError ? error.code : 'UNKNOWN'
      const details = error instanceof TelegramError ? error.details : null
      set({ items: [], total: 0, isLoading: false, errorCode: code, errorDetails: details })
    }
  },

  async loadPendingCount() {
    try {
      const count = await countPendingTelegramSubscribersUseCase(telegramApi)
      set({ pendingCount: count })
    } catch {
      set({ pendingCount: 0 })
    }
  },

  async changeStatus(id, status) {
    set({ mutatingId: id })
    try {
      await changeTelegramSubscriberStatusUseCase(telegramApi, id, status)
      set({ mutatingId: null })
      await Promise.all([get().load(), get().loadPendingCount()])
      return 'ok'
    } catch (error) {
      set({ mutatingId: null })
      const code = error instanceof TelegramError ? error.code : null
      if (code === 'CONFLICT' || code === 'NOT_FOUND') {
        await Promise.all([get().load(), get().loadPendingCount()])
      }
      return code === 'CONFLICT' ? 'conflict' : 'error'
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
