export class ProductError extends Error {
  readonly code: 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: ProductError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'ProductError'
    this.code = code
    this.details = details
  }
}
