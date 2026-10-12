export type TelegramSubscriberStatus = 'pending' | 'approved' | 'rejected' | 'revoked'
export type TelegramSubscriberDecision = 'approved' | 'rejected' | 'revoked'

export const TELEGRAM_SUBSCRIBER_STATUSES: readonly TelegramSubscriberStatus[] = [
  'pending',
  'approved',
  'rejected',
  'revoked',
]

export const TELEGRAM_MAX_PAGE_SIZE = 100

export interface TelegramSubscriber {
  id: string
  chatId: string
  username: string | null
  firstName: string | null
  lastName: string | null
  displayName: string
  status: TelegramSubscriberStatus
  decidedByEmail: string | null
  decidedAt: string | null
  createdAt: string
}

export interface TelegramSubscriberFilters {
  status?: TelegramSubscriberStatus
  page?: number
  limit?: number
}

export interface TelegramSubscriberPage {
  items: TelegramSubscriber[]
  total: number
  page: number
  limit: number
}

export function getAvailableDecisions(
  status: TelegramSubscriberStatus,
): TelegramSubscriberDecision[] {
  if (status === 'pending') return ['approved', 'rejected']
  if (status === 'approved') return ['revoked']
  return ['approved']
}
