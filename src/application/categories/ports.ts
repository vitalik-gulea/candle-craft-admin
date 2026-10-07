import type {
  Category,
  CategoryFaqItemInput,
  CategoryListFilters,
  CategorySummary,
  CategoryTreeNode,
  CreateCategoryInput,
  PermanentlyDeleteCategoryInput,
  TrashCategoryInput,
  UpdateCategoryInput,
} from '../../domain/categories/types'

export interface CategoriesRepository {
  listSummaries(): Promise<CategorySummary[]>
  listTree(): Promise<CategoryTreeNode[]>
  list(filters?: CategoryListFilters): Promise<Category[]>
  getById(id: string): Promise<Category>
  create(input: CreateCategoryInput): Promise<Category>
  update(id: string, input: UpdateCategoryInput): Promise<Category>
  replaceFaq(id: string, items: CategoryFaqItemInput[]): Promise<void>
  trash(id: string, input?: TrashCategoryInput): Promise<void>
  restore(id: string): Promise<Category>
  permanentlyDelete(id: string, input?: PermanentlyDeleteCategoryInput): Promise<void>
}
