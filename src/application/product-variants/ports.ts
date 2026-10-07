import type {
  CreateProductVariantInput,
  ProductVariant,
  UpdateProductVariantInput,
} from '../../domain/product-variants/types'

export interface ProductVariantsRepository {
  list(productId: string): Promise<ProductVariant[]>
  create(productId: string, input: CreateProductVariantInput): Promise<ProductVariant>
  update(
    productId: string,
    variantId: string,
    input: UpdateProductVariantInput,
  ): Promise<ProductVariant>
  remove(productId: string, variantId: string): Promise<void>
}
