import type { TelegramSubscriberFilters } from '../../domain/telegram/types'
import type { TelegramRepository } from './ports'

export function listTelegramSubscribersUseCase(
  repository: TelegramRepository,
  filters?: TelegramSubscriberFilters,
) {
  return repository.listSubscribers(filters)
}
