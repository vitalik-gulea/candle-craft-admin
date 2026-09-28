import axios from 'axios'
import type { AuthRepository } from '../../application/auth/ports'
import { AuthError } from '../../domain/auth/errors'
import type { AuthSession, LoginCredentials, User, UserRole } from '../../domain/auth/types'
import { httpClient } from '../http/http-client'

interface LoginDto {
  email: string
  password: string
}

interface UserResponseDto {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
}

interface AuthResponseDto {
  accessToken: string
  user: UserResponseDto
}

function mapUser(dto: UserResponseDto): User {
  return {
    id: dto.id,
    email: dto.email,
    fullName: dto.fullName,
    role: dto.role,
    createdAt: dto.createdAt,
  }
}

function mapSession(dto: AuthResponseDto): AuthSession {
  return {
    accessToken: dto.accessToken,
    user: mapUser(dto.user),
  }
}

function toAuthError(error: unknown): AuthError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status === 401) return new AuthError('INVALID_CREDENTIALS')
    if (status === 400) return new AuthError('INVALID_CREDENTIALS')
  }
  return new AuthError('UNKNOWN')
}

export const authApi: AuthRepository = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const body: LoginDto = {
        email: credentials.email,
        password: credentials.password,
      }
      const { data } = await httpClient.post<AuthResponseDto>('/v1/auth/login', body)
      return mapSession(data)
    } catch (error) {
      throw toAuthError(error)
    }
  },

  async me(): Promise<User> {
    try {
      const { data } = await httpClient.get<UserResponseDto>('/v1/users/me')
      return mapUser(data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new AuthError('UNAUTHORIZED')
      }
      throw new AuthError('UNKNOWN')
    }
  },
}
