import type {
  DeliveryMethod,
  Order,
  OrderHistoryEntry,
  OrderItem,
  OrderListFilters,
  OrderListPage,
  OrderLocale,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentResult,
  UpdateOrderInput,
} from '../../domain/orders/types'

type NullableString = string | null

export interface OrderItemOptionResponseDto {
  labelRo: string
  labelRu: string
  valueRo: string
  valueRu: string
}

export interface OrderItemResponseDto {
  id: string
  productId: string
  variantId: NullableString
  sku: NullableString
  nameRo: string
  nameRu: string
  imageUrl: NullableString
  options: OrderItemOptionResponseDto[]
  regularUnitPrice: string
  unitPrice: string
  quantity: number
  lineTotal: string
}

export interface OrderResponseDto {
  id: string
  number: number
  displayNumber: string
  locale: OrderLocale
  firstName: string
  lastName: string
  phone: string
  email: string
  deliveryMethod: DeliveryMethod
  deliveryCity: NullableString
  deliveryPostalCode: NullableString
  deliveryAddress: NullableString
  isB2b: boolean
  companyName: NullableString
  companyIdno: NullableString
  companyVatCode: NullableString
  companyLegalAddress: NullableString
  paymentMethod: PaymentMethod
  paymentResult: PaymentResult | null
  status: OrderStatus
  subtotal: string
  deliveryCost: string
  total: string
  customerComment: NullableString
  adminComment: NullableString
  source: OrderSource
  utmSource: NullableString
  utmMedium: NullableString
  utmCampaign: NullableString
  referrer: NullableString
  items: OrderItemResponseDto[]
  createdAt: string
  updatedAt: string
}

export interface OrderListResponseDto {
  items: OrderResponseDto[]
  total: number
  page: number
  limit: number
}

export interface OrderHistoryEntryResponseDto {
  id: string
  actorId: NullableString
  actorEmail: NullableString
  field: string
  oldValue: NullableString
  newValue: NullableString
  createdAt: string
}

function mapOrderItem(dto: OrderItemResponseDto): OrderItem {
  return {
    id: dto.id,
    productId: dto.productId,
    variantId: dto.variantId,
    sku: dto.sku,
    name: { ro: dto.nameRo, ru: dto.nameRu },
    imageUrl: dto.imageUrl,
    options: dto.options.map((option) => ({
      label: { ro: option.labelRo, ru: option.labelRu },
      value: { ro: option.valueRo, ru: option.valueRu },
    })),
    regularUnitPrice: dto.regularUnitPrice,
    unitPrice: dto.unitPrice,
    quantity: dto.quantity,
    lineTotal: dto.lineTotal,
  }
}

export function mapOrder(dto: OrderResponseDto): Order {
  return {
    id: dto.id,
    number: dto.number,
    displayNumber: dto.displayNumber,
    locale: dto.locale,
    firstName: dto.firstName,
    lastName: dto.lastName,
    phone: dto.phone,
    email: dto.email,
    deliveryMethod: dto.deliveryMethod,
    deliveryCity: dto.deliveryCity,
    deliveryPostalCode: dto.deliveryPostalCode,
    deliveryAddress: dto.deliveryAddress,
    isB2b: dto.isB2b,
    companyName: dto.companyName,
    companyIdno: dto.companyIdno,
    companyVatCode: dto.companyVatCode,
    companyLegalAddress: dto.companyLegalAddress,
    paymentMethod: dto.paymentMethod,
    paymentResult: dto.paymentResult,
    status: dto.status,
    subtotal: dto.subtotal,
    deliveryCost: dto.deliveryCost,
    total: dto.total,
    customerComment: dto.customerComment,
    adminComment: dto.adminComment,
    source: dto.source,
    utmSource: dto.utmSource,
    utmMedium: dto.utmMedium,
    utmCampaign: dto.utmCampaign,
    referrer: dto.referrer,
    items: dto.items.map(mapOrderItem),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export function mapOrderListPage(dto: OrderListResponseDto): OrderListPage {
  return {
    items: dto.items.map(mapOrder),
    total: dto.total,
    page: dto.page,
    limit: dto.limit,
  }
}

export function mapOrderHistoryEntry(dto: OrderHistoryEntryResponseDto): OrderHistoryEntry {
  return {
    id: dto.id,
    actorId: dto.actorId,
    actorEmail: dto.actorEmail,
    field: dto.field,
    oldValue: dto.oldValue,
    newValue: dto.newValue,
    createdAt: dto.createdAt,
  }
}

export function toOrderListParams(filters?: OrderListFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (!filters) return params
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') continue
    params[key] = value
  }
  return params
}

export function toUpdateOrderDto(input: UpdateOrderInput): UpdateOrderInput {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as UpdateOrderInput
}
