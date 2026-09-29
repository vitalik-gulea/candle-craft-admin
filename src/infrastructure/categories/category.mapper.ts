import type {
  Category,
  CategoryListFilters,
  CategoryStatus,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../domain/categories/types'
import type { LocalizedOptionalString } from '../../domain/shared/localized'

type NullableString = string | null

interface CategoryResponseDto {
  id: string
  parentId: NullableString
  nameRo: string
  nameRu: string
  slugRo: string
  slugRu: string
  imageUrl: NullableString
  imageKey: NullableString
  altRo: NullableString
  altRu: NullableString
  descriptionRo: NullableString
  descriptionRu: NullableString
  seoTitleRo: NullableString
  seoTitleRu: NullableString
  metaDescriptionRo: NullableString
  metaDescriptionRu: NullableString
  status: CategoryStatus
  showInCatalog: boolean
  showInNavigation: boolean
  showOnHomepage: boolean
  homepageOrder: number
  showSubcategoryProducts: boolean
  deletedAt: NullableString
  createdAt: string
  updatedAt: string
}

interface CreateCategoryDto {
  nameRo: string
  nameRu: string
  parentId?: string | null
  slugRo?: string
  slugRu?: string
  imageUrl?: string | null
  imageKey?: string | null
  altRo?: string | null
  altRu?: string | null
  descriptionRo?: string | null
  descriptionRu?: string | null
  seoTitleRo?: string | null
  seoTitleRu?: string | null
  metaDescriptionRo?: string | null
  metaDescriptionRu?: string | null
  status?: CategoryStatus
  showInCatalog?: boolean
  showInNavigation?: boolean
  showOnHomepage?: boolean
  homepageOrder?: number
  showSubcategoryProducts?: boolean
}

type UpdateCategoryDto = Partial<CreateCategoryDto>

function localizedOptional(ro: NullableString, ru: NullableString): LocalizedOptionalString {
  return { ro, ru }
}

export function mapCategory(dto: CategoryResponseDto): Category {
  return {
    id: dto.id,
    parentId: dto.parentId,
    name: { ro: dto.nameRo, ru: dto.nameRu },
    slug: { ro: dto.slugRo, ru: dto.slugRu },
    imageUrl: dto.imageUrl,
    imageKey: dto.imageKey,
    alt: localizedOptional(dto.altRo, dto.altRu),
    description: localizedOptional(dto.descriptionRo, dto.descriptionRu),
    seoTitle: localizedOptional(dto.seoTitleRo, dto.seoTitleRu),
    metaDescription: localizedOptional(dto.metaDescriptionRo, dto.metaDescriptionRu),
    status: dto.status,
    showInCatalog: dto.showInCatalog,
    showInNavigation: dto.showInNavigation,
    showOnHomepage: dto.showOnHomepage,
    homepageOrder: dto.homepageOrder,
    showSubcategoryProducts: dto.showSubcategoryProducts,
    deletedAt: dto.deletedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export function toCreateCategoryDto(input: CreateCategoryInput): CreateCategoryDto {
  return {
    nameRo: input.name.ro,
    nameRu: input.name.ru,
    parentId: input.parentId ?? undefined,
    slugRo: input.slug?.ro,
    slugRu: input.slug?.ru,
    imageUrl: input.imageUrl ?? undefined,
    imageKey: input.imageKey ?? undefined,
    altRo: input.alt?.ro ?? undefined,
    altRu: input.alt?.ru ?? undefined,
    descriptionRo: input.description?.ro ?? undefined,
    descriptionRu: input.description?.ru ?? undefined,
    seoTitleRo: input.seoTitle?.ro ?? undefined,
    seoTitleRu: input.seoTitle?.ru ?? undefined,
    metaDescriptionRo: input.metaDescription?.ro ?? undefined,
    metaDescriptionRu: input.metaDescription?.ru ?? undefined,
    status: input.status,
    showInCatalog: input.showInCatalog,
    showInNavigation: input.showInNavigation,
    showOnHomepage: input.showOnHomepage,
    homepageOrder: input.homepageOrder,
    showSubcategoryProducts: input.showSubcategoryProducts,
  }
}

export function toUpdateCategoryDto(input: UpdateCategoryInput): UpdateCategoryDto {
  const dto: UpdateCategoryDto = {}

  if (input.name) {
    dto.nameRo = input.name.ro
    dto.nameRu = input.name.ru
  }
  if (input.parentId !== undefined) dto.parentId = input.parentId
  if (input.slug?.ro !== undefined) dto.slugRo = input.slug.ro
  if (input.slug?.ru !== undefined) dto.slugRu = input.slug.ru
  if (input.imageUrl !== undefined) dto.imageUrl = input.imageUrl
  if (input.imageKey !== undefined) dto.imageKey = input.imageKey
  if (input.alt?.ro !== undefined) dto.altRo = input.alt.ro
  if (input.alt?.ru !== undefined) dto.altRu = input.alt.ru
  if (input.description?.ro !== undefined) dto.descriptionRo = input.description.ro
  if (input.description?.ru !== undefined) dto.descriptionRu = input.description.ru
  if (input.seoTitle?.ro !== undefined) dto.seoTitleRo = input.seoTitle.ro
  if (input.seoTitle?.ru !== undefined) dto.seoTitleRu = input.seoTitle.ru
  if (input.metaDescription?.ro !== undefined) dto.metaDescriptionRo = input.metaDescription.ro
  if (input.metaDescription?.ru !== undefined) dto.metaDescriptionRu = input.metaDescription.ru
  if (input.status !== undefined) dto.status = input.status
  if (input.showInCatalog !== undefined) dto.showInCatalog = input.showInCatalog
  if (input.showInNavigation !== undefined) dto.showInNavigation = input.showInNavigation
  if (input.showOnHomepage !== undefined) dto.showOnHomepage = input.showOnHomepage
  if (input.homepageOrder !== undefined) dto.homepageOrder = input.homepageOrder
  if (input.showSubcategoryProducts !== undefined) {
    dto.showSubcategoryProducts = input.showSubcategoryProducts
  }

  return dto
}

export function toCategoryListParams(
  filters?: CategoryListFilters,
): Record<string, string | boolean> | undefined {
  if (!filters) return undefined

  const params: Record<string, string | boolean> = {}
  if (filters.status) params.status = filters.status
  if (filters.parentId) params.parentId = filters.parentId
  if (filters.includeTrashed !== undefined) params.includeTrashed = filters.includeTrashed
  if (filters.onlyTrashed !== undefined) params.onlyTrashed = filters.onlyTrashed

  return params
}

export type { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto }
