export class OrderError extends Error {
  readonly code: 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: OrderError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'OrderError'
    this.code = code
    this.details = details
  }
}
