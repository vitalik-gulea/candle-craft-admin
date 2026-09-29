import type { NotificationsRepository } from './ports'
import type { NotificationListFilters } from '../../domain/notifications/types'

export function listNotificationsUseCase(
  repository: NotificationsRepository,
  filters?: NotificationListFilters,
) {
  return repository.list(filters)
}
