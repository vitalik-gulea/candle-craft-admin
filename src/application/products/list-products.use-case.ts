import type { ProductsRepository } from './ports'
import type { ProductListFilters } from '../../domain/products/types'

export function listProductsUseCase(
  repository: ProductsRepository,
  filters?: ProductListFilters,
) {
  return repository.list(filters)
}
