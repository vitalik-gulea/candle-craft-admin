import type { LocalizedOptionalString, LocalizedString } from '../shared/localized'

export type CategoryStatus = 'draft' | 'published'

export const MAX_CATEGORY_DEPTH = 3

export interface CategorySummary {
  id: string
  name: LocalizedString
  parentId: string | null
  depth: number
}

export interface Category {
  id: string
  parentId: string | null
  name: LocalizedString
  slug: LocalizedString
  imageUrl: string | null
  imageKey: string | null
  alt: LocalizedOptionalString
  description: LocalizedOptionalString
  seoTitle: LocalizedOptionalString
  metaDescription: LocalizedOptionalString
  status: CategoryStatus
  showInCatalog: boolean
  showInNavigation: boolean
  showOnHomepage: boolean
  homepageOrder: number
  showSubcategoryProducts: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

export interface CreateCategoryInput {
  name: LocalizedString
  parentId?: string | null
  slug?: Partial<LocalizedString>
  imageUrl?: string | null
  imageKey?: string | null
  alt?: LocalizedOptionalString
  description?: LocalizedOptionalString
  seoTitle?: LocalizedOptionalString
  metaDescription?: LocalizedOptionalString
  status?: CategoryStatus
  showInCatalog?: boolean
  showInNavigation?: boolean
  showOnHomepage?: boolean
  homepageOrder?: number
  showSubcategoryProducts?: boolean
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

export interface CategoryListFilters {
  status?: CategoryStatus
  parentId?: string
  includeTrashed?: boolean
  onlyTrashed?: boolean
}

export interface CategoryFaqItemInput {
  question: LocalizedString
  answer: LocalizedString
}

export interface TrashCategoryInput {
  force?: boolean
}

export interface PermanentlyDeleteCategoryInput {
  redirectTargetCategoryId?: string
}
