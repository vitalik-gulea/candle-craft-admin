import type { ProductVariant, ProductVariantOption } from '../../domain/product-variants/types'

export type ProductVariantOptionResponseDto = ProductVariantOption

export interface ProductVariantResponseDto {
  id: string
  sku: string | null
  regularPrice: string | null
  discountPrice: string | null
  discountStartAt: string | null
  discountEndAt: string | null
  stockQuantity: number
  isActive: boolean
  options: ProductVariantOptionResponseDto[]
}

function mapOption(dto: ProductVariantOptionResponseDto): ProductVariantOption {
  return { ...dto }
}

export function mapVariant(dto: ProductVariantResponseDto): ProductVariant {
  return {
    id: dto.id,
    sku: dto.sku,
    regularPrice: dto.regularPrice,
    discountPrice: dto.discountPrice,
    discountStartAt: dto.discountStartAt,
    discountEndAt: dto.discountEndAt,
    stockQuantity: dto.stockQuantity,
    isActive: dto.isActive,
    options: (dto.options ?? []).map(mapOption),
  }
}
