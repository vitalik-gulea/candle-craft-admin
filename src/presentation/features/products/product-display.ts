export type StockDisplayStatus = 'active' | 'low' | 'outOfStock'

const LOW_STOCK_THRESHOLD = 10

export function getStockDisplayStatus(stockQuantity: number): StockDisplayStatus {
  if (stockQuantity <= 0) return 'outOfStock'
  if (stockQuantity <= LOW_STOCK_THRESHOLD) return 'low'
  return 'active'
}

export function formatProductPrice(value: string | null): string {
  if (!value) return '—'
  const normalized = value.replace(/\.00$/, '')
  return `${normalized} MDL`
}

export function formatStockQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`
}
