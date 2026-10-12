import type { AuthSession } from '../../domain/auth/types'
import type { AuthRepository, TokenStorage } from './ports'

export async function acceptInvitationUseCase(
  authRepository: AuthRepository,
  tokenStorage: TokenStorage,
  token: string,
  password: string,
): Promise<AuthSession> {
  const session = await authRepository.acceptInvitation(token, password)
  tokenStorage.setAccessToken(session.accessToken, 'local')
  return session
}
