import { apiClient } from '@/lib/api/axios'
import type { Payment, PaginatedResponse } from '@/types'

interface CreateCheckoutSessionData {
  bookingId: string
  successUrl?: string
  cancelUrl?: string
  paymentMethod?: string
}

interface CheckoutSessionResponse {
  sessionId: string
  sessionUrl: string
  payment: Payment
}

export const createCheckoutSession = async (data: CreateCheckoutSessionData) => {
    const response = await apiClient.post<CheckoutSessionResponse>(
      '/payments/create-checkout-session',
      data
    )
    return response 
  }

export const getMyPayments = async (page: number = 1, limit: number = 10) => {
  const { data } = await apiClient.get<PaginatedResponse<Payment>>('/payments/my-payments', {
    params: { page, limit },
  })
  return data
}

export const getAllPayments = async (page: number = 1, limit: number = 10) => {
  const { data } = await apiClient.get<PaginatedResponse<Payment>>('/payments', {
    params: { page, limit },
  })
  return data
}

export const getPaymentById = async (id: string) => {
  const  data  = await apiClient.get<Payment>(`/payments/${id}`)
  return data
}

export const refundPayment = async (paymentId: string) => {
  const response = await apiClient.post(`/payments/${paymentId}/refund`)
  return response.data
}