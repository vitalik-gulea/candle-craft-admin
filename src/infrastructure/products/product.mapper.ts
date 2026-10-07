import type {
  CreateProductInput,
  Product,
  ProductCharacteristic,
  ProductCharacteristicInput,
  ProductImage,
  ProductImageInput,
  ProductListFilters,
  ProductStatus,
  ProductUrlRedirect,
  UpdateProductInput,
} from '../../domain/products/types'
import type { LocalizedOptionalString } from '../../domain/shared/localized'

type NullableString = string | null

interface ProductResponseDto {
  id: string
  sku: NullableString
  nameRo: string
  nameRu: string
  slugRo: string
  slugRu: string
  manufacturer: NullableString
  shortDescriptionRo: NullableString
  shortDescriptionRu: NullableString
  fullDescriptionRo: NullableString
  usageInstructionsRo: NullableString
  fullDescriptionRu: NullableString
  usageInstructionsRu: NullableString
  mainCategoryId: NullableString
  additionalCategoryIds: string[]
  unitOfSaleId: NullableString
  regularPrice: NullableString
  discountPrice: NullableString
  discountStartAt: NullableString
  discountEndAt: NullableString
  isDiscountActive: boolean
  discountPercent: number | null
  effectivePrice: NullableString
  stockQuantity: number
  isInStock: boolean
  status: ProductStatus
  mainImageUrl: NullableString
  mainImageKey: NullableString
  mainImageAltRo: NullableString
  mainImageAltRu: NullableString
  seoTitleRo: NullableString
  seoTitleRu: NullableString
  metaDescriptionRo: NullableString
  metaDescriptionRu: NullableString
  isNewBadgeEnabled: boolean
  newBadgeUntil: NullableString
  isNewBadgeActive: boolean
  isPopular: boolean
  popularOrder: number
  firstPublishedAt: NullableString
  deletedAt: NullableString
  createdAt: string
  updatedAt: string
  characteristics: ProductCharacteristicResponseDto[]
}

interface ProductCharacteristicResponseDto {
  id: string
  characteristicTypeId: string
  valueRo: string
  valueRu: string
  sortOrder: number
}

interface ProductCharacteristicInputDto {
  characteristicTypeId: string
  valueRo: string
  valueRu: string
}

interface ProductImageResponseDto {
  id: string
  url: string
  key: string
  altRo: NullableString
  altRu: NullableString
  sortOrder: number
}

interface ProductUrlRedirectResponseDto {
  id: string
  locale: 'ro' | 'ru'
  oldSlug: string
  redirectProductId: NullableString
  isGone: boolean
  createdAt: string
}

interface CreateProductDto {
  nameRo: string
  nameRu: string
  sku?: string | null
  slugRo?: string
  slugRu?: string
  manufacturer?: string | null
  shortDescriptionRo?: string | null
  shortDescriptionRu?: string | null
  fullDescriptionRo?: string | null
  usageInstructionsRo?: string | null
  fullDescriptionRu?: string | null
  usageInstructionsRu?: string | null
  mainCategoryId?: string | null
  additionalCategoryIds?: string[]
  unitOfSaleId?: string | null
  regularPrice?: string | null
  discountPrice?: string | null
  discountStartAt?: string | null
  discountEndAt?: string | null
  stockQuantity?: number
  status?: ProductStatus
  mainImageUrl?: string | null
  mainImageKey?: string | null
  mainImageAltRo?: string | null
  mainImageAltRu?: string | null
  seoTitleRo?: string | null
  seoTitleRu?: string | null
  metaDescriptionRo?: string | null
  metaDescriptionRu?: string | null
  isNewBadgeEnabled?: boolean
  isPopular?: boolean
  popularOrder?: number
  characteristics?: ProductCharacteristicInputDto[]
}

type UpdateProductDto = Partial<CreateProductDto>

function localizedOptional(
  ro: NullableString,
  ru: NullableString,
): LocalizedOptionalString {
  return { ro, ru }
}

export function mapProduct(dto: ProductResponseDto): Product {
  return {
    id: dto.id,
    sku: dto.sku,
    name: { ro: dto.nameRo, ru: dto.nameRu },
    slug: { ro: dto.slugRo, ru: dto.slugRu },
    manufacturer: dto.manufacturer,
    shortDescription: localizedOptional(dto.shortDescriptionRo, dto.shortDescriptionRu),
    fullDescription: localizedOptional(dto.fullDescriptionRo, dto.fullDescriptionRu),
    usageInstructions: localizedOptional(dto.usageInstructionsRo, dto.usageInstructionsRu),
    mainCategoryId: dto.mainCategoryId,
    additionalCategoryIds: dto.additionalCategoryIds,
    unitOfSaleId: dto.unitOfSaleId,
    regularPrice: dto.regularPrice,
    discountPrice: dto.discountPrice,
    discountStartAt: dto.discountStartAt,
    discountEndAt: dto.discountEndAt,
    isDiscountActive: dto.isDiscountActive,
    discountPercent: dto.discountPercent,
    effectivePrice: dto.effectivePrice,
    stockQuantity: dto.stockQuantity,
    isInStock: dto.isInStock,
    status: dto.status,
    mainImageUrl: dto.mainImageUrl,
    mainImageKey: dto.mainImageKey,
    mainImageAlt: localizedOptional(dto.mainImageAltRo, dto.mainImageAltRu),
    seoTitle: localizedOptional(dto.seoTitleRo, dto.seoTitleRu),
    metaDescription: localizedOptional(dto.metaDescriptionRo, dto.metaDescriptionRu),
    isNewBadgeEnabled: dto.isNewBadgeEnabled,
    newBadgeUntil: dto.newBadgeUntil,
    isNewBadgeActive: dto.isNewBadgeActive,
    isPopular: dto.isPopular,
    popularOrder: dto.popularOrder,
    firstPublishedAt: dto.firstPublishedAt,
    deletedAt: dto.deletedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    characteristics: dto.characteristics.map(mapProductCharacteristic),
  }
}

export function mapProductCharacteristic(
  dto: ProductCharacteristicResponseDto,
): ProductCharacteristic {
  return {
    id: dto.id,
    characteristicTypeId: dto.characteristicTypeId,
    valueRo: dto.valueRo,
    valueRu: dto.valueRu,
    sortOrder: dto.sortOrder,
  }
}

export function mapProductImage(dto: ProductImageResponseDto): ProductImage {
  return {
    id: dto.id,
    url: dto.url,
    key: dto.key,
    alt: localizedOptional(dto.altRo, dto.altRu),
    sortOrder: dto.sortOrder,
  }
}

export function mapProductRedirect(dto: ProductUrlRedirectResponseDto): ProductUrlRedirect {
  return {
    id: dto.id,
    locale: dto.locale,
    oldSlug: dto.oldSlug,
    redirectProductId: dto.redirectProductId,
    isGone: dto.isGone,
    createdAt: dto.createdAt,
  }
}

export function toCreateProductDto(input: CreateProductInput): CreateProductDto {
  return {
    nameRo: input.name.ro,
    nameRu: input.name.ru,
    sku: input.sku,
    slugRo: input.slug?.ro,
    slugRu: input.slug?.ru,
    manufacturer: input.manufacturer,
    shortDescriptionRo: input.shortDescription?.ro,
    shortDescriptionRu: input.shortDescription?.ru,
    fullDescriptionRo: input.fullDescription?.ro,
    usageInstructionsRo: input.usageInstructions?.ro,
    fullDescriptionRu: input.fullDescription?.ru,
    usageInstructionsRu: input.usageInstructions?.ru,
    mainCategoryId: input.mainCategoryId,
    additionalCategoryIds: input.additionalCategoryIds,
    unitOfSaleId: input.unitOfSaleId,
    regularPrice: input.regularPrice,
    discountPrice: input.discountPrice,
    discountStartAt: input.discountStartAt,
    discountEndAt: input.discountEndAt,
    stockQuantity: input.stockQuantity,
    status: input.status,
    mainImageUrl: input.mainImageUrl,
    mainImageKey: input.mainImageKey,
    mainImageAltRo: input.mainImageAlt?.ro,
    mainImageAltRu: input.mainImageAlt?.ru,
    seoTitleRo: input.seoTitle?.ro,
    seoTitleRu: input.seoTitle?.ru,
    metaDescriptionRo: input.metaDescription?.ro,
    metaDescriptionRu: input.metaDescription?.ru,
    isNewBadgeEnabled: input.isNewBadgeEnabled,
    isPopular: input.isPopular,
    popularOrder: input.popularOrder,
    characteristics: input.characteristics?.map(toProductCharacteristicInputDto),
  }
}

export function toUpdateProductDto(input: UpdateProductInput): UpdateProductDto {
  const dto: UpdateProductDto = {}

  if (input.name) {
    dto.nameRo = input.name.ro
    dto.nameRu = input.name.ru
  }
  if (input.sku !== undefined) dto.sku = input.sku
  if (input.slug?.ro !== undefined) dto.slugRo = input.slug.ro
  if (input.slug?.ru !== undefined) dto.slugRu = input.slug.ru
  if (input.manufacturer !== undefined) dto.manufacturer = input.manufacturer
  if (input.shortDescription?.ro !== undefined) dto.shortDescriptionRo = input.shortDescription.ro
  if (input.shortDescription?.ru !== undefined) dto.shortDescriptionRu = input.shortDescription.ru
  if (input.fullDescription?.ro !== undefined) dto.fullDescriptionRo = input.fullDescription.ro
  if (input.fullDescription?.ru !== undefined) dto.fullDescriptionRu = input.fullDescription.ru
  if (input.usageInstructions?.ro !== undefined) dto.usageInstructionsRo = input.usageInstructions.ro
  if (input.usageInstructions?.ru !== undefined) dto.usageInstructionsRu = input.usageInstructions.ru
  if (input.mainCategoryId !== undefined) dto.mainCategoryId = input.mainCategoryId
  if (input.additionalCategoryIds !== undefined) {
    dto.additionalCategoryIds = input.additionalCategoryIds
  }
  if (input.unitOfSaleId !== undefined) dto.unitOfSaleId = input.unitOfSaleId
  if (input.regularPrice !== undefined) dto.regularPrice = input.regularPrice
  if (input.discountPrice !== undefined) dto.discountPrice = input.discountPrice
  if (input.discountStartAt !== undefined) dto.discountStartAt = input.discountStartAt
  if (input.discountEndAt !== undefined) dto.discountEndAt = input.discountEndAt
  if (input.stockQuantity !== undefined) dto.stockQuantity = input.stockQuantity
  if (input.status !== undefined) dto.status = input.status
  if (input.mainImageUrl !== undefined) dto.mainImageUrl = input.mainImageUrl
  if (input.mainImageKey !== undefined) dto.mainImageKey = input.mainImageKey
  if (input.mainImageAlt?.ro !== undefined) dto.mainImageAltRo = input.mainImageAlt.ro
  if (input.mainImageAlt?.ru !== undefined) dto.mainImageAltRu = input.mainImageAlt.ru
  if (input.seoTitle?.ro !== undefined) dto.seoTitleRo = input.seoTitle.ro
  if (input.seoTitle?.ru !== undefined) dto.seoTitleRu = input.seoTitle.ru
  if (input.metaDescription?.ro !== undefined) dto.metaDescriptionRo = input.metaDescription.ro
  if (input.metaDescription?.ru !== undefined) dto.metaDescriptionRu = input.metaDescription.ru
  if (input.isNewBadgeEnabled !== undefined) dto.isNewBadgeEnabled = input.isNewBadgeEnabled
  if (input.isPopular !== undefined) dto.isPopular = input.isPopular
  if (input.popularOrder !== undefined) dto.popularOrder = input.popularOrder
  if (input.characteristics !== undefined) {
    dto.characteristics = input.characteristics.map(toProductCharacteristicInputDto)
  }

  return dto
}

export function toProductListParams(
  filters?: ProductListFilters,
): Record<string, string | boolean> | undefined {
  if (!filters) return undefined

  const params: Record<string, string | boolean> = {}
  if (filters.status) params.status = filters.status
  if (filters.categoryId) params.categoryId = filters.categoryId
  if (filters.inStock !== undefined) params.inStock = filters.inStock
  if (filters.onDiscount !== undefined) params.onDiscount = filters.onDiscount
  if (filters.hasNewBadge !== undefined) params.hasNewBadge = filters.hasNewBadge
  if (filters.search) params.search = filters.search
  if (filters.includeTrashed !== undefined) params.includeTrashed = filters.includeTrashed
  if (filters.onlyTrashed !== undefined) params.onlyTrashed = filters.onlyTrashed

  return params
}

export function toProductCharacteristicInputDto(
  input: ProductCharacteristicInput,
): ProductCharacteristicInputDto {
  return {
    characteristicTypeId: input.characteristicTypeId,
    valueRo: input.valueRo,
    valueRu: input.valueRu,
  }
}

export function toProductImageInputDto(input: ProductImageInput) {
  return {
    url: input.url,
    key: input.key,
    altRo: input.altRo,
    altRu: input.altRu,
    sortOrder: input.sortOrder,
  }
}

export type {
  ProductResponseDto,
  ProductCharacteristicResponseDto,
  ProductCharacteristicInputDto,
  ProductImageResponseDto,
  ProductUrlRedirectResponseDto,
  CreateProductDto,
  UpdateProductDto,
}
