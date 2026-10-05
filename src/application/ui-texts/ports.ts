import type { UiText, UiTextUpdate } from '../../domain/ui-texts/types'

export interface UiTextsRepository {
  list(): Promise<UiText[]>
  save(items: UiTextUpdate[]): Promise<UiText[]>
  reset(key: string): Promise<void>
}
