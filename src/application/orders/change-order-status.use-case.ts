import type { OrderStatus } from '../../domain/orders/types'
import type { OrdersRepository } from './ports'

export function changeOrderStatusUseCase(
  repository: OrdersRepository,
  id: string,
  status: OrderStatus,
) {
  return repository.changeStatus(id, status)
}
