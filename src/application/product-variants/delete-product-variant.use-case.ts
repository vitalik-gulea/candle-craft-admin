import type { ProductVariantsRepository } from './ports'

export function deleteProductVariantUseCase(
  repository: ProductVariantsRepository,
  productId: string,
  variantId: string,
) {
  return repository.remove(productId, variantId)
}
