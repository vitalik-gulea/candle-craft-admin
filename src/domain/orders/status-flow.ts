import type { DeliveryMethod, OrderStatus } from './types'

export type OrderStatusAction = 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled'

export function getAvailableStatusActions(
  status: OrderStatus,
  deliveryMethod: DeliveryMethod,
): OrderStatusAction[] {
  if (status === 'new') return ['processing', 'cancelled']
  if (status === 'processing') {
    return deliveryMethod === 'pickup'
      ? ['ready_for_pickup', 'completed', 'cancelled']
      : ['completed', 'cancelled']
  }
  if (status === 'ready_for_pickup') return ['completed', 'cancelled']
  return []
}

export function isFinalStatus(status: OrderStatus): boolean {
  return status === 'completed' || status === 'cancelled'
}
