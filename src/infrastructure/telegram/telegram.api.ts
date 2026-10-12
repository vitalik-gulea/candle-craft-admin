import type { TelegramRepository } from '../../application/telegram/ports'
import { TelegramError } from '../../domain/telegram/errors'
import type {
  TelegramSubscriber,
  TelegramSubscriberDecision,
  TelegramSubscriberFilters,
  TelegramSubscriberPage,
} from '../../domain/telegram/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

function toTelegramError(error: unknown): TelegramError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new TelegramError('NOT_FOUND', undefined, details)
  if (status === 409) return new TelegramError('CONFLICT', undefined, details)
  if (status === 400) return new TelegramError('VALIDATION', undefined, details)
  if (status === 403) return new TelegramError('FORBIDDEN', undefined, details)
  return new TelegramError('UNKNOWN', undefined, details)
}

function toListParams(filters?: TelegramSubscriberFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (!filters) return params
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') continue
    params[key] = value
  }
  return params
}

export const telegramApi: TelegramRepository = {
  async listSubscribers(filters?: TelegramSubscriberFilters): Promise<TelegramSubscriberPage> {
    try {
      const { data } = await httpClient.get<TelegramSubscriberPage>(
        '/v1/telegram/admin/subscribers',
        { params: toListParams(filters) },
      )
      return data
    } catch (error) {
      throw toTelegramError(error)
    }
  },

  async changeSubscriberStatus(
    id: string,
    status: TelegramSubscriberDecision,
  ): Promise<TelegramSubscriber> {
    try {
      const { data } = await httpClient.patch<TelegramSubscriber>(
        `/v1/telegram/admin/subscribers/${id}/status`,
        { status },
      )
      return data
    } catch (error) {
      throw toTelegramError(error)
    }
  },
}
