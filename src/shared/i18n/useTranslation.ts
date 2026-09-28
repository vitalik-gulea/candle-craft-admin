import { ro } from './dictionaries/ro'
import { ru } from './dictionaries/ru'
import { useLocaleStore } from './locale.store'

const dictionaries = { ru, ro }

function resolve(dictionary: object, key: string): string {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, dictionary)

  return typeof value === 'string' ? value : key
}

function interpolate(template: string, params?: Record<string, string>): string {
  if (!params) return template
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  )
}

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale)
  const t = (key: string, params?: Record<string, string>) =>
    interpolate(resolve(dictionaries[locale], key), params)

  return { t, locale }
}
