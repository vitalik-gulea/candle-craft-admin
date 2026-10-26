import { create } from 'zustand'
import { createNavigationItemUseCase } from '../../application/navigation/create-navigation-item.use-case'
import { deleteNavigationItemUseCase } from '../../application/navigation/delete-navigation-item.use-case'
import { listNavigationItemsUseCase } from '../../application/navigation/list-navigation-items.use-case'
import { reorderNavigationItemsUseCase } from '../../application/navigation/reorder-navigation-items.use-case'
import { updateNavigationItemUseCase } from '../../application/navigation/update-navigation-item.use-case'
import { NavigationItemError } from '../../domain/navigation/errors'
import type { NavigationItem, NavigationItemInput } from '../../domain/navigation/types'
import { navigationApi } from '../../infrastructure/navigation/navigation.api'

interface NavigationState {
  items: NavigationItem[]
  isLoading: boolean
  isMutating: boolean
  errorCode: NavigationItemError['code'] | null
  errorDetails: string | string[] | null
  load: () => Promise<void>
  create: (input: NavigationItemInput) => Promise<NavigationItem | null>
  update: (id: string, input: NavigationItemInput) => Promise<NavigationItem | null>
  remove: (id: string) => Promise<boolean>
  reorder: (orderedIds: string[]) => Promise<void>
  clearError: () => void
}

function sortItems(items: NavigationItem[]): NavigationItem[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

function toErrorState(error: unknown) {
  return {
    errorCode: error instanceof NavigationItemError ? error.code : ('UNKNOWN' as const),
    errorDetails: error instanceof NavigationItemError ? error.details : null,
  }
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  items: [],
  isLoading: false,
  isMutating: false,
  errorCode: null,
  errorDetails: null,

  async load() {
    set({ isLoading: true, errorCode: null, errorDetails: null })
    try {
      const items = await listNavigationItemsUseCase(navigationApi)
      set({ items: sortItems(items), isLoading: false })
    } catch (error) {
      set({ isLoading: false, ...toErrorState(error) })
    }
  },

  async create(input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const item = await createNavigationItemUseCase(navigationApi, input)
      set((state) => ({ items: sortItems([...state.items, item]), isMutating: false }))
      return item
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return null
    }
  },

  async update(id, input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const item = await updateNavigationItemUseCase(navigationApi, id, input)
      set((state) => ({
        items: sortItems(state.items.map((current) => (current.id === id ? item : current))),
        isMutating: false,
      }))
      return item
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return null
    }
  },

  async remove(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await deleteNavigationItemUseCase(navigationApi, id)
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isMutating: false,
      }))
      return true
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return false
    }
  },

  async reorder(orderedIds) {
    const previous = get().items
    const byId = new Map(previous.map((item) => [item.id, item]))
    const optimistic = orderedIds
      .map((id, index) => {
        const item = byId.get(id)
        return item ? { ...item, sortOrder: index } : null
      })
      .filter((item): item is NavigationItem => item !== null)

    set({ items: optimistic, isMutating: true, errorCode: null, errorDetails: null })
    try {
      const items = await reorderNavigationItemsUseCase(navigationApi, orderedIds)
      set({ items: sortItems(items), isMutating: false })
    } catch (error) {
      set({ items: previous, isMutating: false, ...toErrorState(error) })
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
