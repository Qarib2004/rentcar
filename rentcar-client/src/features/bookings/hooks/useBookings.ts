import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import * as bookingsApi from '../api/bookingsApi'
import { QUERY_KEYS, TOAST_MESSAGES } from '@/lib/utils/constants'
import type { BookingsQueryParams } from '@/types/api.types'

export function useCheckAvailability(carId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['availability', carId, startDate, endDate],
    queryFn: () => bookingsApi.checkCarAvailability(carId, startDate!, endDate!),
    enabled: !!(carId && startDate && endDate),
  })
}

export function useMyBookings(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, 'my-bookings', page, limit],
    queryFn: () => bookingsApi.getMyBookings(page, limit),
  })
}

export function useOwnerBookings(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, 'owner-bookings', page, limit],
    queryFn: () => bookingsApi.getOwnerBookings(page, limit),
  })
}

export function useAllBookings(params?: BookingsQueryParams) {
  const queryKeyParams = params ? { ...params } : {}

  return useQuery({
    queryKey: [...QUERY_KEYS.BOOKINGS, 'all', queryKeyParams],
    queryFn: () => bookingsApi.getAllBookings(params),
  })
}




export function useBookingDetails(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BOOKING_DETAILS(id),
    queryFn: () => bookingsApi.getBookingById(id),
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: bookingsApi.CreateBookingData) => bookingsApi.createBooking(data),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS })
      toast.success(TOAST_MESSAGES.BOOKING_SUCCESS)
      // navigate(`/bookings/${booking.id}`)
      navigate(`/payment/${booking.id}`)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || TOAST_MESSAGES.BOOKING_ERROR
      toast.error(message)
    },
  })
}

export function useConfirmBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookingsApi.confirmBooking(id),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING_DETAILS(booking.id) })
      toast.success('Booking confirmed successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to confirm booking'
      toast.error(message)
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancelBooking(id),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING_DETAILS(booking.id) })
      toast.success('Booking cancelled successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to cancel booking'
      toast.error(message)
    },
  })
}

export function useCompleteBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookingsApi.completeBooking(id),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING_DETAILS(booking.id) })
      toast.success('Booking completed successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to complete booking'
      toast.error(message)
    },
  })
}