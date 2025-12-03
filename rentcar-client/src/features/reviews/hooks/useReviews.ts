import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as reviewsApi from '../api/reviewsApi'
import { QUERY_KEYS } from '@/lib/utils/constants'
import type { ReviewsQueryParams, CreateReviewData } from '@/types/api.types'

export function useReviews(params?: ReviewsQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.REVIEWS, params],
    queryFn: () => reviewsApi.getReviews(params),
  })
}

export function useCarReviews(carId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.CAR_REVIEWS(carId),
    queryFn: () => reviewsApi.getCarReviews(carId, page, limit),
    enabled: !!carId,
  })
}

export function useReviewDetails(id: string) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewsApi.getReviewById(id),
    enabled: !!id,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewsApi.createReview(data),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAR_REVIEWS(review.carId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAR_DETAILS(review.carId) })
      toast.success('Review submitted successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to submit review'
      toast.error(message)
    },
  })
}

export function useUpdateReview(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { rating?: number; comment?: string }) => 
      reviewsApi.updateReview(id, data),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAR_REVIEWS(review.carId) })
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      toast.success('Review updated successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update review'
      toast.error(message)
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS })
      toast.success('Review deleted successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete review'
      toast.error(message)
    },
  })
}