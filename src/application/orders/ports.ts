import type {
  Order,
  OrderHistoryEntry,
  OrderListFilters,
  OrderListPage,
  OrderStatus,
  UpdateOrderInput,
} from '../../domain/orders/types'

export interface OrdersRepository {
  list(filters?: OrderListFilters): Promise<OrderListPage>
  getById(id: string): Promise<Order>
  listHistory(id: string): Promise<OrderHistoryEntry[]>
  update(id: string, input: UpdateOrderInput): Promise<Order>
  changeStatus(id: string, status: OrderStatus): Promise<Order>
}
