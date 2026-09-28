import type { TokenStorage } from './ports'

export function logoutUseCase(tokenStorage: TokenStorage): void {
  tokenStorage.clear()
}
