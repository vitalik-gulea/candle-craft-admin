import type { TrashRepository } from '../../application/trash/ports'
import { TrashError } from '../../domain/trash/errors'
import type {
  TrashItem,
  TrashItemType,
  TrashListFilters,
  TrashStatusBeforeTrash,
} from '../../domain/trash/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'

interface TrashItemResponseDto {
  type: TrashItemType
  id: string
  nameRo: string
  nameRu: string
  statusBeforeTrash: TrashStatusBeforeTrash
  deletedAt: string
  purgeAt: string
}

function mapTrashItem(dto: TrashItemResponseDto): TrashItem {
  return {
    type: dto.type,
    id: dto.id,
    name: { ro: dto.nameRo, ru: dto.nameRu },
    deletedAt: dto.deletedAt,
    purgeAt: dto.purgeAt,
    statusBeforeTrash: dto.statusBeforeTrash,
  }
}

function toTrashError(error: unknown): TrashError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new TrashError('NOT_FOUND', undefined, details)
  if (status === 409) return new TrashError('CONFLICT', undefined, details)
  if (status === 400) return new TrashError('VALIDATION', undefined, details)
  if (status === 403) return new TrashError('FORBIDDEN', undefined, details)
  return new TrashError('UNKNOWN', undefined, details)
}

export const trashApi: TrashRepository = {
  async list(filters?: TrashListFilters): Promise<TrashItem[]> {
    try {
      const { data } = await httpClient.get<TrashItemResponseDto[]>('/v1/trash/admin', {
        params: filters?.type ? { type: filters.type } : undefined,
      })
      return data.map(mapTrashItem)
    } catch (error) {
      throw toTrashError(error)
    }
  },
}
