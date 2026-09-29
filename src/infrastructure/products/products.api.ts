import type { ProductsRepository } from '../../application/products/ports'
import { ProductError } from '../../domain/products/errors'
import type {
  CreateProductInput,
  PermanentlyDeleteProductInput,
  Product,
  ProductImage,
  ProductImageInput,
  ProductListFilters,
  ProductUrlRedirect,
  UpdateProductInput,
} from '../../domain/products/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'
import {
  mapProduct,
  mapProductImage,
  mapProductRedirect,
  toCreateProductDto,
  toProductImageInputDto,
  toProductListParams,
  toUpdateProductDto,
  type ProductImageResponseDto,
  type ProductResponseDto,
  type ProductUrlRedirectResponseDto,
} from './product.mapper'

function toProductError(error: unknown): ProductError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new ProductError('NOT_FOUND', undefined, details)
  if (status === 409) return new ProductError('CONFLICT', undefined, details)
  if (status === 400) return new ProductError('VALIDATION', undefined, details)
  if (status === 403) return new ProductError('FORBIDDEN', undefined, details)
  return new ProductError('UNKNOWN', undefined, details)
}

export const productsApi: ProductsRepository = {
  async list(filters?: ProductListFilters): Promise<Product[]> {
    try {
      const { data } = await httpClient.get<ProductResponseDto[]>('/v1/products/admin', {
        params: toProductListParams(filters),
      })
      return data.map(mapProduct)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async getById(id: string): Promise<Product> {
    try {
      const { data } = await httpClient.get<ProductResponseDto>(`/v1/products/admin/${id}`)
      return mapProduct(data)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async create(input: CreateProductInput): Promise<Product> {
    try {
      const { data } = await httpClient.post<ProductResponseDto>(
        '/v1/products/admin',
        toCreateProductDto(input),
      )
      return mapProduct(data)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    try {
      const { data } = await httpClient.patch<ProductResponseDto>(
        `/v1/products/admin/${id}`,
        toUpdateProductDto(input),
      )
      return mapProduct(data)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async trash(id: string): Promise<void> {
    try {
      await httpClient.delete(`/v1/products/admin/${id}`)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async restore(id: string): Promise<Product> {
    try {
      const { data } = await httpClient.post<ProductResponseDto>(
        `/v1/products/admin/${id}/restore`,
      )
      return mapProduct(data)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async permanentlyDelete(id: string, input?: PermanentlyDeleteProductInput): Promise<void> {
    try {
      await httpClient.delete(`/v1/products/admin/${id}/permanent`, {
        data: input ?? {},
      })
    } catch (error) {
      throw toProductError(error)
    }
  },

  async copy(id: string): Promise<Product> {
    try {
      const { data } = await httpClient.post<ProductResponseDto>(
        `/v1/products/admin/${id}/copy`,
      )
      return mapProduct(data)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async listImages(id: string): Promise<ProductImage[]> {
    try {
      const { data } = await httpClient.get<ProductImageResponseDto[]>(
        `/v1/products/admin/${id}/images`,
      )
      return data.map(mapProductImage)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async replaceImages(id: string, images: ProductImageInput[]): Promise<ProductImage[]> {
    try {
      const { data } = await httpClient.put<ProductImageResponseDto[]>(
        `/v1/products/admin/${id}/images`,
        { images: images.map(toProductImageInputDto) },
      )
      return data.map(mapProductImage)
    } catch (error) {
      throw toProductError(error)
    }
  },

  async listRedirects(id: string): Promise<ProductUrlRedirect[]> {
    try {
      const { data } = await httpClient.get<ProductUrlRedirectResponseDto[]>(
        `/v1/products/admin/${id}/redirects`,
      )
      return data.map(mapProductRedirect)
    } catch (error) {
      throw toProductError(error)
    }
  },
}
