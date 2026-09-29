import type { NotificationsRepository } from './ports'
import type { UpdateNotificationInput } from '../../domain/notifications/types'

export function updateNotificationUseCase(
  repository: NotificationsRepository,
  id: string,
  input: UpdateNotificationInput,
) {
  return repository.update(id, input)
}
