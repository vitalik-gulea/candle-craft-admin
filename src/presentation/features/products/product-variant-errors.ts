import type { ProductVariantError } from '../../../domain/product-variants/errors'

type Translate = (key: string) => string

export function describeVariantError(
  code: ProductVariantError['code'] | null,
  details: string | string[] | null,
  t: Translate,
): string | null {
  if (!code) return null
  const fromResponse = Array.isArray(details) ? details.join(', ') : details
  if (code === 'CONFLICT') return fromResponse || t('products.new.sections.variants.errors.conflict')
  if (code === 'VALIDATION') {
    return fromResponse || t('products.new.sections.variants.errors.axesMismatch')
  }
  if (code === 'NOT_FOUND') return t('products.new.sections.variants.errors.notFound')
  if (code === 'FORBIDDEN') return t('products.new.sections.variants.errors.forbidden')
  return t('products.new.sections.variants.errors.unknown')
}
