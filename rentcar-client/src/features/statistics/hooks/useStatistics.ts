import { useQuery } from '@tanstack/react-query'
import * as statisticsApi from '../api/statisticsApi'
import { QUERY_KEYS } from '@/lib/utils/constants'

export function useDashboardStats() {
  return useQuery({
    queryKey: [...QUERY_KEYS.STATISTICS, 'dashboard'],
    queryFn: statisticsApi.getDashboardStats,
  })
}

export function useBookingStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.STATISTICS, 'bookings', startDate, endDate],
    queryFn: () => statisticsApi.getBookingStats(startDate, endDate),
  })
}

export function useCarStats() {
  return useQuery({
    queryKey: [...QUERY_KEYS.STATISTICS, 'cars'],
    queryFn: statisticsApi.getCarStats,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: [...QUERY_KEYS.STATISTICS, 'users'],
    queryFn: statisticsApi.getUserStats,
  })
}