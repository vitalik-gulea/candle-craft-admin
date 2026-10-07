export interface ProductVariantOption {
  characteristicTypeId: string
  characteristicTypeKey: string
  characteristicTypeLabelRo: string
  characteristicTypeLabelRu: string
  valueId: string
  valueRo: string
  valueRu: string
}

export interface ProductVariantOptionInput {
  characteristicTypeId: string
  valueId: string
}

export interface ProductVariant {
  id: string
  sku: string | null
  regularPrice: string | null
  discountPrice: string | null
  discountStartAt: string | null
  discountEndAt: string | null
  stockQuantity: number
  isActive: boolean
  options: ProductVariantOption[]
}

export interface CreateProductVariantInput {
  sku: string | null
  regularPrice: string
  discountPrice: string | null
  discountStartAt: string | null
  discountEndAt: string | null
  stockQuantity: number
  isActive: boolean
  options: ProductVariantOptionInput[]
}

export type UpdateProductVariantInput = Partial<Omit<CreateProductVariantInput, 'options'>>

export function hasPublishableVariant(variants: ProductVariant[]): boolean {
  return variants.some((variant) => variant.isActive && Boolean(variant.regularPrice))
}
