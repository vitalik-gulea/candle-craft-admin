import { create } from 'zustand'
import { listCategoriesUseCase } from '../../application/categories/list-categories.use-case'
import { saveHomepageUseCase } from '../../application/homepage/save-homepage.use-case'
import { listProductsUseCase } from '../../application/products/list-products.use-case'
import { CategoryError } from '../../domain/categories/errors'
import type { Category } from '../../domain/categories/types'
import type { HomepageSelection } from '../../domain/homepage/types'
import { ProductError } from '../../domain/products/errors'
import type { Product } from '../../domain/products/types'
import { categoriesApi } from '../../infrastructure/categories/categories.api'
import { productsApi } from '../../infrastructure/products/products.api'

export type HomepageSaveResult =
  | { status: 'ok' }
  | { status: 'error'; code: string; details: string | string[] | null }

interface HomepageState {
  categories: Category[]
  products: Product[]
  isLoading: boolean
  isSaving: boolean
  hasLoadError: boolean
  load: () => Promise<void>
  save: (selection: HomepageSelection) => Promise<HomepageSaveResult>
}

export const useHomepageStore = create<HomepageState>((set, get) => ({
  categories: [],
  products: [],
  isLoading: false,
  isSaving: false,
  hasLoadError: false,

  async load() {
    set({ isLoading: true, hasLoadError: false })
    try {
      const [categories, products] = await Promise.all([
        listCategoriesUseCase(categoriesApi),
        listProductsUseCase(productsApi),
      ])
      set({ categories, products, isLoading: false })
    } catch {
      set({ isLoading: false, hasLoadError: true })
    }
  },

  async save(selection) {
    const { categories, products } = get()
    set({ isSaving: true })
    try {
      await saveHomepageUseCase(
        categoriesApi,
        productsApi,
        { categories, products },
        selection,
      )
      set({ isSaving: false })
      await get().load()
      return { status: 'ok' }
    } catch (error) {
      set({ isSaving: false })
      await get().load()
      if (error instanceof CategoryError || error instanceof ProductError) {
        return { status: 'error', code: error.code, details: error.details }
      }
      return { status: 'error', code: 'UNKNOWN', details: null }
    }
  },
}))
