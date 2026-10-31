import type {
  NavigationItem,
  NavigationItemInput,
  NavigationPlacement,
} from '../../domain/navigation/types'

export interface NavigationRepository {
  list(placement: NavigationPlacement): Promise<NavigationItem[]>
  create(placement: NavigationPlacement, input: NavigationItemInput): Promise<NavigationItem>
  update(id: string, input: NavigationItemInput): Promise<NavigationItem>
  remove(id: string): Promise<void>
  reorder(placement: NavigationPlacement, orderedIds: string[]): Promise<NavigationItem[]>
}
