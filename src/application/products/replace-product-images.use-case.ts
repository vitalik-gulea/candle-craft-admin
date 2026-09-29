import type { ProductsRepository } from './ports'
import type { ProductImageInput } from '../../domain/products/types'

export function replaceProductImagesUseCase(
  repository: ProductsRepository,
  id: string,
  images: ProductImageInput[],
) {
  return repository.replaceImages(id, images)
}
