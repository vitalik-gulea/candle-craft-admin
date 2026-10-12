import { create } from 'zustand'
import { acceptInvitationUseCase } from '../../application/auth/accept-invitation.use-case'
import { loginUseCase } from '../../application/auth/login.use-case'
import { logoutUseCase } from '../../application/auth/logout.use-case'
import { restoreSessionUseCase } from '../../application/auth/restore-session.use-case'
import { AuthError } from '../../domain/auth/errors'
import type { LoginCredentials, User } from '../../domain/auth/types'
import { authApi } from '../../infrastructure/auth/auth.api'
import { tokenStorage } from '../../infrastructure/auth/token.storage'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  isSubmitting: boolean
  errorCode: AuthError['code'] | null
  bootstrap: () => Promise<void>
  login: (credentials: LoginCredentials, rememberMe: boolean) => Promise<boolean>
  acceptInvitation: (token: string, password: string) => Promise<AuthError | null>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
  isSubmitting: false,
  errorCode: null,

  async bootstrap() {
    set({ isBootstrapping: true, errorCode: null })
    const user = await restoreSessionUseCase(authApi, tokenStorage)
    set({
      user,
      isAuthenticated: !!user,
      isBootstrapping: false,
    })
  },

  async login(credentials, rememberMe) {
    set({ isSubmitting: true, errorCode: null })
    try {
      const session = await loginUseCase(
        authApi,
        tokenStorage,
        credentials,
        rememberMe ? 'local' : 'session',
      )
      set({
        user: session.user,
        isAuthenticated: true,
        isSubmitting: false,
        errorCode: null,
      })
      return true
    } catch (error) {
      const code = error instanceof AuthError ? error.code : 'UNKNOWN'
      set({
        user: null,
        isAuthenticated: false,
        isSubmitting: false,
        errorCode: code,
      })
      return false
    }
  },

  async acceptInvitation(token, password) {
    set({ isSubmitting: true, errorCode: null })
    try {
      const session = await acceptInvitationUseCase(authApi, tokenStorage, token, password)
      set({ user: session.user, isAuthenticated: true, isSubmitting: false, errorCode: null })
      return null
    } catch (error) {
      set({ isSubmitting: false })
      return error instanceof AuthError ? error : new AuthError('UNKNOWN')
    }
  },

  logout() {
    logoutUseCase(tokenStorage)
    set({
      user: null,
      isAuthenticated: false,
      errorCode: null,
    })
  },

  clearError() {
    set({ errorCode: null })
  },
}))
