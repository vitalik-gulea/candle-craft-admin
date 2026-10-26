import type { SiteSettingsRepository } from './ports'

export function getSiteSettingsUseCase(repository: SiteSettingsRepository) {
  return repository.get()
}
