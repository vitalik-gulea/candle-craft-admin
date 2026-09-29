export class NotificationError extends Error {
  readonly code: 'NOT_FOUND' | 'VALIDATION' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: NotificationError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'NotificationError'
    this.code = code
    this.details = details
  }
}
