export type OrderStatus = 'new' | 'processing' | 'ready_for_pickup' | 'completed' | 'cancelled'
export type DeliveryMethod = 'courier' | 'post' | 'pickup'
export type PaymentMethod = 'cash' | 'online'
export type PaymentResult = 'pending' | 'success' | 'failed'
export type OrderSource =
  | 'organic_search'
  | 'direct'
  | 'instagram'
  | 'facebook'
  | 'referral'
  | 'other'
  | 'unknown'
export type OrderLocale = 'ro' | 'ru'

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'new',
  'processing',
  'ready_for_pickup',
  'completed',
  'cancelled',
]
export const DELIVERY_METHODS: readonly DeliveryMethod[] = ['courier', 'post', 'pickup']
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['cash', 'online']
export const PAYMENT_RESULTS: readonly PaymentResult[] = ['pending', 'success', 'failed']
export const ORDER_SOURCES: readonly OrderSource[] = [
  'organic_search',
  'direct',
  'instagram',
  'facebook',
  'referral',
  'other',
  'unknown',
]

export const ORDERS_MAX_PAGE_SIZE = 100

export interface OrderItemOption {
  label: { ro: string; ru: string }
  value: { ro: string; ru: string }
}

export interface OrderItem {
  id: string
  productId: string
  variantId: string | null
  sku: string | null
  name: { ro: string; ru: string }
  imageUrl: string | null
  options: OrderItemOption[]
  regularUnitPrice: string
  unitPrice: string
  quantity: number
  lineTotal: string
}

export interface Order {
  id: string
  number: number
  displayNumber: string
  locale: OrderLocale
  firstName: string
  lastName: string
  phone: string
  email: string
  deliveryMethod: DeliveryMethod
  deliveryCity: string | null
  deliveryPostalCode: string | null
  deliveryAddress: string | null
  isB2b: boolean
  companyName: string | null
  companyIdno: string | null
  companyVatCode: string | null
  companyLegalAddress: string | null
  paymentMethod: PaymentMethod
  paymentResult: PaymentResult | null
  status: OrderStatus
  subtotal: string
  deliveryCost: string
  total: string
  customerComment: string | null
  adminComment: string | null
  source: OrderSource
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  referrer: string | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderListFilters {
  search?: string
  status?: OrderStatus
  deliveryMethod?: DeliveryMethod
  paymentMethod?: PaymentMethod
  paymentResult?: PaymentResult
  source?: OrderSource
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface OrderListPage {
  items: Order[]
  total: number
  page: number
  limit: number
}

export interface UpdateOrderInput {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  deliveryCity?: string | null
  deliveryPostalCode?: string | null
  deliveryAddress?: string | null
  adminComment?: string | null
}

export type OrderHistoryField =
  | 'status'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'email'
  | 'deliveryCity'
  | 'deliveryPostalCode'
  | 'deliveryAddress'
  | 'adminComment'

export interface OrderHistoryEntry {
  id: string
  actorId: string | null
  actorEmail: string | null
  field: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
}
