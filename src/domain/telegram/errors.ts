export class TelegramError extends Error {
  readonly code: 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: TelegramError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'TelegramError'
    this.code = code
    this.details = details
  }
}
