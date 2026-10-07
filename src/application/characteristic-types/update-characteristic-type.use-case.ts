import type { CharacteristicTypesRepository } from './ports'
import type { UpdateCharacteristicTypeInput } from '../../domain/characteristic-types/types'

export function updateCharacteristicTypeUseCase(
  repository: CharacteristicTypesRepository,
  id: string,
  input: UpdateCharacteristicTypeInput,
) {
  return repository.update(id, input)
}
