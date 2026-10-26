import type { SiteSettingsRepository } from '../../application/settings/ports'
import { SiteSettingsError } from '../../domain/settings/errors'
import type { SiteSettings, UpdateSiteSettingsInput } from '../../domain/settings/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

interface SiteSettingsResponseDto {
  heroImageUrl: string | null
  heroImageKey: string | null
  freeDeliveryThreshold: string | number | null
  updatedAt: string
}

function mapSettings(dto: SiteSettingsResponseDto): SiteSettings {
  return {
    heroImageUrl: dto.heroImageUrl ?? null,
    heroImageKey: dto.heroImageKey ?? null,
    freeDeliveryThreshold:
      dto.freeDeliveryThreshold == null ? null : String(dto.freeDeliveryThreshold),
    updatedAt: dto.updatedAt,
  }
}

function toUpdateDto(input: UpdateSiteSettingsInput) {
  const dto: UpdateSiteSettingsInput = {}
  if (input.heroImageUrl !== undefined) dto.heroImageUrl = input.heroImageUrl
  if (input.heroImageKey !== undefined) dto.heroImageKey = input.heroImageKey
  if (input.freeDeliveryThreshold !== undefined) {
    dto.freeDeliveryThreshold = input.freeDeliveryThreshold
  }
  return dto
}

function toSiteSettingsError(error: unknown): SiteSettingsError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 400) return new SiteSettingsError('VALIDATION', undefined, details)
  if (status === 403) return new SiteSettingsError('FORBIDDEN', undefined, details)
  return new SiteSettingsError('UNKNOWN', undefined, details)
}

export const siteSettingsApi: SiteSettingsRepository = {
  async get(): Promise<SiteSettings> {
    try {
      const { data } = await httpClient.get<SiteSettingsResponseDto>('/v1/site-settings/admin')
      return mapSettings(data)
    } catch (error) {
      throw toSiteSettingsError(error)
    }
  },

  async update(input: UpdateSiteSettingsInput): Promise<SiteSettings> {
    try {
      const { data } = await httpClient.patch<SiteSettingsResponseDto>(
        '/v1/site-settings/admin',
        toUpdateDto(input),
      )
      return mapSettings(data)
    } catch (error) {
      throw toSiteSettingsError(error)
    }
  },
}
