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
