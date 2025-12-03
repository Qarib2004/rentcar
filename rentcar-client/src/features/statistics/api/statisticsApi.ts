import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'

export interface DashboardStats {
  totalBookings: number
  activeBookings: number
  completedBookings: number
  totalRevenue: number
  totalCars: number
  availableCars: number
  totalUsers: number
  recentBookings: any[]
}

export interface BookingStats {
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  revenue: number
  revenueByMonth: Array<{
    month: string
    revenue: number
    bookings: number
  }>
  bookingsByStatus: Array<{
    status: string
    count: number
  }>
}

export interface CarStats {
  totalCars: number
  availableCars: number
  rentedCars: number
  maintenanceCars: number
  averageRating: number
  popularCars: Array<{
    id: string
    brand: string
    model: string
    bookingsCount: number
    revenue: number
  }>
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  usersByRole: Array<{
    role: string
    count: number
  }>
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiClient.get(`${API_ENDPOINTS.STATISTICS}/dashboard`)
}

export const getBookingStats = async (
  startDate?: string,
  endDate?: string
): Promise<BookingStats> => {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)
  
  return apiClient.get(`${API_ENDPOINTS.STATISTICS}/bookings?${params.toString()}`)
}

export const getCarStats = async (): Promise<CarStats> => {
  return apiClient.get(`${API_ENDPOINTS.STATISTICS}/cars`)
}

export const getUserStats = async (): Promise<UserStats> => {
  return apiClient.get(`${API_ENDPOINTS.STATISTICS}/users`)
}