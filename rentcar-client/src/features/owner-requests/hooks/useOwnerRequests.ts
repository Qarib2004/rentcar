import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as ownerRequestsApi from '../api/ownerRequestsApi'

export function useMyOwnerRequest() {
  return useQuery({
    queryKey: ['owner-request', 'my'],
    queryFn: ownerRequestsApi.getMyRequest,
  })
}

export function useCreateOwnerRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ownerRequestsApi.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-request'] })
      toast.success('Request submitted successfully! We will review it soon.')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit request')
    },
  })
}

export function useCancelOwnerRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ownerRequestsApi.cancelRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-request'] })
      toast.success('Request cancelled successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel request')
    },
  })
}

export function useOwnerRequests(status?: string) {
  return useQuery({
    queryKey: ['owner-requests', status || 'all'],
    queryFn: async () => {
      const data = await ownerRequestsApi.getAllRequests(status);
      return data ?? [];
    }
  });
}
export function useReviewOwnerRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ownerRequestsApi.reviewRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-requests'] })
      toast.success('Request reviewed successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to review request')
    },
  })
}