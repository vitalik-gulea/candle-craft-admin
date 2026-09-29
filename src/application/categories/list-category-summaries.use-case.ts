import type { CategoriesRepository } from './ports'

export function listCategorySummariesUseCase(repository: CategoriesRepository) {
  return repository.listSummaries()
}
