import type { ProductsRepository } from './ports'
import type { UpdateProductInput } from '../../domain/products/types'

export function updateProductUseCase(
  repository: ProductsRepository,
  id: string,
  input: UpdateProductInput,
) {
  return repository.update(id, input)
}
