import type { NotificationsRepository } from '../../application/notifications/ports'
import { NotificationError } from '../../domain/notifications/errors'
import type {
  CreateNotificationInput,
  Notification,
  NotificationListFilters,
  UpdateNotificationInput,
} from '../../domain/notifications/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

interface NotificationResponseDto {
  id: string
  messageRo: string
  messageRu: string
  isActive: boolean
  expiresAt: string | null
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

function mapNotification(dto: NotificationResponseDto): Notification {
  return {
    id: dto.id,
    message: { ro: dto.messageRo, ru: dto.messageRu },
    isActive: dto.isActive,
    expiresAt: dto.expiresAt,
    isVisible: dto.isVisible,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

function toCreateDto(input: CreateNotificationInput) {
  return {
    messageRo: input.message.ro,
    messageRu: input.message.ru,
    isActive: input.isActive,
    durationHours: input.durationHours,
  }
}

function toUpdateDto(input: UpdateNotificationInput) {
  const dto: {
    messageRo?: string
    messageRu?: string
    isActive?: boolean
    durationHours?: number | null
  } = {}

  if (input.message) {
    dto.messageRo = input.message.ro
    dto.messageRu = input.message.ru
  }
  if (input.isActive !== undefined) dto.isActive = input.isActive
  if (input.durationHours !== undefined) dto.durationHours = input.durationHours

  return dto
}

function toNotificationError(error: unknown): NotificationError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new NotificationError('NOT_FOUND', undefined, details)
  if (status === 400) return new NotificationError('VALIDATION', undefined, details)
  if (status === 403) return new NotificationError('FORBIDDEN', undefined, details)
  return new NotificationError('UNKNOWN', undefined, details)
}

export const notificationsApi: NotificationsRepository = {
  async list(filters?: NotificationListFilters): Promise<Notification[]> {
    try {
      const { data } = await httpClient.get<NotificationResponseDto[]>(
        '/v1/notifications/admin',
        {
          params: filters?.isActive !== undefined ? { isActive: filters.isActive } : undefined,
        },
      )
      return data.map(mapNotification)
    } catch (error) {
      throw toNotificationError(error)
    }
  },

  async create(input: CreateNotificationInput): Promise<Notification> {
    try {
      const { data } = await httpClient.post<NotificationResponseDto>(
        '/v1/notifications/admin',
        toCreateDto(input),
      )
      return mapNotification(data)
    } catch (error) {
      throw toNotificationError(error)
    }
  },

  async update(id: string, input: UpdateNotificationInput): Promise<Notification> {
    try {
      const { data } = await httpClient.patch<NotificationResponseDto>(
        `/v1/notifications/admin/${id}`,
        toUpdateDto(input),
      )
      return mapNotification(data)
    } catch (error) {
      throw toNotificationError(error)
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await httpClient.delete(`/v1/notifications/admin/${id}`)
    } catch (error) {
      throw toNotificationError(error)
    }
  },
}
