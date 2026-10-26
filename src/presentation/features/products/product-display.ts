import type { Product } from '../../../domain/products/types'
import type { ProductVariant } from '../../../domain/product-variants/types'

export type StockDisplayStatus = 'active' | 'low' | 'outOfStock'

const LOW_STOCK_THRESHOLD = 10

export function getStockDisplayStatus(stockQuantity: number): StockDisplayStatus {
  if (stockQuantity <= 0) return 'outOfStock'
  if (stockQuantity <= LOW_STOCK_THRESHOLD) return 'low'
  return 'active'
}

export function getProductStockQuantity(
  product: Product,
  variants: ProductVariant[] | undefined,
): number {
  if (!variants || variants.length === 0) return product.stockQuantity
  return variants
    .filter((variant) => variant.isActive)
    .reduce((sum, variant) => sum + variant.stockQuantity, 0)
}

export function getVariantPrice(variant: ProductVariant): string | null {
  return variant.regularPrice
}

export function getProductMinVariantPrice(variants: ProductVariant[]): string | null {
  const prices = variants
    .filter((variant) => variant.isActive)
    .map(getVariantPrice)
    .filter((price): price is string => Boolean(price))
    .map(Number)
  if (prices.length === 0) return null
  return String(Math.min(...prices))
}

export function formatProductPrice(value: string | null): string {
  if (!value) return '—'
  const normalized = value.replace(/\.00$/, '')
  return `${normalized} MDL`
}

export function formatStockQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`
}
