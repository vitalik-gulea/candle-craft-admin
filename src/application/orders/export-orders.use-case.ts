import { ORDERS_MAX_PAGE_SIZE, type Order, type OrderListFilters } from '../../domain/orders/types'
import type { OrdersRepository } from './ports'

export async function exportOrdersUseCase(
  repository: OrdersRepository,
  filters?: OrderListFilters,
): Promise<Order[]> {
  const base = { ...filters, limit: ORDERS_MAX_PAGE_SIZE }
  const first = await repository.list({ ...base, page: 1 })
  const orders = [...first.items]
  const totalPages = Math.ceil(first.total / ORDERS_MAX_PAGE_SIZE)

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await repository.list({ ...base, page })
    orders.push(...next.items)
  }

  return orders
}
