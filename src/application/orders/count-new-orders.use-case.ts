import type { OrdersRepository } from './ports'

export async function countNewOrdersUseCase(repository: OrdersRepository): Promise<number> {
  const page = await repository.list({ status: 'new', page: 1, limit: 1 })
  return page.total
}
