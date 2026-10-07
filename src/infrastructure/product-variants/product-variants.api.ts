import type { ProductVariantsRepository } from '../../application/product-variants/ports'
import { ProductVariantError } from '../../domain/product-variants/errors'
import type {
  CreateProductVariantInput,
  ProductVariant,
  ProductVariantOption,
  UpdateProductVariantInput,
} from '../../domain/product-variants/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

function variantsPath(productId: string): string {
  return `/v1/products/admin/${productId}/variants`
}

type ProductVariantOptionResponseDto = ProductVariantOption

interface ProductVariantResponseDto {
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

function mapVariant(dto: ProductVariantResponseDto): ProductVariant {
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

function toUpdateDto(input: UpdateProductVariantInput) {
  const dto: Record<string, unknown> = {}
  if (input.sku !== undefined) dto.sku = input.sku
  if (input.regularPrice !== undefined) dto.regularPrice = input.regularPrice
  if (input.discountPrice !== undefined) dto.discountPrice = input.discountPrice
  if (input.discountStartAt !== undefined) dto.discountStartAt = input.discountStartAt
  if (input.discountEndAt !== undefined) dto.discountEndAt = input.discountEndAt
  if (input.stockQuantity !== undefined) dto.stockQuantity = input.stockQuantity
  if (input.isActive !== undefined) dto.isActive = input.isActive
  return dto
}

function toProductVariantError(error: unknown): ProductVariantError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new ProductVariantError('NOT_FOUND', undefined, details)
  if (status === 409) return new ProductVariantError('CONFLICT', undefined, details)
  if (status === 400) return new ProductVariantError('VALIDATION', undefined, details)
  if (status === 403) return new ProductVariantError('FORBIDDEN', undefined, details)
  return new ProductVariantError('UNKNOWN', undefined, details)
}

export const productVariantsApi: ProductVariantsRepository = {
  async list(productId: string): Promise<ProductVariant[]> {
    try {
      const { data } = await httpClient.get<ProductVariantResponseDto[]>(variantsPath(productId))
      return data.map(mapVariant)
    } catch (error) {
      throw toProductVariantError(error)
    }
  },

  async create(productId: string, input: CreateProductVariantInput): Promise<ProductVariant> {
    try {
      const { data } = await httpClient.post<ProductVariantResponseDto>(
        variantsPath(productId),
        input,
      )
      return mapVariant(data)
    } catch (error) {
      throw toProductVariantError(error)
    }
  },

  async update(
    productId: string,
    variantId: string,
    input: UpdateProductVariantInput,
  ): Promise<ProductVariant> {
    try {
      const { data } = await httpClient.patch<ProductVariantResponseDto>(
        `${variantsPath(productId)}/${variantId}`,
        toUpdateDto(input),
      )
      return mapVariant(data)
    } catch (error) {
      throw toProductVariantError(error)
    }
  },

  async remove(productId: string, variantId: string): Promise<void> {
    try {
      await httpClient.delete(`${variantsPath(productId)}/${variantId}`)
    } catch (error) {
      throw toProductVariantError(error)
    }
  },
}
