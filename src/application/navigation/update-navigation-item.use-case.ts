import type { NavigationItemInput } from '../../domain/navigation/types'
import type { NavigationRepository } from './ports'

export function updateNavigationItemUseCase(
  repository: NavigationRepository,
  id: string,
  input: NavigationItemInput,
) {
  return repository.update(id, input)
}
