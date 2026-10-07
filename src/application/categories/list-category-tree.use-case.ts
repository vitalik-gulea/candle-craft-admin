import type { CategoriesRepository } from './ports'

export function listCategoryTreeUseCase(repository: CategoriesRepository) {
  return repository.listTree()
}
