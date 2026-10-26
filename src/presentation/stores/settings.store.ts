import { create } from 'zustand'
import { getSiteSettingsUseCase } from '../../application/settings/get-site-settings.use-case'
import { updateSiteSettingsUseCase } from '../../application/settings/update-site-settings.use-case'
import { SiteSettingsError } from '../../domain/settings/errors'
import type { SiteSettings, UpdateSiteSettingsInput } from '../../domain/settings/types'
import { siteSettingsApi } from '../../infrastructure/settings/site-settings.api'

interface SettingsState {
  settings: SiteSettings | null
  isLoading: boolean
  isSaving: boolean
  errorCode: SiteSettingsError['code'] | null
  errorDetails: string | string[] | null
  load: () => Promise<void>
  save: (input: UpdateSiteSettingsInput) => Promise<SiteSettings | null>
  clearError: () => void
}

function toErrorState(error: unknown) {
  return {
    errorCode: error instanceof SiteSettingsError ? error.code : ('UNKNOWN' as const),
    errorDetails: error instanceof SiteSettingsError ? error.details : null,
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  isSaving: false,
  errorCode: null,
  errorDetails: null,

  async load() {
    set({ isLoading: true, errorCode: null, errorDetails: null })
    try {
      const settings = await getSiteSettingsUseCase(siteSettingsApi)
      set({ settings, isLoading: false })
    } catch (error) {
      set({ isLoading: false, ...toErrorState(error) })
    }
  },

  async save(input) {
    set({ isSaving: true, errorCode: null, errorDetails: null })
    try {
      const settings = await updateSiteSettingsUseCase(siteSettingsApi, input)
      set({ settings, isSaving: false })
      return settings
    } catch (error) {
      set({ isSaving: false, ...toErrorState(error) })
      return null
    }
  },

  clearError() {
    set({ errorCode: null, errorDetails: null })
  },
}))
