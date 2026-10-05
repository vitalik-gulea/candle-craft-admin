import { create } from 'zustand'
import { listUiTextsUseCase } from '../../application/ui-texts/list-ui-texts.use-case'
import { resetUiTextUseCase } from '../../application/ui-texts/reset-ui-text.use-case'
import { saveUiTextsUseCase } from '../../application/ui-texts/save-ui-texts.use-case'
import { UiTextError } from '../../domain/ui-texts/errors'
import type { UiText, UiTextUpdate } from '../../domain/ui-texts/types'
import { uiTextsApi } from '../../infrastructure/ui-texts/ui-texts.api'

export type UiTextsSaveResult =
  | { status: 'ok' }
  | { status: 'error'; code: UiTextError['code']; details: string | string[] | null }

interface UiTextsState {
  items: UiText[]
  isLoading: boolean
  isSaving: boolean
  hasLoadError: boolean
  load: () => Promise<void>
  save: (updates: UiTextUpdate[]) => Promise<UiTextsSaveResult>
  reset: (key: string) => Promise<UiTextsSaveResult>
}

export const useUiTextsStore = create<UiTextsState>((set) => ({
  items: [],
  isLoading: false,
  isSaving: false,
  hasLoadError: false,

  async load() {
    set({ isLoading: true, hasLoadError: false })
    try {
      const items = await listUiTextsUseCase(uiTextsApi)
      set({ items, isLoading: false })
    } catch {
      set({ isLoading: false, hasLoadError: true })
    }
  },

  async save(updates) {
    set({ isSaving: true })
    try {
      const saved = await saveUiTextsUseCase(uiTextsApi, updates)
      set((state) => {
        const byKey = new Map(saved.map((item) => [item.key, item]))
        return {
          items: state.items.map((item) => byKey.get(item.key) ?? item),
          isSaving: false,
        }
      })
      return { status: 'ok' }
    } catch (error) {
      set({ isSaving: false })
      if (error instanceof UiTextError) {
        return { status: 'error', code: error.code, details: error.details }
      }
      return { status: 'error', code: 'UNKNOWN', details: null }
    }
  },

  async reset(key) {
    set({ isSaving: true })
    try {
      await resetUiTextUseCase(uiTextsApi, key)
      set((state) => ({
        items: state.items.map((item) =>
          item.key === key
            ? { ...item, value: item.defaultValue, isCustomized: false, updatedAt: null }
            : item,
        ),
        isSaving: false,
      }))
      return { status: 'ok' }
    } catch (error) {
      set({ isSaving: false })
      if (error instanceof UiTextError) {
        return { status: 'error', code: error.code, details: error.details }
      }
      return { status: 'error', code: 'UNKNOWN', details: null }
    }
  },
}))
