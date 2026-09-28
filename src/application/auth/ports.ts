import type { AuthSession, LoginCredentials, User } from '../../domain/auth/types'

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>
  me(): Promise<User>
}

export type TokenPersistence = 'local' | 'session'

export interface TokenStorage {
  getAccessToken(): string | null
  setAccessToken(token: string, persistence: TokenPersistence): void
  clear(): void
  getPersistence(): TokenPersistence | null
}
