export class UiTextError extends Error {
  readonly code: 'NOT_FOUND' | 'VALIDATION' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: UiTextError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'UiTextError'
    this.code = code
    this.details = details
  }
}
