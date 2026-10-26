export class NavigationItemError extends Error {
  readonly code: 'NOT_FOUND' | 'VALIDATION' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: NavigationItemError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'NavigationItemError'
    this.code = code
    this.details = details
  }
}
