import type {
  TelegramSubscriber,
  TelegramSubscriberDecision,
  TelegramSubscriberFilters,
  TelegramSubscriberPage,
} from '../../domain/telegram/types'

export interface TelegramRepository {
  listSubscribers(filters?: TelegramSubscriberFilters): Promise<TelegramSubscriberPage>
  changeSubscriberStatus(
    id: string,
    status: TelegramSubscriberDecision,
  ): Promise<TelegramSubscriber>
}
