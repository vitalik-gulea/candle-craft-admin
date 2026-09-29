import type { CategoriesRepository } from './ports'
import type { PermanentlyDeleteCategoryInput } from '../../domain/categories/types'

export function permanentlyDeleteCategoryUseCase(
  repository: CategoriesRepository,
  id: string,
  input?: PermanentlyDeleteCategoryInput,
) {
  return repository.permanentlyDelete(id, input)
}
