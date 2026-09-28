import type { AuthSession, LoginCredentials } from '../../domain/auth/types'
import type { AuthRepository, TokenPersistence, TokenStorage } from './ports'

export async function loginUseCase(
  authRepository: AuthRepository,
  tokenStorage: TokenStorage,
  credentials: LoginCredentials,
  persistence: TokenPersistence,
): Promise<AuthSession> {
  const session = await authRepository.login(credentials)
  tokenStorage.setAccessToken(session.accessToken, persistence)
  return session
}
