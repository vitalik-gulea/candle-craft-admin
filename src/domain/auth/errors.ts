export class AuthError extends Error {
  readonly code:
    | 'INVALID_CREDENTIALS'
    | 'UNAUTHORIZED'
    | 'INVALID_INVITATION'
    | 'CONFLICT'
    | 'VALIDATION'
    | 'FORBIDDEN'
    | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: AuthError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'AuthError'
    this.code = code
    this.details = details
  }
}
