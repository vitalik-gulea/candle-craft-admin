import type { CategoriesRepository } from './ports'
import type { CreateCategoryInput } from '../../domain/categories/types'

export function createCategoryUseCase(
  repository: CategoriesRepository,
  input: CreateCategoryInput,
) {
  return repository.create(input)
}
