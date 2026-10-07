import type { CharacteristicTypesRepository } from './ports'

export function disableCharacteristicTypeUseCase(
  repository: CharacteristicTypesRepository,
  id: string,
) {
  return repository.disable(id)
}
