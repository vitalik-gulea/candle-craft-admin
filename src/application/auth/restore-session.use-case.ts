import type { User } from '../../domain/auth/types'
import type { AuthRepository, TokenStorage } from './ports'

export async function restoreSessionUseCase(
  authRepository: AuthRepository,
  tokenStorage: TokenStorage,
): Promise<User | null> {
  const token = tokenStorage.getAccessToken()
  if (!token) return null

  try {
    return await authRepository.me()
  } catch {
    tokenStorage.clear()
    return null
  }
}
