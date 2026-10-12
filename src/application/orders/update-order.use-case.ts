import type { UpdateOrderInput } from '../../domain/orders/types'
import type { OrdersRepository } from './ports'

export function updateOrderUseCase(
  repository: OrdersRepository,
  id: string,
  input: UpdateOrderInput,
) {
  return repository.update(id, input)
}
