import type { CategoriesRepository } from '../../application/categories/ports'
import { CategoryError } from '../../domain/categories/errors'
import type {
  Category,
  CategoryFaqItemInput,
  CategoryListFilters,
  CategorySummary,
  CreateCategoryInput,
  PermanentlyDeleteCategoryInput,
  UpdateCategoryInput,
} from '../../domain/categories/types'
import { extractApiMessage, getHttpStatus } from '../http/api-error'
import { httpClient } from '../http/http-client'
import {
  mapCategory,
  toCategoryListParams,
  toCreateCategoryDto,
  toUpdateCategoryDto,
  type CategoryResponseDto,
} from './category.mapper'

function toCategoryError(error: unknown): CategoryError {
  const status = getHttpStatus(error)
  const details = extractApiMessage(error)

  if (status === 404) return new CategoryError('NOT_FOUND', undefined, details)
  if (status === 409) return new CategoryError('CONFLICT', undefined, details)
  if (status === 400) return new CategoryError('VALIDATION', undefined, details)
  if (status === 403) return new CategoryError('FORBIDDEN', undefined, details)
  return new CategoryError('UNKNOWN', undefined, details)
}

export const categoriesApi: CategoriesRepository = {
  async listSummaries(): Promise<CategorySummary[]> {
    const { data } = await httpClient.get<CategoryResponseDto[]>('/v1/categories/admin')
    return data.map((item) => ({
      id: item.id,
      name: { ro: item.nameRo, ru: item.nameRu },
    }))
  },

  async list(filters?: CategoryListFilters): Promise<Category[]> {
    try {
      const { data } = await httpClient.get<CategoryResponseDto[]>('/v1/categories/admin', {
        params: toCategoryListParams(filters),
      })
      return data.map(mapCategory)
    } catch (error) {
      throw toCategoryError(error)
    }
  },

  async getById(id: string): Promise<Category> {
    try {
      const { data } = await httpClient.get<CategoryResponseDto>(`/v1/categories/admin/${id}`)
      return mapCategory(data)
    } catch (error) {
      throw toCategoryError(error)
    }
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    try {
      const { data } = await httpClient.post<CategoryResponseDto>(
        '/v1/categories/admin',
        toCreateCategoryDto(input),
      )
      return mapCategory(data)
    } catch (error) {
      throw toCategoryError(error)
    }
  },

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    try {
      const { data } = await httpClient.patch<CategoryResponseDto>(
        `/v1/categories/admin/${id}`,
        toUpdateCategoryDto(input),
      )
      return mapCategory(data)
    } catch (error) {
      throw toCategoryError(error)
    }
  },

  async replaceFaq(id: string, items: CategoryFaqItemInput[]): Promise<void> {
    try {
      await httpClient.put(`/v1/categories/admin/${id}/faq`, {
        items: items.map((item) => ({
          questionRo: item.question.ro,
          questionRu: item.question.ru,
          answerRo: item.answer.ro,
          answerRu: item.answer.ru,
        })),
      })
    } catch (error) {
      throw toCategoryError(error)
    }
  },

  async trash(id: string): Promise<void> {
    try {
      await httpClient.delete(`/v1/categories/admin/${id}`)
    } catch (error) {
      throw toCategoryError(error)
    }
  },

  async restore(id: string): Promise<Category> {
    try {
      const { data } = await httpClient.post<CategoryResponseDto>(
        `/v1/categories/admin/${id}/restore`,
      )
      return mapCategory(data)
    } catch (error) {
      throw toCategoryError(error)
    }
  },

  async permanentlyDelete(id: string, input?: PermanentlyDeleteCategoryInput): Promise<void> {
    try {
      await httpClient.delete(`/v1/categories/admin/${id}/permanent`, {
        data: input ?? {},
      })
    } catch (error) {
      throw toCategoryError(error)
    }
  },
}
