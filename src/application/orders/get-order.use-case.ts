import type { OrdersRepository } from './ports'

export function getOrderUseCase(repository: OrdersRepository, id: string) {
  return repository.getById(id)
}
