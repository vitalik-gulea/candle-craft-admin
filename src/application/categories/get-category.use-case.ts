import type { CategoriesRepository } from './ports'

export function getCategoryUseCase(repository: CategoriesRepository, id: string) {
  return repository.getById(id)
}
