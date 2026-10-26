import type { NavigationItemInput } from '../../domain/navigation/types'
import type { NavigationRepository } from './ports'

export function createNavigationItemUseCase(
  repository: NavigationRepository,
  input: NavigationItemInput,
) {
  return repository.create(input)
}
