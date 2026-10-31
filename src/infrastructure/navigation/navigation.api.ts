import type { NavigationRepository } from '../../application/navigation/ports'
import { NavigationItemError } from '../../domain/navigation/errors'
import type { NavigationItem, NavigationItemInput } from '../../domain/navigation/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

const BASE_PATH = '/v1/navigation/admin'

interface NavigationItemResponseDto {
  id: string
  labelRo: string
  labelRu: string
  url: string
  sortOrder: number
}

function mapItem(dto: NavigationItemResponseDto): NavigationItem {
  return {
    id: dto.id,
    label: { ro: dto.labelRo, ru: dto.labelRu },
    url: dto.url,
    sortOrder: dto.sortOrder,
  }
}

function toDto(input: NavigationItemInput) {
  return { labelRo: input.label.ro, labelRu: input.label.ru, url: input.url }
}

function toNavigationItemError(error: unknown): NavigationItemError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new NavigationItemError('NOT_FOUND', undefined, details)
  if (status === 400) return new NavigationItemError('VALIDATION', undefined, details)
  if (status === 403) return new NavigationItemError('FORBIDDEN', undefined, details)
  return new NavigationItemError('UNKNOWN', undefined, details)
}

export const navigationApi: NavigationRepository = {
  async list(placement) {
    try {
      const { data } = await httpClient.get<NavigationItemResponseDto[]>(BASE_PATH, {
        params: { placement },
      })
      return data.map(mapItem)
    } catch (error) {
      throw toNavigationItemError(error)
    }
  },

  async create(placement, input) {
    try {
      const { data } = await httpClient.post<NavigationItemResponseDto>(BASE_PATH, {
        ...toDto(input),
        placement,
      })
      return mapItem(data)
    } catch (error) {
      throw toNavigationItemError(error)
    }
  },

  async update(id, input) {
    try {
      const { data } = await httpClient.patch<NavigationItemResponseDto>(
        `${BASE_PATH}/${id}`,
        toDto(input),
      )
      return mapItem(data)
    } catch (error) {
      throw toNavigationItemError(error)
    }
  },

  async remove(id) {
    try {
      await httpClient.delete(`${BASE_PATH}/${id}`)
    } catch (error) {
      throw toNavigationItemError(error)
    }
  },

  async reorder(placement, orderedIds) {
    try {
      const { data } = await httpClient.put<NavigationItemResponseDto[]>(`${BASE_PATH}/order`, {
        placement,
        orderedIds,
      })
      return data.map(mapItem)
    } catch (error) {
      throw toNavigationItemError(error)
    }
  },
}
