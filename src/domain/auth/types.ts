export type UserRole = 'admin' | 'manager'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
}

export interface AuthSession {
  accessToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export const INVITABLE_ROLES: readonly UserRole[] = ['admin', 'manager']
export const MIN_PASSWORD_LENGTH = 8

export interface InvitationPreview {
  email: string
  fullName: string
  role: UserRole
  expiresAt: string
}

export interface InviteUserInput {
  email: string
  fullName: string
  role: UserRole
}

export interface Invitation extends InvitationPreview {
  id: string
}
