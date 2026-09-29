import { create } from 'zustand'
import { copyProductUseCase } from '../../application/products/copy-product.use-case'
import { createProductUseCase } from '../../application/products/create-product.use-case'
import { listProductsUseCase } from '../../application/products/list-products.use-case'
import { permanentlyDeleteProductUseCase } from '../../application/products/permanently-delete-product.use-case'
import { replaceProductImagesUseCase } from '../../application/products/replace-product-images.use-case'
import { restoreProductUseCase } from '../../application/products/restore-product.use-case'
import { trashProductUseCase } from '../../application/products/trash-product.use-case'
import { updateProductUseCase } from '../../application/products/update-product.use-case'
import { ProductError } from '../../domain/products/errors'
import type {
  CreateProductInput,
  Product,
  ProductImage,
  ProductImageInput,
  ProductListFilters,
  ProductStatus,
  UpdateProductInput,
} from '../../domain/products/types'
import { productsApi } from '../../infrastructure/products/products.api'

interface ProductsState {
  items: Product[]
  filters: ProductListFilters
  isLoading: boolean
  isMutating: boolean
  errorCode: ProductError['code'] | null
  errorDetails: string | string[] | null
  load: (filters?: ProductListFilters) => Promise<void>
  setFilters: (filters: ProductListFilters) => Promise<void>
  createDraft: (input: CreateProductInput) => Promise<Product | null>
  update: (id: string, input: UpdateProductInput) => Promise<Product | null>
  replaceImages: (id: string, images: ProductImageInput[]) => Promise<ProductImage[] | null>
  setStatus: (id: string, status: ProductStatus) => Promise<boolean>
  copy: (id: string) => Promise<Product | null>
  trash: (id: string) => Promise<boolean>
  restore: (id: string) => Promise<boolean>
  permanentlyDelete: (id: string) => Promise<boolean>
  clearError: () => void
}

function formatDetails(details: string | string[] | null): string | string[] | null {
  return details
}

export const useProductsStore = create<ProductsState>((set, get) => ({
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
      const items = await listProductsUseCase(productsApi, nextFilters)
      set({ items, isLoading: false })
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isLoading: false, errorCode: code, errorDetails: formatDetails(details) })
    }
  },

  async setFilters(filters) {
    await get().load(filters)
  },

  async createDraft(input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const product = await createProductUseCase(productsApi, {
        ...input,
        status: input.status ?? 'draft',
      })
      set((state) => ({
        items: [product, ...state.items],
        isMutating: false,
      }))
      return product
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: formatDetails(details) })
      return null
    }
  },

  async update(id, input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const product = await updateProductUseCase(productsApi, id, input)
      set((state) => ({
        items: state.items.some((item) => item.id === id)
          ? state.items.map((item) => (item.id === id ? product : item))
          : [product, ...state.items],
        isMutating: false,
      }))
      return product
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: formatDetails(details) })
      return null
    }
  },

  async replaceImages(id, images) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const result = await replaceProductImagesUseCase(productsApi, id, images)
      set({ isMutating: false })
      return result
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: formatDetails(details) })
      return null
    }
  },

  async setStatus(id, status) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const product = await updateProductUseCase(productsApi, id, { status })
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? product : item)),
        isMutating: false,
      }))
      return true
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: formatDetails(details) })
      return false
    }
  },

  async copy(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const product = await copyProductUseCase(productsApi, id)
      set((state) => ({
        items: [product, ...state.items],
        isMutating: false,
      }))
      return product
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: formatDetails(details) })
      return null
    }
  },

  async trash(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await trashProductUseCase(productsApi, id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isMutating: false,
      }))
      return true
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: formatDetails(details) })
      return false
    }
  },

  async restore(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const product = await restoreProductUseCase(productsApi, id)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? product : item)),
        isMutating: false,
      }))
      await get().load()
      return true
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: formatDetails(details) })
      return false
    }
  },

  async permanentlyDelete(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await permanentlyDeleteProductUseCase(productsApi, id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isMutating: false,
      }))
      return true
    } catch (error) {
      const code = error instanceof ProductError ? error.code : 'UNKNOWN'
      const details = error instanceof ProductError ? error.details : null
      set({ isMutating: false, errorCode: code, errorDetails: formatDetails(details) })
      return false
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
