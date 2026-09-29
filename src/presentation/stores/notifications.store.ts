import { create } from 'zustand'
import { createNotificationUseCase } from '../../application/notifications/create-notification.use-case'
import { deleteNotificationUseCase } from '../../application/notifications/delete-notification.use-case'
import { listNotificationsUseCase } from '../../application/notifications/list-notifications.use-case'
import { updateNotificationUseCase } from '../../application/notifications/update-notification.use-case'
import { NotificationError } from '../../domain/notifications/errors'
import type {
  CreateNotificationInput,
  Notification,
  UpdateNotificationInput,
} from '../../domain/notifications/types'
import { notificationsApi } from '../../infrastructure/notifications/notifications.api'

interface NotificationsState {
  items: Notification[]
  isLoading: boolean
  isMutating: boolean
  errorCode: NotificationError['code'] | null
  errorDetails: string | string[] | null
  load: () => Promise<void>
  create: (input: CreateNotificationInput) => Promise<Notification | null>
  update: (id: string, input: UpdateNotificationInput) => Promise<Notification | null>
  remove: (id: string) => Promise<boolean>
  clearError: () => void
}

function toErrorState(error: unknown) {
  return {
    errorCode: error instanceof NotificationError ? error.code : ('UNKNOWN' as const),
    errorDetails: error instanceof NotificationError ? error.details : null,
  }
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  isLoading: false,
  isMutating: false,
  errorCode: null,
  errorDetails: null,

  async load() {
    set({ isLoading: true, errorCode: null, errorDetails: null })
    try {
      const items = await listNotificationsUseCase(notificationsApi)
      set({ items, isLoading: false })
    } catch (error) {
      set({ isLoading: false, ...toErrorState(error) })
    }
  },

  async create(input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const item = await createNotificationUseCase(notificationsApi, input)
      set((state) => ({ items: [item, ...state.items], isMutating: false }))
      return item
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return null
    }
  },

  async update(id, input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const item = await updateNotificationUseCase(notificationsApi, id, input)
      set((state) => ({
        items: state.items.map((current) => (current.id === id ? item : current)),
        isMutating: false,
      }))
      return item
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return null
    }
  },

  async remove(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await deleteNotificationUseCase(notificationsApi, id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isMutating: false,
      }))
      return true
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return false
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
