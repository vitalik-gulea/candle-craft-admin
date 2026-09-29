import type { ProductsRepository } from './ports'

export function copyProductUseCase(repository: ProductsRepository, id: string) {
  return repository.copy(id)
}
