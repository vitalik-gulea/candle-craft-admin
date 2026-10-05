import type { LocalizedString } from '../shared/localized'

export interface UiText {
  key: string
  group: string
  value: LocalizedString
  defaultValue: LocalizedString
  isCustomized: boolean
  updatedAt: string | null
}

export interface UiTextUpdate {
  key: string
  value: LocalizedString
}
