import type { SiteSettings, UpdateSiteSettingsInput } from '../../domain/settings/types'

export interface SiteSettingsRepository {
  get(): Promise<SiteSettings>
  update(input: UpdateSiteSettingsInput): Promise<SiteSettings>
}
