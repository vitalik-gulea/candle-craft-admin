import type { CategoriesRepository } from './ports'
import type { CategoryListFilters } from '../../domain/categories/types'

export function listCategoriesUseCase(
  repository: CategoriesRepository,
  filters?: CategoryListFilters,
) {
  return repository.list(filters)
}
