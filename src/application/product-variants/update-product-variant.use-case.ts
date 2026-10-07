import type { ProductVariantsRepository } from './ports'
import type { UpdateProductVariantInput } from '../../domain/product-variants/types'

export function updateProductVariantUseCase(
  repository: ProductVariantsRepository,
  productId: string,
  variantId: string,
  input: UpdateProductVariantInput,
) {
  return repository.update(productId, variantId, input)
}
