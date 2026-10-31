import type { NavigationItemInput, NavigationPlacement } from '../../domain/navigation/types'
import type { NavigationRepository } from './ports'

export function createNavigationItemUseCase(
  repository: NavigationRepository,
  placement: NavigationPlacement,
  input: NavigationItemInput,
) {
  return repository.create(placement, input)
}
