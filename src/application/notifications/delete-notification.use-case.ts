import type { NotificationsRepository } from './ports'

export function deleteNotificationUseCase(repository: NotificationsRepository, id: string) {
  return repository.remove(id)
}
