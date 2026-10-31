import type { NavigationPlacement } from '../../domain/navigation/types'
import type { NavigationRepository } from './ports'

export function listNavigationItemsUseCase(
  repository: NavigationRepository,
  placement: NavigationPlacement,
) {
  return repository.list(placement)
}
