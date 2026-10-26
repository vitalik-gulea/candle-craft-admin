import type { NavigationRepository } from './ports'

export function deleteNavigationItemUseCase(repository: NavigationRepository, id: string) {
  return repository.remove(id)
}
