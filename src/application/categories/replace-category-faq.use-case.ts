import type { CategoriesRepository } from './ports'
import type { CategoryFaqItemInput } from '../../domain/categories/types'

export function replaceCategoryFaqUseCase(
  repository: CategoriesRepository,
  id: string,
  items: CategoryFaqItemInput[],
) {
  return repository.replaceFaq(id, items)
}
