import type { NavigationPlacement } from '../../domain/navigation/types'
import type { NavigationRepository } from './ports'

export function reorderNavigationItemsUseCase(
  repository: NavigationRepository,
  placement: NavigationPlacement,
  orderedIds: string[],
) {
  return repository.reorder(placement, orderedIds)
}
