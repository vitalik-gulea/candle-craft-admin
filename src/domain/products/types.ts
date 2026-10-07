import type { LocalizedOptionalString, LocalizedString } from '../shared/localized'

export type ProductStatus = 'draft' | 'published' | 'hidden'

export interface ProductImage {
  id: string
  url: string
  key: string
  alt: LocalizedOptionalString
  sortOrder: number
}

export interface ProductImageInput {
  url: string
  key: string
  altRo?: string | null
  altRu?: string | null
  sortOrder: number
}

export interface ProductCharacteristic {
  id: string
  characteristicTypeId: string
  valueRo: string
  valueRu: string
  sortOrder: number
}

export interface ProductCharacteristicInput {
  characteristicTypeId: string
  valueRo: string
  valueRu: string
}

export interface ProductUrlRedirect {
  id: string
  locale: 'ro' | 'ru'
  oldSlug: string
  redirectProductId: string | null
  isGone: boolean
  createdAt: string
}

export interface Product {
  id: string
  sku: string | null
  name: LocalizedString
  slug: LocalizedString
  manufacturer: string | null
  shortDescription: LocalizedOptionalString
  fullDescription: LocalizedOptionalString
  usageInstructions: LocalizedOptionalString
  mainCategoryId: string | null
  additionalCategoryIds: string[]
  unitOfSaleId: string | null
  regularPrice: string | null
  discountPrice: string | null
  discountStartAt: string | null
  discountEndAt: string | null
  isDiscountActive: boolean
  discountPercent: number | null
  effectivePrice: string | null
  stockQuantity: number
  isInStock: boolean
  status: ProductStatus
  mainImageUrl: string | null
  mainImageKey: string | null
  mainImageAlt: LocalizedOptionalString
  seoTitle: LocalizedOptionalString
  metaDescription: LocalizedOptionalString
  isNewBadgeEnabled: boolean
  newBadgeUntil: string | null
  isNewBadgeActive: boolean
  isPopular: boolean
  popularOrder: number
  firstPublishedAt: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  characteristics: ProductCharacteristic[]
}

export interface CreateProductInput {
  name: LocalizedString
  sku?: string | null
  slug?: LocalizedString
  manufacturer?: string | null
  shortDescription?: LocalizedOptionalString
  fullDescription?: LocalizedOptionalString
  usageInstructions?: Partial<LocalizedOptionalString>
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
  mainImageAlt?: LocalizedOptionalString
  seoTitle?: LocalizedOptionalString
  metaDescription?: LocalizedOptionalString
  isNewBadgeEnabled?: boolean
  isPopular?: boolean
  popularOrder?: number
  characteristics?: ProductCharacteristicInput[]
}

export type UpdateProductInput = Partial<CreateProductInput>

export interface ProductListFilters {
  status?: ProductStatus
  categoryId?: string
  inStock?: boolean
  onDiscount?: boolean
  hasNewBadge?: boolean
  search?: string
  includeTrashed?: boolean
  onlyTrashed?: boolean
}

export interface PermanentlyDeleteProductInput {
  reason?: string
  redirectTargetProductId?: string
}
