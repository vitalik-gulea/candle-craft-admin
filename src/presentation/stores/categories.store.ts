import { create } from 'zustand'
import { createCategoryUseCase } from '../../application/categories/create-category.use-case'
import { listCategoriesUseCase } from '../../application/categories/list-categories.use-case'
import { permanentlyDeleteCategoryUseCase } from '../../application/categories/permanently-delete-category.use-case'
import { restoreCategoryUseCase } from '../../application/categories/restore-category.use-case'
import { trashCategoryUseCase } from '../../application/categories/trash-category.use-case'
import { updateCategoryUseCase } from '../../application/categories/update-category.use-case'
import { CategoryError } from '../../domain/categories/errors'
import type {
  Category,
  CategoryListFilters,
  CategoryStatus,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../domain/categories/types'
import { categoriesApi } from '../../infrastructure/categories/categories.api'

interface CategoriesState {
  items: Category[]
  filters: CategoryListFilters
  isLoading: boolean
  isMutating: boolean
  errorCode: CategoryError['code'] | null
  errorDetails: string | string[] | null
  load: (filters?: CategoryListFilters) => Promise<void>
  setFilters: (filters: CategoryListFilters) => Promise<void>
  create: (input: CreateCategoryInput) => Promise<Category | null>
  update: (id: string, input: UpdateCategoryInput) => Promise<Category | null>
  setStatus: (id: string, status: CategoryStatus) => Promise<boolean>
  trash: (id: string) => Promise<boolean>
  restore: (id: string) => Promise<boolean>
  permanentlyDelete: (id: string) => Promise<boolean>
  clearError: () => void
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  items: [],
  filters: {},
  isLoading: false,
  isMutating: false,
  errorCode: null,
  errorDetails: null,

  async load(filters) {
    const nextFilters = filters ?? get().filters
    set({ isLoading: true, errorCode: null, errorDetails: null, filters: nextFilters })
    try {
      const items = await listCategoriesUseCase(categoriesApi, nextFilters)
      set({ items, isLoading: false })
    } catch (error) {
      const code = error instanceof CategoryError ? error.code : 'UNKNOWN'
      const details = error instanceof CategoryError ? error.details : null
      set({ isLoading: false, errorCode: code, errorDetails: details })
    }
  },

  async setFilters(filters) {
    await get().load(filters)
  },

  async create(input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const category = await createCategoryUseCase(categoriesApi, {
        ...input,
        status: input.status ?? 'draft',
      })
      set((state) => ({
        items: [category, ...state.items],
        isMutating: false,
      }))
      return category
    } catch (error) {
      const code = error instanceof CategoryError ? error.code : 'UNKNOWN'
      const details = error instanceof CategoryError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: details })
      return null
    }
  },

  async update(id, input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const category = await updateCategoryUseCase(categoriesApi, id, input)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? category : item)),
        isMutating: false,
      }))
      return category
    } catch (error) {
      const code = error instanceof CategoryError ? error.code : 'UNKNOWN'
      const details = error instanceof CategoryError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: details })
      return null
    }
  },

  async setStatus(id, status) {
    const category = await get().update(id, { status })
    return category !== null
  },

  async trash(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await trashCategoryUseCase(categoriesApi, id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isMutating: false,
      }))
      return true
    } catch (error) {
      const code = error instanceof CategoryError ? error.code : 'UNKNOWN'
      const details = error instanceof CategoryError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: details })
      return false
    }
  },

  async restore(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await restoreCategoryUseCase(categoriesApi, id)
      set({ isMutating: false })
      await get().load()
      return true
    } catch (error) {
      const code = error instanceof CategoryError ? error.code : 'UNKNOWN'
      const details = error instanceof CategoryError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: details })
      return false
    }
  },

  async permanentlyDelete(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await permanentlyDeleteCategoryUseCase(categoriesApi, id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isMutating: false,
      }))
      return true
    } catch (error) {
      const code = error instanceof CategoryError ? error.code : 'UNKNOWN'
      const details = error instanceof CategoryError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: details })
      return false
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
