import type { NavigationRepository } from './ports'

export function listNavigationItemsUseCase(repository: NavigationRepository) {
  return repository.list()
}
