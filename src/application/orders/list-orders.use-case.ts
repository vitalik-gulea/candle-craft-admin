import type { OrderListFilters } from '../../domain/orders/types'
import type { OrdersRepository } from './ports'

export function listOrdersUseCase(repository: OrdersRepository, filters?: OrderListFilters) {
  return repository.list(filters)
}
