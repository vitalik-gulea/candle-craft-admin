export class ProductVariantError extends Error {
  readonly code: 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: ProductVariantError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'ProductVariantError'
    this.code = code
    this.details = details
  }
}
