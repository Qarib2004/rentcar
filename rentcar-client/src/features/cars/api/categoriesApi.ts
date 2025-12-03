import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'
import type { Category } from '@/types'

export const getCategories = async (): Promise<Category[]> => {
  return apiClient.get(API_ENDPOINTS.CATEGORIES)
}

export const getCategoryById = async (id: string): Promise<Category> => {
  return apiClient.get(API_ENDPOINTS.CATEGORY_DETAILS(id))
}

export const createCategory = async (data: {
  name: string
  slug: string
  description?: string
  icon?: string
}): Promise<Category> => {
  return apiClient.post(API_ENDPOINTS.CATEGORIES, data)
}

export const updateCategory = async (
  id: string,
  data: {
    name?: string
    slug?: string
    description?: string
    icon?: string
  }
): Promise<Category> => {
  return apiClient.put(API_ENDPOINTS.CATEGORY_DETAILS(id), data)
}

export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete(API_ENDPOINTS.CATEGORY_DETAILS(id))
}