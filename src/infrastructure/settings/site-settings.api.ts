import type {
  DeliveryCitiesRepository,
  SiteSettingsRepository,
} from '../../application/settings/ports'
import { SiteSettingsError } from '../../domain/settings/errors'
import type {
  PostDeliveryOverride,
  SiteSettings,
  UpdateSiteSettingsInput,
} from '../../domain/settings/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

interface SiteSettingsResponseDto {
  heroImageUrl: string | null
  heroImageKey: string | null
  freeDeliveryThreshold: string | number | null
  courierDeliveryCost?: string | number | null
  postDeliveryCost?: string | number | null
  postDeliveryOverrides?: Array<{ city: string; cost: string | number }> | null
  updatedAt: string
}

function toNullableString(value: string | number | null | undefined) {
  return value == null ? null : String(value)
}

function mapSettings(dto: SiteSettingsResponseDto): SiteSettings {
  return {
    heroImageUrl: dto.heroImageUrl ?? null,
    heroImageKey: dto.heroImageKey ?? null,
    freeDeliveryThreshold: toNullableString(dto.freeDeliveryThreshold),
    courierDeliveryCost: toNullableString(dto.courierDeliveryCost),
    postDeliveryCost: toNullableString(dto.postDeliveryCost),
    postDeliveryOverrides: (dto.postDeliveryOverrides ?? []).map(
      (entry): PostDeliveryOverride => ({ city: entry.city, cost: String(entry.cost) }),
    ),
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
  if (input.courierDeliveryCost !== undefined) dto.courierDeliveryCost = input.courierDeliveryCost
  if (input.postDeliveryCost !== undefined) {
    dto.postDeliveryCost = input.postDeliveryCost
  }
  if (input.postDeliveryOverrides !== undefined) {
    dto.postDeliveryOverrides = input.postDeliveryOverrides
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

export const deliveryCitiesApi: DeliveryCitiesRepository = {
  async list(): Promise<string[]> {
    const { data } = await httpClient.get<Array<{ city: string }>>('/v1/delivery-points/cities')
    return data.map((entry) => entry.city)
  },
}
