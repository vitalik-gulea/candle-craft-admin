import type { ProductVariantsRepository } from './ports'

export function listProductVariantsUseCase(
  repository: ProductVariantsRepository,
  productId: string,
) {
  return repository.list(productId)
}
