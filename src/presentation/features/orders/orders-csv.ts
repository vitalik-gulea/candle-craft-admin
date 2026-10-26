import type { Order } from '../../../domain/orders/types'
import type { Locale } from '../../../shared/i18n'
import { formatChisinauDateTime } from '../../../shared/utils/chisinau-time'
import { hasItemDiscount } from './order-display'

type Translate = (key: string, params?: Record<string, string>) => string

function escapeCell(value: string): string {
  return /[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function formatItems(order: Order, locale: Locale, t: Translate): string {
  return order.items
    .map((item) => {
      const options = item.options
        .map((option) => `${option.label[locale]}: ${option.value[locale]}`)
        .join(', ')
      const sku = item.sku ? ` [${t('orders.details.items.sku')}: ${item.sku}]` : ''
      const discount = hasItemDiscount(item) ? ` (${item.regularUnitPrice} -> ${item.unitPrice})` : ''
      return `${item.name[locale]}${options ? ` (${options})` : ''}${sku} x ${item.quantity} = ${item.lineTotal}${discount}`
    })
    .join('\n')
}

export function buildOrdersCsv(orders: Order[], locale: Locale, t: Translate): string {
  const header = [
    'ID',
    t('orders.columns.number'),
    t('orders.columns.date'),
    t('orders.details.language'),
    t('orders.columns.status'),
    t('orders.details.customer.firstName'),
    t('orders.details.customer.lastName'),
    t('orders.details.customer.phone'),
    t('orders.details.customer.email'),
    t('orders.details.delivery.method'),
    t('orders.details.delivery.city'),
    t('orders.details.delivery.postalCode'),
    t('orders.details.delivery.address'),
    t('orders.details.company.b2b'),
    t('orders.details.company.name'),
    t('orders.details.company.idno'),
    t('orders.details.company.vatCode'),
    t('orders.details.company.legalAddress'),
    t('orders.details.payment.method'),
    t('orders.details.payment.result'),
    t('orders.details.items.title'),
    t('orders.details.totals.subtotal'),
    t('orders.details.totals.deliveryCost'),
    t('orders.details.totals.total'),
    t('orders.details.customerComment'),
    t('orders.details.adminComment.title'),
    t('orders.details.source.source'),
    t('orders.details.source.utmSource'),
    t('orders.details.source.utmMedium'),
    t('orders.details.source.utmCampaign'),
    t('orders.details.source.referrer'),
    t('orders.details.createdAt'),
    'Updated at',
  ]

  const rows = orders.map((order) => [
    order.id,
    order.displayNumber,
    formatChisinauDateTime(order.createdAt, locale),
    order.locale,
    t(`orders.status.${order.status}`),
    order.firstName,
    order.lastName,
    order.phone,
    order.email,
    t(`orders.deliveryMethod.${order.deliveryMethod}`),
    order.deliveryCity ?? '',
    order.deliveryPostalCode ?? '',
    order.deliveryAddress ?? '',
    order.isB2b ? t('common.yes') : t('common.no'),
    order.companyName ?? '',
    order.companyIdno ?? '',
    order.companyVatCode ?? '',
    order.companyLegalAddress ?? '',
    t(`orders.paymentMethod.${order.paymentMethod}`),
    order.paymentResult ? t(`orders.paymentResult.${order.paymentResult}`) : '',
    formatItems(order, locale, t),
    order.subtotal,
    order.deliveryCost,
    order.total,
    order.customerComment ?? '',
    order.adminComment ?? '',
    t(`orders.source.${order.source}`),
    order.utmSource ?? '',
    order.utmMedium ?? '',
    order.utmCampaign ?? '',
    order.referrer ?? '',
    order.createdAt,
    order.updatedAt,
  ])

  return `﻿${[header, ...rows].map((row) => row.map(escapeCell).join(';')).join('\r\n')}`
}

export function downloadTextFile(content: string, fileName: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
