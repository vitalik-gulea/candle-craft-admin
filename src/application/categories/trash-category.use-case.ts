import type { CategoriesRepository } from './ports'
import type { TrashCategoryInput } from '../../domain/categories/types'

export function trashCategoryUseCase(
  repository: CategoriesRepository,
  id: string,
  input?: TrashCategoryInput,
) {
  return repository.trash(id, input)
}
