import type { UiTextsRepository } from './ports'

export function resetUiTextUseCase(repository: UiTextsRepository, key: string) {
  return repository.reset(key)
}
