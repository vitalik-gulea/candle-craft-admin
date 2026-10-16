import type { CategoriesRepository } from './ports'
import type { ReorderCategoriesInput } from '../../domain/categories/types'

export function reorderCategoriesUseCase(
  repository: CategoriesRepository,
  input: ReorderCategoriesInput,
) {
  return repository.reorder(input)
}
