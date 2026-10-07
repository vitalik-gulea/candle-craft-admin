import { create } from 'zustand'
import { createProductVariantUseCase } from '../../application/product-variants/create-product-variant.use-case'
import { deleteProductVariantUseCase } from '../../application/product-variants/delete-product-variant.use-case'
import { listProductVariantsUseCase } from '../../application/product-variants/list-product-variants.use-case'
import { updateProductVariantUseCase } from '../../application/product-variants/update-product-variant.use-case'
import { ProductVariantError } from '../../domain/product-variants/errors'
import type {
  CreateProductVariantInput,
  ProductVariant,
  UpdateProductVariantInput,
} from '../../domain/product-variants/types'
import { productVariantsApi } from '../../infrastructure/product-variants/product-variants.api'

interface ProductVariantsState {
  productId: string | null
  items: ProductVariant[]
  isLoading: boolean
  isMutating: boolean
  errorCode: ProductVariantError['code'] | null
  errorDetails: string | string[] | null
  load: (productId: string) => Promise<void>
  reset: () => void
  create: (input: CreateProductVariantInput) => Promise<ProductVariant | null>
  update: (variantId: string, input: UpdateProductVariantInput) => Promise<ProductVariant | null>
  remove: (variantId: string) => Promise<boolean>
  clearError: () => void
}

function toError(error: unknown) {
  if (error instanceof ProductVariantError) {
    return { errorCode: error.code, errorDetails: error.details }
  }
  return { errorCode: 'UNKNOWN' as const, errorDetails: null }
}

export const useProductVariantsStore = create<ProductVariantsState>((set, get) => ({
  productId: null,
  items: [],
  isLoading: false,
  isMutating: false,
  errorCode: null,
  errorDetails: null,

  async load(productId) {
    set({
      productId,
      items: [],
      isLoading: true,
      isMutating: false,
      errorCode: null,
      errorDetails: null,
    })
    try {
      const items = await listProductVariantsUseCase(productVariantsApi, productId)
      if (get().productId !== productId) return
      set({ items, isLoading: false })
    } catch (error) {
      if (get().productId !== productId) return
      set({ isLoading: false, ...toError(error) })
    }
  },

  reset() {
    set({
      productId: null,
      items: [],
      isLoading: false,
      isMutating: false,
      errorCode: null,
      errorDetails: null,
    })
  },

  async create(input) {
    const productId = get().productId
    if (!productId) return null
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const variant = await createProductVariantUseCase(productVariantsApi, productId, input)
      set((state) => ({ items: [...state.items, variant], isMutating: false }))
      return variant
    } catch (error) {
      set({ isMutating: false, ...toError(error) })
      return null
    }
  },

  async update(variantId, input) {
    const productId = get().productId
    if (!productId) return null
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const variant = await updateProductVariantUseCase(
        productVariantsApi,
        productId,
        variantId,
        input,
      )
      set((state) => ({
        items: state.items.map((item) => (item.id === variantId ? variant : item)),
        isMutating: false,
      }))
      return variant
    } catch (error) {
      set({ isMutating: false, ...toError(error) })
      return null
    }
  },

  async remove(variantId) {
    const productId = get().productId
    if (!productId) return false
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await deleteProductVariantUseCase(productVariantsApi, productId, variantId)
      set((state) => ({
        items: state.items.filter((item) => item.id !== variantId),
        isMutating: false,
      }))
      return true
    } catch (error) {
      set({ isMutating: false, ...toError(error) })
      return false
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
