import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as paymentsApi from '../api/paymentsApi'
import { QUERY_KEYS } from '@/lib/utils/constants'

export function useCreatePayment() {
  return useMutation({
    mutationFn: (data: { bookingId: string; successUrl?: string; cancelUrl?: string }) =>
      paymentsApi.createCheckoutSession(data),
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create payment'
      toast.error(message)
    },
  })
}

export function useMyPayments(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS, 'my', page, limit],
    queryFn: () => paymentsApi.getMyPayments(page, limit),
  })
}

export function usePaymentDetails(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS, id],
    queryFn: () => paymentsApi.getPaymentById(id),
    enabled: !!id,
  })
}

export function useAllPayments(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PAYMENTS, 'all', page, limit],
    queryFn: () => paymentsApi.getAllPayments(page, limit),
  })
}

export function useRefundPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.refundPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS })
      toast.success('Payment refunded successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to refund payment'
      toast.error(message)
    },
  })
}