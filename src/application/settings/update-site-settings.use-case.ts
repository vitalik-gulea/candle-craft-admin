import type { UpdateSiteSettingsInput } from '../../domain/settings/types'
import type { SiteSettingsRepository } from './ports'

export function updateSiteSettingsUseCase(
  repository: SiteSettingsRepository,
  input: UpdateSiteSettingsInput,
) {
  return repository.update(input)
}
