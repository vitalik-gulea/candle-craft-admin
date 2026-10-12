import type { OrdersRepository } from '../../application/orders/ports'
import { OrderError } from '../../domain/orders/errors'
import type {
  Order,
  OrderHistoryEntry,
  OrderListFilters,
  OrderListPage,
  OrderStatus,
  UpdateOrderInput,
} from '../../domain/orders/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'
import {
  mapOrder,
  mapOrderHistoryEntry,
  mapOrderListPage,
  toOrderListParams,
  toUpdateOrderDto,
  type OrderHistoryEntryResponseDto,
  type OrderListResponseDto,
  type OrderResponseDto,
} from './order.mapper'

function toOrderError(error: unknown): OrderError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new OrderError('NOT_FOUND', undefined, details)
  if (status === 409) return new OrderError('CONFLICT', undefined, details)
  if (status === 400) return new OrderError('VALIDATION', undefined, details)
  if (status === 403) return new OrderError('FORBIDDEN', undefined, details)
  return new OrderError('UNKNOWN', undefined, details)
}

export const ordersApi: OrdersRepository = {
  async list(filters?: OrderListFilters): Promise<OrderListPage> {
    try {
      const { data } = await httpClient.get<OrderListResponseDto>('/v1/orders/admin', {
        params: toOrderListParams(filters),
      })
      return mapOrderListPage(data)
    } catch (error) {
      throw toOrderError(error)
    }
  },

  async getById(id: string): Promise<Order> {
    try {
      const { data } = await httpClient.get<OrderResponseDto>(`/v1/orders/admin/${id}`)
      return mapOrder(data)
    } catch (error) {
      throw toOrderError(error)
    }
  },

  async listHistory(id: string): Promise<OrderHistoryEntry[]> {
    try {
      const { data } = await httpClient.get<OrderHistoryEntryResponseDto[]>(
        `/v1/orders/admin/${id}/history`,
      )
      return data.map(mapOrderHistoryEntry)
    } catch (error) {
      throw toOrderError(error)
    }
  },

  async update(id: string, input: UpdateOrderInput): Promise<Order> {
    try {
      const { data } = await httpClient.patch<OrderResponseDto>(
        `/v1/orders/admin/${id}`,
        toUpdateOrderDto(input),
      )
      return mapOrder(data)
    } catch (error) {
      throw toOrderError(error)
    }
  },

  async changeStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const { data } = await httpClient.patch<OrderResponseDto>(`/v1/orders/admin/${id}/status`, {
        status,
      })
      return mapOrder(data)
    } catch (error) {
      throw toOrderError(error)
    }
  },
}
