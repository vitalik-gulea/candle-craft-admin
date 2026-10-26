export interface SiteSettings {
  heroImageUrl: string | null
  heroImageKey: string | null
  freeDeliveryThreshold: string | null
  updatedAt: string
}

export interface UpdateSiteSettingsInput {
  heroImageUrl?: string | null
  heroImageKey?: string | null
  freeDeliveryThreshold?: string | null
}
