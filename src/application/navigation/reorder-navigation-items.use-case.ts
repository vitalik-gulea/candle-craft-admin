import type { NavigationRepository } from './ports'

export function reorderNavigationItemsUseCase(
  repository: NavigationRepository,
  orderedIds: string[],
) {
  return repository.reorder(orderedIds)
}
