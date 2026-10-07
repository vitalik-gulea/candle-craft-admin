export interface CharacteristicType {
  id: string
  key: string
  labelRo: string
  labelRu: string
  unit: string | null
  usedForVariations: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CharacteristicTypeListFilters {
  includeInactive?: boolean
}

export interface CreateCharacteristicTypeInput {
  key: string
  labelRo: string
  labelRu: string
  unit?: string | null
  usedForVariations?: boolean
  sortOrder?: number
  isActive?: boolean
}

export type UpdateCharacteristicTypeInput = Partial<Omit<CreateCharacteristicTypeInput, 'key'>>

export interface CharacteristicTypeValue {
  id: string
  characteristicTypeId: string
  valueRo: string
  valueRu: string
  sortOrder: number
  isActive: boolean
}

export interface CreateCharacteristicTypeValueInput {
  valueRo: string
  valueRu: string
  sortOrder?: number
  isActive?: boolean
}
