import type { UnitsOfSaleRepository } from '../../application/units-of-sale/ports'
import { UnitOfSaleError } from '../../domain/units-of-sale/errors'
import type {
  CreateUnitOfSaleInput,
  UnitOfSale,
  UnitOfSaleListFilters,
  UpdateUnitOfSaleInput,
} from '../../domain/units-of-sale/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

interface UnitOfSaleResponseDto {
  id: string
  nameRo: string
  nameRu: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function mapUnitOfSale(dto: UnitOfSaleResponseDto): UnitOfSale {
  return {
    id: dto.id,
    name: { ro: dto.nameRo, ru: dto.nameRu },
    sortOrder: dto.sortOrder,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

function toCreateDto(input: CreateUnitOfSaleInput) {
  return {
    nameRo: input.name.ro,
    nameRu: input.name.ru,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  }
}

function toUpdateDto(input: UpdateUnitOfSaleInput) {
  const dto: {
    nameRo?: string
    nameRu?: string
    sortOrder?: number
    isActive?: boolean
  } = {}

  if (input.name) {
    dto.nameRo = input.name.ro
    dto.nameRu = input.name.ru
  }
  if (input.sortOrder !== undefined) dto.sortOrder = input.sortOrder
  if (input.isActive !== undefined) dto.isActive = input.isActive

  return dto
}

function toUnitOfSaleError(error: unknown): UnitOfSaleError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new UnitOfSaleError('NOT_FOUND', undefined, details)
  if (status === 400) return new UnitOfSaleError('VALIDATION', undefined, details)
  if (status === 403) return new UnitOfSaleError('FORBIDDEN', undefined, details)
  return new UnitOfSaleError('UNKNOWN', undefined, details)
}

export const unitsOfSaleApi: UnitsOfSaleRepository = {
  async list(filters?: UnitOfSaleListFilters): Promise<UnitOfSale[]> {
    try {
      const { data } = await httpClient.get<UnitOfSaleResponseDto[]>(
        '/v1/units-of-sale/admin',
        {
          params: filters?.includeInactive !== undefined
            ? { includeInactive: filters.includeInactive }
            : undefined,
        },
      )
      return data.map(mapUnitOfSale)
    } catch (error) {
      throw toUnitOfSaleError(error)
    }
  },

  async create(input: CreateUnitOfSaleInput): Promise<UnitOfSale> {
    try {
      const { data } = await httpClient.post<UnitOfSaleResponseDto>(
        '/v1/units-of-sale/admin',
        toCreateDto(input),
      )
      return mapUnitOfSale(data)
    } catch (error) {
      throw toUnitOfSaleError(error)
    }
  },

  async update(id: string, input: UpdateUnitOfSaleInput): Promise<UnitOfSale> {
    try {
      const { data } = await httpClient.patch<UnitOfSaleResponseDto>(
        `/v1/units-of-sale/admin/${id}`,
        toUpdateDto(input),
      )
      return mapUnitOfSale(data)
    } catch (error) {
      throw toUnitOfSaleError(error)
    }
  },

  async disable(id: string): Promise<void> {
    try {
      await httpClient.delete(`/v1/units-of-sale/admin/${id}`)
    } catch (error) {
      throw toUnitOfSaleError(error)
    }
  },
}
