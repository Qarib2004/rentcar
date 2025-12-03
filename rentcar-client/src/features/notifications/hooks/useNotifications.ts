import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as notificationsApi from '../api/notificationsApi'
import { QUERY_KEYS } from '@/lib/utils/constants'

export function useNotifications(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS, page, limit],
    queryFn: () => notificationsApi.getNotifications(page, limit),
    refetchInterval: 30000, 
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [...QUERY_KEYS.NOTIFICATIONS, 'unread'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 15000, 
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS })
      toast.success('All notifications marked as read')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to mark notifications as read'
      toast.error(message)
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS })
      toast.success('Notification deleted')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete notification'
      toast.error(message)
    },
  })
}