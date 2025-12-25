import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'
import type { Car, PaginatedResponse } from '@/types'
import type { CarsQueryParams } from '@/types/api.types'

export const getCars = async (params?: CarsQueryParams): Promise<PaginatedResponse<Car>> => {
  const queryParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)))
        } else {
          queryParams.append(key, String(value))
        }
      }
    })
  }
  
  return apiClient.get(`${API_ENDPOINTS.CARS}?${queryParams.toString()}`)
}

export const getCarById = async (slug: string): Promise<Car> => {
  return apiClient.get(API_ENDPOINTS.CAR_DETAILS(slug))
}

export const getMyCars = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Car>> => {
  return apiClient.get(`${API_ENDPOINTS.CARS}/my-cars?page=${page}&limit=${limit}`)
}

export const createCar = async (data: FormData): Promise<Car> => {
  return apiClient.post(API_ENDPOINTS.CARS, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateCar = async (id: string, data: FormData): Promise<Car> => {
  return apiClient.put(API_ENDPOINTS.CAR_DETAILS(id), data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteCarImage = async (id: string, imageUrl: string): Promise<{ message: string }> => {
  return apiClient.delete(`${API_ENDPOINTS.CAR_DETAILS(id)}/images`, {
    data: { imageUrl },
  })
}

export const updateCarStatus = async (id: string, status: string): Promise<Car> => {
  return apiClient.patch(`${API_ENDPOINTS.CAR_DETAILS(id)}/status`, { status })
}

export const deleteCar = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete(API_ENDPOINTS.CAR_DETAILS(id))
}

export const searchCars = async (query: string): Promise<Car[]> => {
  return apiClient.get(`${API_ENDPOINTS.CAR_SEARCH}?query=${query}`)
}