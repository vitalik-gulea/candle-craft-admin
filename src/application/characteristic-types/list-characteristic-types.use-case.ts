import type { CharacteristicTypesRepository } from './ports'
import type { CharacteristicTypeListFilters } from '../../domain/characteristic-types/types'

export function listCharacteristicTypesUseCase(
  repository: CharacteristicTypesRepository,
  filters?: CharacteristicTypeListFilters,
) {
  return repository.list(filters)
}
