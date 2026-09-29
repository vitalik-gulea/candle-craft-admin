import type { ProductsRepository } from './ports'

export function restoreProductUseCase(repository: ProductsRepository, id: string) {
  return repository.restore(id)
}
