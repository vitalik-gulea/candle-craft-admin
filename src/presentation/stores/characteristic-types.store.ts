import { create } from 'zustand'
import { createCharacteristicTypeUseCase } from '../../application/characteristic-types/create-characteristic-type.use-case'
import { disableCharacteristicTypeUseCase } from '../../application/characteristic-types/disable-characteristic-type.use-case'
import { listCharacteristicTypesUseCase } from '../../application/characteristic-types/list-characteristic-types.use-case'
import { updateCharacteristicTypeUseCase } from '../../application/characteristic-types/update-characteristic-type.use-case'
import { CharacteristicTypeError } from '../../domain/characteristic-types/errors'
import type {
  CharacteristicType,
  CharacteristicTypeValue,
  CreateCharacteristicTypeValueInput,
  CreateCharacteristicTypeInput,
  UpdateCharacteristicTypeInput,
} from '../../domain/characteristic-types/types'
import { characteristicTypesApi } from '../../infrastructure/characteristic-types/characteristic-types.api'

interface CharacteristicTypesState {
  items: CharacteristicType[]
  values: Record<string, CharacteristicTypeValue[]>
  isLoading: boolean
  isMutating: boolean
  errorCode: CharacteristicTypeError['code'] | null
  load: () => Promise<void>
  create: (input: CreateCharacteristicTypeInput) => Promise<CharacteristicType | null>
  update: (id: string, input: UpdateCharacteristicTypeInput) => Promise<CharacteristicType | null>
  disable: (id: string) => Promise<boolean>
  enable: (id: string) => Promise<boolean>
  reorder: (orderedIds: string[]) => Promise<void>
  loadValues: (characteristicTypeId: string) => Promise<void>
  createValue: (
    characteristicTypeId: string,
    input: CreateCharacteristicTypeValueInput,
  ) => Promise<CharacteristicTypeValue | null>
  clearError: () => void
}

function sortItems(items: CharacteristicType[]): CharacteristicType[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

function toErrorCode(error: unknown): CharacteristicTypeError['code'] {
  return error instanceof CharacteristicTypeError ? error.code : 'UNKNOWN'
}

export const useCharacteristicTypesStore = create<CharacteristicTypesState>((set, get) => ({
  items: [],
  values: {},
  isLoading: false,
  isMutating: false,
  errorCode: null,

  async loadValues(characteristicTypeId) {
    try {
      const values = await characteristicTypesApi.listValues(characteristicTypeId)
      set((state) => ({ values: { ...state.values, [characteristicTypeId]: values } }))
    } catch (error) {
      set({ errorCode: toErrorCode(error) })
    }
  },

  async createValue(characteristicTypeId, input) {
    set({ isMutating: true, errorCode: null })
    try {
      const value = await characteristicTypesApi.createValue(characteristicTypeId, input)
      set((state) => ({
        values: {
          ...state.values,
          [characteristicTypeId]: [...(state.values[characteristicTypeId] ?? []), value],
        },
        isMutating: false,
      }))
      return value
    } catch (error) {
      set({ isMutating: false, errorCode: toErrorCode(error) })
      return null
    }
  },

  async load() {
    set({ isLoading: true, errorCode: null })
    try {
      const items = await listCharacteristicTypesUseCase(characteristicTypesApi, {
        includeInactive: true,
      })
      set({ items: sortItems(items), isLoading: false })
    } catch (error) {
      set({ isLoading: false, errorCode: toErrorCode(error) })
    }
  },

  async create(input) {
    set({ isMutating: true, errorCode: null })
    try {
      const type = await createCharacteristicTypeUseCase(characteristicTypesApi, input)
      set((state) => ({ items: sortItems([...state.items, type]), isMutating: false }))
      return type
    } catch (error) {
      set({ isMutating: false, errorCode: toErrorCode(error) })
      return null
    }
  },

  async update(id, input) {
    set({ isMutating: true, errorCode: null })
    try {
      const type = await updateCharacteristicTypeUseCase(characteristicTypesApi, id, input)
      set((state) => ({
        items: sortItems(state.items.map((item) => (item.id === id ? type : item))),
        isMutating: false,
      }))
      return type
    } catch (error) {
      set({ isMutating: false, errorCode: toErrorCode(error) })
      return null
    }
  },

  async disable(id) {
    set({ isMutating: true, errorCode: null })
    try {
      await disableCharacteristicTypeUseCase(characteristicTypesApi, id)
      set((state) => ({
        items: state.items.map((item) => (item.id === id ? { ...item, isActive: false } : item)),
        isMutating: false,
      }))
      return true
    } catch (error) {
      set({ isMutating: false, errorCode: toErrorCode(error) })
      return false
    }
  },

  async enable(id) {
    const type = await get().update(id, { isActive: true })
    return type !== null
  },

  async reorder(orderedIds) {
    const previous = get().items
    const byId = new Map(previous.map((item) => [item.id, item]))
    const next = orderedIds
      .map((id, index) => {
        const item = byId.get(id)
        return item ? { ...item, sortOrder: index } : null
      })
      .filter((item): item is CharacteristicType => item !== null)
    const changed = next.filter((item) => byId.get(item.id)?.sortOrder !== item.sortOrder)
    if (changed.length === 0) return

    set({ items: next, isMutating: true, errorCode: null })
    try {
      await Promise.all(
        changed.map((item) =>
          updateCharacteristicTypeUseCase(characteristicTypesApi, item.id, {
            sortOrder: item.sortOrder,
          }),
        ),
      )
      set({ isMutating: false })
    } catch (error) {
      set({ items: previous, isMutating: false, errorCode: toErrorCode(error) })
    }
  },

  clearError() {
    set({ errorCode: null })
  },
}))
