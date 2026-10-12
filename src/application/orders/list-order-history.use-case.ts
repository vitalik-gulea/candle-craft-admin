import type { OrdersRepository } from './ports'

export function listOrderHistoryUseCase(repository: OrdersRepository, id: string) {
  return repository.listHistory(id)
}
