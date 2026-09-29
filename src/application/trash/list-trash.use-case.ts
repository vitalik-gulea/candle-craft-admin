import type { TrashRepository } from './ports'
import type { TrashListFilters } from '../../domain/trash/types'

export function listTrashUseCase(repository: TrashRepository, filters?: TrashListFilters) {
  return repository.list(filters)
}
