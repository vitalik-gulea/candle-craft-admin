import type { NavigationItem, NavigationItemInput } from '../../domain/navigation/types'

export interface NavigationRepository {
  list(): Promise<NavigationItem[]>
  create(input: NavigationItemInput): Promise<NavigationItem>
  update(id: string, input: NavigationItemInput): Promise<NavigationItem>
  remove(id: string): Promise<void>
  reorder(orderedIds: string[]): Promise<NavigationItem[]>
}
