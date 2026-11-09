import type { OrdersRepository } from './ports'

export function restoreOrderUseCase(repository: OrdersRepository, id: string) {
  return repository.restore(id)
}
