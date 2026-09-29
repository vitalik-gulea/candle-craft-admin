import type { ProductsRepository } from './ports'
import type { CreateProductInput } from '../../domain/products/types'

export function createProductUseCase(
  repository: ProductsRepository,
  input: CreateProductInput,
) {
  return repository.create(input)
}
