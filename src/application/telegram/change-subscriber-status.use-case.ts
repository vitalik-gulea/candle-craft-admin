import type { TelegramSubscriberDecision } from '../../domain/telegram/types'
import type { TelegramRepository } from './ports'

export function changeTelegramSubscriberStatusUseCase(
  repository: TelegramRepository,
  id: string,
  status: TelegramSubscriberDecision,
) {
  return repository.changeSubscriberStatus(id, status)
}
