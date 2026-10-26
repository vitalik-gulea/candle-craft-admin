export class SiteSettingsError extends Error {
  readonly code: 'VALIDATION' | 'FORBIDDEN' | 'UNKNOWN'
  readonly details: string | string[] | null

  constructor(
    code: SiteSettingsError['code'],
    message?: string,
    details: string | string[] | null = null,
  ) {
    super(message ?? code)
    this.name = 'SiteSettingsError'
    this.code = code
    this.details = details
  }
}
