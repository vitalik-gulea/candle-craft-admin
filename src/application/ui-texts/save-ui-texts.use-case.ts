import type { UiTextUpdate } from '../../domain/ui-texts/types'
import type { UiTextsRepository } from './ports'

export function saveUiTextsUseCase(repository: UiTextsRepository, items: UiTextUpdate[]) {
  return repository.save(items)
}
