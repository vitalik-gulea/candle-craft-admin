import type { OrderStatus } from './types'

export type OrderStatusAction = 'completed' | 'cancelled'

export function getAvailableStatusActions(status: OrderStatus): OrderStatusAction[] {
  if (status === 'new') return ['completed', 'cancelled']
  return []
}

export function isFinalStatus(status: OrderStatus): boolean {
  return status === 'completed' || status === 'cancelled'
}
