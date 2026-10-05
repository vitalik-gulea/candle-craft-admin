import type { UiText } from '../../../domain/ui-texts/types'

export const UI_TEXT_SECTION_ORDER = [
  'meta',
  'nav',
  'aria',
  'drawer',
  'hero',
  'categoryGrid',
  'bestSellers',
  'searchModal',
  'shop',
  'productPage',
  'cart',
  'checkout',
  'deliveryMethods',
  'footer',
] as const

export interface UiTextGroup {
  section: string
  items: UiText[]
}

export function groupUiTexts(items: UiText[]): UiTextGroup[] {
  const bySection = new Map<string, UiText[]>()
  for (const item of items) {
    const section = item.group
    const bucket = bySection.get(section)
    if (bucket) bucket.push(item)
    else bySection.set(section, [item])
  }

  const known = UI_TEXT_SECTION_ORDER.filter((section) => bySection.has(section))
  const unknown = [...bySection.keys()].filter(
    (section) => !(UI_TEXT_SECTION_ORDER as readonly string[]).includes(section),
  )

  return [...known, ...unknown].map((section) => ({
    section,
    items: bySection.get(section) ?? [],
  }))
}
