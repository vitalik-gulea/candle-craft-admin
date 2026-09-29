export class UnitOfSaleError extends Error {
  readonly code: 'NOT_FOUND' | 'VALIDATION' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: UnitOfSaleError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'UnitOfSaleError'
    this.code = code
    this.details = details
  }
}
