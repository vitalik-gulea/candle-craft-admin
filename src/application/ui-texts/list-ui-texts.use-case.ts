import type { UiTextsRepository } from './ports'

export function listUiTextsUseCase(repository: UiTextsRepository) {
  return repository.list()
}
