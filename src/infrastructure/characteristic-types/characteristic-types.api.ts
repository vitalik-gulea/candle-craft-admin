import type { CharacteristicTypesRepository } from '../../application/characteristic-types/ports'
import { CharacteristicTypeError } from '../../domain/characteristic-types/errors'
import type {
  CharacteristicType,
  CharacteristicTypeValue,
  CreateCharacteristicTypeValueInput,
  CharacteristicTypeListFilters,
  CreateCharacteristicTypeInput,
  UpdateCharacteristicTypeInput,
} from '../../domain/characteristic-types/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

interface CharacteristicTypeResponseDto {
  id: string
  key: string
  labelRo: string
  labelRu: string
  unit: string | null
  usedForVariations?: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function mapCharacteristicType(dto: CharacteristicTypeResponseDto): CharacteristicType {
  return {
    id: dto.id,
    key: dto.key,
    labelRo: dto.labelRo,
    labelRu: dto.labelRu,
    unit: dto.unit,
    usedForVariations: dto.usedForVariations ?? false,
    sortOrder: dto.sortOrder,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

function toCreateDto(input: CreateCharacteristicTypeInput) {
  return {
    key: input.key,
    labelRo: input.labelRo,
    labelRu: input.labelRu,
    unit: input.unit,
    usedForVariations: input.usedForVariations,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  }
}

function toUpdateDto(input: UpdateCharacteristicTypeInput) {
  const dto: Record<string, unknown> = {}
  if (input.labelRo !== undefined) dto.labelRo = input.labelRo
  if (input.labelRu !== undefined) dto.labelRu = input.labelRu
  if (input.unit !== undefined) dto.unit = input.unit
  if (input.usedForVariations !== undefined) dto.usedForVariations = input.usedForVariations
  if (input.sortOrder !== undefined) dto.sortOrder = input.sortOrder
  if (input.isActive !== undefined) dto.isActive = input.isActive
  return dto
}

interface CharacteristicTypeValueResponseDto {
  id: string
  characteristicTypeId: string
  valueRo: string
  valueRu: string
  sortOrder: number
  isActive: boolean
}

function mapValue(dto: CharacteristicTypeValueResponseDto): CharacteristicTypeValue {
  return {
    id: dto.id,
    characteristicTypeId: dto.characteristicTypeId,
    valueRo: dto.valueRo,
    valueRu: dto.valueRu,
    sortOrder: dto.sortOrder,
    isActive: dto.isActive,
  }
}

function toCharacteristicTypeError(error: unknown): CharacteristicTypeError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new CharacteristicTypeError('NOT_FOUND', undefined, details)
  if (status === 409) return new CharacteristicTypeError('CONFLICT', undefined, details)
  if (status === 400) return new CharacteristicTypeError('VALIDATION', undefined, details)
  if (status === 403) return new CharacteristicTypeError('FORBIDDEN', undefined, details)
  return new CharacteristicTypeError('UNKNOWN', undefined, details)
}

export const characteristicTypesApi: CharacteristicTypesRepository = {
  async list(filters?: CharacteristicTypeListFilters): Promise<CharacteristicType[]> {
    try {
      const { data } = await httpClient.get<CharacteristicTypeResponseDto[]>(
        '/v1/characteristic-types/admin',
        {
          params: filters?.includeInactive !== undefined
            ? { includeInactive: filters.includeInactive }
            : undefined,
        },
      )
      return data.map(mapCharacteristicType)
    } catch (error) {
      throw toCharacteristicTypeError(error)
    }
  },

  async create(input: CreateCharacteristicTypeInput): Promise<CharacteristicType> {
    try {
      const { data } = await httpClient.post<CharacteristicTypeResponseDto>(
        '/v1/characteristic-types/admin',
        toCreateDto(input),
      )
      return mapCharacteristicType(data)
    } catch (error) {
      throw toCharacteristicTypeError(error)
    }
  },

  async update(id: string, input: UpdateCharacteristicTypeInput): Promise<CharacteristicType> {
    try {
      const { data } = await httpClient.patch<CharacteristicTypeResponseDto>(
        `/v1/characteristic-types/admin/${id}`,
        toUpdateDto(input),
      )
      return mapCharacteristicType(data)
    } catch (error) {
      throw toCharacteristicTypeError(error)
    }
  },

  async listValues(characteristicTypeId: string): Promise<CharacteristicTypeValue[]> {
    try {
      const { data } = await httpClient.get<CharacteristicTypeValueResponseDto[]>(
        `/v1/characteristic-types/admin/${characteristicTypeId}/values`,
      )
      return data.map(mapValue)
    } catch (error) {
      throw toCharacteristicTypeError(error)
    }
  },

  async createValue(
    characteristicTypeId: string,
    input: CreateCharacteristicTypeValueInput,
  ): Promise<CharacteristicTypeValue> {
    try {
      const { data } = await httpClient.post<CharacteristicTypeValueResponseDto>(
        `/v1/characteristic-types/admin/${characteristicTypeId}/values`,
        input,
      )
      return mapValue(data)
    } catch (error) {
      throw toCharacteristicTypeError(error)
    }
  },

  async disable(id: string): Promise<void> {
    try {
      await httpClient.delete(`/v1/characteristic-types/admin/${id}`)
    } catch (error) {
      throw toCharacteristicTypeError(error)
    }
  },
}
