import type { TrashItem, TrashListFilters } from '../../domain/trash/types'

export interface TrashRepository {
  list(filters?: TrashListFilters): Promise<TrashItem[]>
}
