import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'
import type { Booking, PaginatedResponse } from '@/types'
import type { BookingsQueryParams } from '@/types/api.types'

export interface CreateBookingData {
  carId: string
  startDate: string
  endDate: string
  notes?: string
  pickupLocation?: string
  returnLocation?: string
}

export const checkCarAvailability = async (
  carId: string,
  startDate: string,
  endDate: string
): Promise<{ isAvailable: boolean; conflictingBookings?: Booking[] }> => {
  return apiClient.get(
    `${API_ENDPOINTS.BOOKINGS}/check-availability/${carId}?startDate=${startDate}&endDate=${endDate}`
  )
}

export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  return apiClient.post(API_ENDPOINTS.CREATE_BOOKING, data)
  console.log('Creating booking with data:', data)
}

export const getAllBookings = async (params?: BookingsQueryParams): Promise<PaginatedResponse<Booking>> => {
  const queryParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  
  return apiClient.get(`${API_ENDPOINTS.BOOKINGS}?${queryParams.toString()}`)
}

export const getMyBookings = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Booking>> => {
  return apiClient.get(`${API_ENDPOINTS.BOOKINGS}/my-bookings?page=${page}&limit=${limit}`)
}

export const getOwnerBookings = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Booking>> => {
  return apiClient.get(`${API_ENDPOINTS.BOOKINGS}/owner-bookings?page=${page}&limit=${limit}`)
}

export const getBookingById = async (id: string): Promise<Booking> => {
  return apiClient.get(API_ENDPOINTS.BOOKING_DETAILS(id))
}

export const confirmBooking = async (id: string): Promise<Booking> => {
  return apiClient.patch(`${API_ENDPOINTS.BOOKING_DETAILS(id)}/confirm`)
}

export const cancelBooking = async (id: string): Promise<Booking> => {
  return apiClient.patch(API_ENDPOINTS.CANCEL_BOOKING(id))
}

export const completeBooking = async (id: string): Promise<Booking> => {
  return apiClient.patch(`${API_ENDPOINTS.BOOKING_DETAILS(id)}/complete`)
}