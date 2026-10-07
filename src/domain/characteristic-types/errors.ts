export class CharacteristicTypeError extends Error {
  readonly code: 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: CharacteristicTypeError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'CharacteristicTypeError'
    this.code = code
    this.details = details
  }
}
