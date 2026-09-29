import { create } from 'zustand'
import { createUnitOfSaleUseCase } from '../../application/units-of-sale/create-unit-of-sale.use-case'
import { disableUnitOfSaleUseCase } from '../../application/units-of-sale/disable-unit-of-sale.use-case'
import { listUnitsOfSaleUseCase } from '../../application/units-of-sale/list-units-of-sale.use-case'
import { updateUnitOfSaleUseCase } from '../../application/units-of-sale/update-unit-of-sale.use-case'
import { UnitOfSaleError } from '../../domain/units-of-sale/errors'
import type {
  CreateUnitOfSaleInput,
  UnitOfSale,
  UpdateUnitOfSaleInput,
} from '../../domain/units-of-sale/types'
import { unitsOfSaleApi } from '../../infrastructure/units-of-sale/units-of-sale.api'

interface UnitsOfSaleState {
  items: UnitOfSale[]
  isLoading: boolean
  isMutating: boolean
  errorCode: UnitOfSaleError['code'] | null
  errorDetails: string | string[] | null
  load: () => Promise<void>
  create: (input: CreateUnitOfSaleInput) => Promise<UnitOfSale | null>
  update: (id: string, input: UpdateUnitOfSaleInput) => Promise<UnitOfSale | null>
  disable: (id: string) => Promise<boolean>
  enable: (id: string) => Promise<boolean>
  reorder: (orderedIds: string[]) => Promise<void>
  clearError: () => void
}

function sortItems(items: UnitOfSale[]): UnitOfSale[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

function toErrorState(error: unknown) {
  return {
    errorCode: error instanceof UnitOfSaleError ? error.code : ('UNKNOWN' as const),
    errorDetails: error instanceof UnitOfSaleError ? error.details : null,
  }
}

export const useUnitsOfSaleStore = create<UnitsOfSaleState>((set, get) => ({
  items: [],
  isLoading: false,
  isMutating: false,
  errorCode: null,
  errorDetails: null,

  async load() {
    set({ isLoading: true, errorCode: null, errorDetails: null })
    try {
      const items = await listUnitsOfSaleUseCase(unitsOfSaleApi, { includeInactive: true })
      set({ items: sortItems(items), isLoading: false })
    } catch (error) {
      set({ isLoading: false, ...toErrorState(error) })
    }
  },

  async create(input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const unit = await createUnitOfSaleUseCase(unitsOfSaleApi, input)
      set((state) => ({ items: sortItems([...state.items, unit]), isMutating: false }))
      return unit
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return null
    }
  },

  async update(id, input) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      const unit = await updateUnitOfSaleUseCase(unitsOfSaleApi, id, input)
      set((state) => ({
        items: sortItems(state.items.map((item) => (item.id === id ? unit : item))),
        isMutating: false,
      }))
      return unit
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return null
    }
  },

  async disable(id) {
    set({ isMutating: true, errorCode: null, errorDetails: null })
    try {
      await disableUnitOfSaleUseCase(unitsOfSaleApi, id)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, isActive: false } : item)),
        isMutating: false,
      }))
      return true
    } catch (error) {
      set({ isMutating: false, ...toErrorState(error) })
      return false
    }
  },

  async enable(id) {
    const unit = await get().update(id, { isActive: true })
    return unit !== null
  },

  async reorder(orderedIds) {
    const previous = get().items
    const byId = new Map(previous.map((item) => [item.id, item]))
    const next = orderedIds
      .map((id, index) => {
        const item = byId.get(id)
        return item ? { ...item, sortOrder: index } : null
      })
      .filter((item): item is UnitOfSale => item !== null)
    const changed = next.filter((item) => byId.get(item.id)?.sortOrder !== item.sortOrder)
    if (changed.length === 0) return

    set({ items: next, isMutating: true, errorCode: null, errorDetails: null })
    try {
      await Promise.all(
        changed.map((item) =>
          updateUnitOfSaleUseCase(unitsOfSaleApi, item.id, { sortOrder: item.sortOrder }),
        ),
      )
      set({ isMutating: false })
    } catch (error) {
      set({ items: previous, isMutating: false, ...toErrorState(error) })
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
