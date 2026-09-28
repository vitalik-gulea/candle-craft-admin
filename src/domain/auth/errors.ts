export class AuthError extends Error {
  readonly code: 'INVALID_CREDENTIALS' | 'UNAUTHORIZED' | 'UNKNOWN'

  constructor(code: AuthError['code'], message?: string) {
    super(message ?? code)
    this.name = 'AuthError'
    this.code = code
  }
}
