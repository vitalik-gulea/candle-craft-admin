import { create } from 'zustand'
import { permanentlyDeleteCategoryUseCase } from '../../application/categories/permanently-delete-category.use-case'
import { restoreCategoryUseCase } from '../../application/categories/restore-category.use-case'
import { permanentlyDeleteProductUseCase } from '../../application/products/permanently-delete-product.use-case'
import { restoreProductUseCase } from '../../application/products/restore-product.use-case'
import { listTrashUseCase } from '../../application/trash/list-trash.use-case'
import { CategoryError } from '../../domain/categories/errors'
import { ProductError } from '../../domain/products/errors'
import { TrashError } from '../../domain/trash/errors'
import type { TrashItem, TrashItemType } from '../../domain/trash/types'
import { categoriesApi } from '../../infrastructure/categories/categories.api'
import { productsApi } from '../../infrastructure/products/products.api'
import { trashApi } from '../../infrastructure/trash/trash.api'

export type TrashActionResult = 'ok' | 'notFound' | 'error'

interface TrashState {
  items: TrashItem[]
  type: TrashItemType | null
  isLoading: boolean
  isMutating: boolean
  errorCode: TrashError['code'] | null
  errorDetails: string | string[] | null
  actionDetails: string | null
  load: () => Promise<void>
  setType: (type: TrashItemType | null) => Promise<void>
  restore: (item: TrashItem) => Promise<TrashActionResult>
  permanentlyDelete: (item: TrashItem, redirectTargetId?: string) => Promise<TrashActionResult>
  clearError: () => void
}

function toActionDetails(error: unknown): string | null {
  if (!(error instanceof ProductError || error instanceof CategoryError)) return null
  const { details } = error
  return Array.isArray(details) ? details.join(', ') : details
}

function toActionResult(error: unknown): TrashActionResult {
  const code =
    error instanceof ProductError || error instanceof CategoryError ? error.code : 'UNKNOWN'
  return code === 'NOT_FOUND' ? 'notFound' : 'error'
}

export const useTrashStore = create<TrashState>((set, get) => ({
  items: [],
  type: null,
  isLoading: false,
  isMutating: false,
  errorCode: null,
  errorDetails: null,
  actionDetails: null,

  async load() {
    const { type } = get()
    set({ isLoading: true, errorCode: null, errorDetails: null })
    try {
      const items = await listTrashUseCase(trashApi, { type: type ?? undefined })
      set({ items, isLoading: false })
    } catch (error) {
      const code = error instanceof TrashError ? error.code : 'UNKNOWN'
      const details = error instanceof TrashError ? error.details : null
      set({ isLoading: false, errorCode: code, errorDetails: details })
    }
  },

  async setType(type) {
    set({ type })
    await get().load()
  },

  async restore(item) {
    set({ isMutating: true, actionDetails: null })
    try {
      if (item.type === 'product') await restoreProductUseCase(productsApi, item.id)
      else await restoreCategoryUseCase(categoriesApi, item.id)
      set({ isMutating: false })
      await get().load()
      return 'ok'
    } catch (error) {
      set({ isMutating: false, actionDetails: toActionDetails(error) })
      await get().load()
      return toActionResult(error)
    }
  },

  async permanentlyDelete(item, redirectTargetId) {
    set({ isMutating: true, actionDetails: null })
    try {
      if (item.type === 'product') {
        await permanentlyDeleteProductUseCase(
          productsApi,
          item.id,
          redirectTargetId ? { redirectTargetProductId: redirectTargetId } : undefined,
        )
      } else {
        await permanentlyDeleteCategoryUseCase(
          categoriesApi,
          item.id,
          redirectTargetId ? { redirectTargetCategoryId: redirectTargetId } : undefined,
        )
      }
      set({ isMutating: false })
      await get().load()
      return 'ok'
    } catch (error) {
      set({ isMutating: false })
      await get().load()
      return toActionResult(error)
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
