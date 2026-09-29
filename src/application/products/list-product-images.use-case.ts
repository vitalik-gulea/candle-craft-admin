import type { ProductsRepository } from './ports'

export function listProductImagesUseCase(
  repository: ProductsRepository,
  id: string,
) {
  return repository.listImages(id)
}
