import type { LocalizedString } from '../shared/localized'

export interface NavigationItem {
  id: string
  label: LocalizedString
  url: string
  sortOrder: number
}

export interface NavigationItemInput {
  label: LocalizedString
  url: string
}
