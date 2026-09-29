import type { NotificationsRepository } from './ports'
import type { CreateNotificationInput } from '../../domain/notifications/types'

export function createNotificationUseCase(
  repository: NotificationsRepository,
  input: CreateNotificationInput,
) {
  return repository.create(input)
}
