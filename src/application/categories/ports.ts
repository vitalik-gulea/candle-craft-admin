import type {
  Category,
  CategoryFaqItemInput,
  CategoryListFilters,
  CategorySummary,
  CreateCategoryInput,
  PermanentlyDeleteCategoryInput,
  UpdateCategoryInput,
} from '../../domain/categories/types'

export interface CategoriesRepository {
  listSummaries(): Promise<CategorySummary[]>
  list(filters?: CategoryListFilters): Promise<Category[]>
  getById(id: string): Promise<Category>
  create(input: CreateCategoryInput): Promise<Category>
  update(id: string, input: UpdateCategoryInput): Promise<Category>
  replaceFaq(id: string, items: CategoryFaqItemInput[]): Promise<void>
  trash(id: string): Promise<void>
  restore(id: string): Promise<Category>
  permanentlyDelete(id: string, input?: PermanentlyDeleteCategoryInput): Promise<void>
}
