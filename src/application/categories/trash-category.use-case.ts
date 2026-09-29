import type { CategoriesRepository } from './ports'

export function trashCategoryUseCase(repository: CategoriesRepository, id: string) {
  return repository.trash(id)
}
