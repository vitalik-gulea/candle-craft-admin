import type { Order, OrderItem, OrderStatus } from '../../../domain/orders/types'

export function formatOrderMoney(value: string): string {
  return `${value.replace(/\.00$/, '')} MDL`
}

export function getOrderCustomerName(order: Pick<Order, 'firstName' | 'lastName'>): string {
  return `${order.firstName} ${order.lastName}`.trim()
}

export function hasItemDiscount(item: Pick<OrderItem, 'regularUnitPrice' | 'unitPrice'>): boolean {
  return Number(item.regularUnitPrice) !== Number(item.unitPrice)
}

export function getItemDiscountTotal(item: OrderItem): number {
  return (Number(item.regularUnitPrice) - Number(item.unitPrice)) * item.quantity
}

export function isZeroAmount(value: string): boolean {
  return Number(value) === 0
}

export const ORDER_STATUS_CLASS_NAMES: Record<OrderStatus, string> = {
  new: 'bg-warning text-ink',
  processing: 'bg-warning/20 text-ink',
  ready_for_pickup: 'bg-accent/10 text-accent',
  completed: 'bg-accent text-white',
  cancelled: 'bg-danger/10 text-danger',
}

export function toDateInputValue(iso: string | undefined): string {
  return iso ? iso.slice(0, 10) : ''
}
