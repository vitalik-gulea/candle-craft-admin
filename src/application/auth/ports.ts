import type {
  AuthSession,
  Invitation,
  InvitationPreview,
  InviteUserInput,
  LoginCredentials,
  User,
} from '../../domain/auth/types'

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>
  me(): Promise<User>
  getInvitation(token: string): Promise<InvitationPreview>
  acceptInvitation(token: string, password: string): Promise<AuthSession>
  inviteUser(input: InviteUserInput): Promise<Invitation>
}

export type TokenPersistence = 'local' | 'session'

export interface TokenStorage {
  getAccessToken(): string | null
  setAccessToken(token: string, persistence: TokenPersistence): void
  clear(): void
  getPersistence(): TokenPersistence | null
}
