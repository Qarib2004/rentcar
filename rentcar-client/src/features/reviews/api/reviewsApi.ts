import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'
import type { Review, PaginatedResponse } from '@/types'
import type { ReviewsQueryParams, CreateReviewData } from '@/types/api.types'

export const getReviews = async (params?: ReviewsQueryParams): Promise<PaginatedResponse<Review>> => {
  const queryParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  
  return apiClient.get(`${API_ENDPOINTS.REVIEWS}?${queryParams.toString()}`)
}

export const getCarReviews = async (
  carId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Review>> => {
  return apiClient.get(`${API_ENDPOINTS.REVIEWS}?carId=${carId}&page=${page}&limit=${limit}`)
}

export const getReviewById = async (id: string): Promise<Review> => {
  return apiClient.get(`${API_ENDPOINTS.REVIEWS}/${id}`)
}

export const createReview = async (data: CreateReviewData): Promise<Review> => {
  return apiClient.post(API_ENDPOINTS.CREATE_REVIEW, data)
}

export const updateReview = async (
  id: string,
  data: { rating?: number; comment?: string }
): Promise<Review> => {
  return apiClient.patch(`${API_ENDPOINTS.REVIEWS}/${id}`, data)
}

export const deleteReview = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete(`${API_ENDPOINTS.REVIEWS}/${id}`)
}