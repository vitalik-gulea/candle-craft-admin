import type { UiTextsRepository } from '../../application/ui-texts/ports'
import { UiTextError } from '../../domain/ui-texts/errors'
import type { UiText, UiTextUpdate } from '../../domain/ui-texts/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

interface UiTextResponseDto {
  key: string
  group: string
  valueRo: string
  valueRu: string
  defaultRo: string
  defaultRu: string
  isCustomized: boolean
  updatedAt: string | null
}

function mapUiText(dto: UiTextResponseDto): UiText {
  return {
    key: dto.key,
    group: dto.group,
    value: { ro: dto.valueRo, ru: dto.valueRu },
    defaultValue: { ro: dto.defaultRo, ru: dto.defaultRu },
    isCustomized: dto.isCustomized,
    updatedAt: dto.updatedAt,
  }
}

function toUiTextError(error: unknown): UiTextError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new UiTextError('NOT_FOUND', undefined, details)
  if (status === 400) return new UiTextError('VALIDATION', undefined, details)
  if (status === 403) return new UiTextError('FORBIDDEN', undefined, details)
  return new UiTextError('UNKNOWN', undefined, details)
}

export const uiTextsApi: UiTextsRepository = {
  async list(): Promise<UiText[]> {
    try {
      const { data } = await httpClient.get<UiTextResponseDto[]>('/v1/ui-texts/admin')
      return data.map(mapUiText)
    } catch (error) {
      throw toUiTextError(error)
    }
  },

  async save(items: UiTextUpdate[]): Promise<UiText[]> {
    try {
      const { data } = await httpClient.patch<UiTextResponseDto[]>('/v1/ui-texts/admin', {
        items: items.map((item) => ({
          key: item.key,
          valueRo: item.value.ro,
          valueRu: item.value.ru,
        })),
      })
      return data.map(mapUiText)
    } catch (error) {
      throw toUiTextError(error)
    }
  },

  async reset(key: string): Promise<void> {
    try {
      await httpClient.delete(`/v1/ui-texts/admin/${encodeURIComponent(key)}`)
    } catch (error) {
      throw toUiTextError(error)
    }
  },
}
