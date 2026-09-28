import { create } from 'zustand'

export type Locale = 'ru' | 'ro'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'ru',
  setLocale: (locale) => set({ locale }),
}))
