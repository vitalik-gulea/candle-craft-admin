import type { ProductVariantsRepository } from './ports'
import type { CreateProductVariantInput } from '../../domain/product-variants/types'

export function createProductVariantUseCase(
  repository: ProductVariantsRepository,
  productId: string,
  input: CreateProductVariantInput,
) {
  return repository.create(productId, input)
}
