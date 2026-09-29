import type { LocalizedString } from '../shared/localized'

export interface UnitOfSale {
  id: string
  name: LocalizedString
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUnitOfSaleInput {
  name: LocalizedString
  sortOrder?: number
  isActive?: boolean
}

export type UpdateUnitOfSaleInput = Partial<CreateUnitOfSaleInput>

export interface UnitOfSaleListFilters {
  includeInactive?: boolean
}
