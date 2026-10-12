import axios from 'axios'
import type { AuthRepository } from '../../application/auth/ports'
import { AuthError } from '../../domain/auth/errors'
import type {
  AuthSession,
  Invitation,
  InvitationPreview,
  InviteUserInput,
  LoginCredentials,
  User,
  UserRole,
} from '../../domain/auth/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
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

function toInvitationError(error: unknown): AuthError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)
  if (status === 400) return new AuthError('INVALID_INVITATION', undefined, details)
  if (status === 409) return new AuthError('CONFLICT', undefined, details)
  if (status === 401 || status === 403) return new AuthError('FORBIDDEN', undefined, details)
  return new AuthError('UNKNOWN', undefined, details)
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

  async getInvitation(token: string): Promise<InvitationPreview> {
    try {
      const { data } = await httpClient.get<InvitationPreview>(
        `/v1/auth/invitations/${encodeURIComponent(token)}`,
      )
      return data
    } catch (error) {
      throw toInvitationError(error)
    }
  },

  async acceptInvitation(token: string, password: string): Promise<AuthSession> {
    try {
      const { data } = await httpClient.post<AuthResponseDto>('/v1/auth/accept-invitation', {
        token,
        password,
      })
      return mapSession(data)
    } catch (error) {
      throw toInvitationError(error)
    }
  },

  async inviteUser(input: InviteUserInput): Promise<Invitation> {
    try {
      const { data } = await httpClient.post<Invitation>('/v1/users/invitations', input)
      return data
    } catch (error) {
      const status = getHttpStatus(error)
      if (status === 400) {
        throw new AuthError('VALIDATION', undefined, extractApiMessage(error))
      }
      throw toInvitationError(error)
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
