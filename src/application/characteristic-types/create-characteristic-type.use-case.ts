import type { CharacteristicTypesRepository } from './ports'
import type { CreateCharacteristicTypeInput } from '../../domain/characteristic-types/types'

export function createCharacteristicTypeUseCase(
  repository: CharacteristicTypesRepository,
  input: CreateCharacteristicTypeInput,
) {
  return repository.create(input)
}
