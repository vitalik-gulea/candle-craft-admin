import type { LocalizedString } from '../shared/localized'

export interface Notification {
  id: string
  message: LocalizedString
  isActive: boolean
  expiresAt: string | null
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationInput {
  message: LocalizedString
  isActive?: boolean
  durationHours?: number
}

export interface UpdateNotificationInput {
  message?: LocalizedString
  isActive?: boolean
  durationHours?: number | null
}

export interface NotificationListFilters {
  isActive?: boolean
}
