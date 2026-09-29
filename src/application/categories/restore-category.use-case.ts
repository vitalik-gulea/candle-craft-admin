import type { CategoriesRepository } from './ports'

export function restoreCategoryUseCase(repository: CategoriesRepository, id: string) {
  return repository.restore(id)
}
