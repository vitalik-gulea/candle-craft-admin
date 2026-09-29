import type { ProductsRepository } from './ports'

export function getProductUseCase(repository: ProductsRepository, id: string) {
  return repository.getById(id)
}
