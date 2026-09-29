import type {
  CreateNotificationInput,
  Notification,
  NotificationListFilters,
  UpdateNotificationInput,
} from '../../domain/notifications/types'

export interface NotificationsRepository {
  list(filters?: NotificationListFilters): Promise<Notification[]>
  create(input: CreateNotificationInput): Promise<Notification>
  update(id: string, input: UpdateNotificationInput): Promise<Notification>
  remove(id: string): Promise<void>
}
