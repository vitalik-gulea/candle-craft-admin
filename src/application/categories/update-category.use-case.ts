import type { CategoriesRepository } from './ports'
import type { UpdateCategoryInput } from '../../domain/categories/types'

export function updateCategoryUseCase(
  repository: CategoriesRepository,
  id: string,
  input: UpdateCategoryInput,
) {
  return repository.update(id, input)
}
