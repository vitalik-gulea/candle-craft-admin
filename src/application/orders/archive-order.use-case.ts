import type { OrdersRepository } from './ports'

export function archiveOrderUseCase(repository: OrdersRepository, id: string) {
  return repository.archive(id)
}
