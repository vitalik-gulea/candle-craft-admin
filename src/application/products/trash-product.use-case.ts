import type { ProductsRepository } from './ports'

export function trashProductUseCase(repository: ProductsRepository, id: string) {
  return repository.trash(id)
}
