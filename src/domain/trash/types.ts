import type { LocalizedString } from '../shared/localized'

export type TrashItemType = 'product' | 'category'

export type TrashStatusBeforeTrash = 'draft' | 'published' | 'hidden'

export interface TrashItem {
  type: TrashItemType
  id: string
  name: LocalizedString
  deletedAt: string
  purgeAt: string
  statusBeforeTrash: TrashStatusBeforeTrash
}

export interface TrashListFilters {
  type?: TrashItemType
}
