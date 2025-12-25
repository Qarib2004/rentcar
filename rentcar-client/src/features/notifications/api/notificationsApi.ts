import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'
import type { Notification } from '@/types'

interface NotificationsResponse {
  data: Notification[]
  meta: {
    total: number
    unreadCount: number
    page: number
    limit: number
    totalPages: number
  }
}

export const getNotifications = async (
  page: number = 1,
  limit: number = 10
): Promise<NotificationsResponse> => {
  return apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS}?page=${page}&limit=${limit}`)
}

export const getMessageNotifications = async (
  page: number = 1,
  limit: number = 10
): Promise<NotificationsResponse> => {
  return apiClient.get(`${API_ENDPOINTS.MESSAGE_NOTIFICATIONS}?page=${page}&limit=${limit}`)
}

export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  return apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/unread-count`)
}

export const getNotificationById = async (id: string): Promise<Notification> => {
  return apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`)
}

export const markAsRead = async (id: string): Promise<Notification> => {
  return apiClient.patch(API_ENDPOINTS.MARK_AS_READ(id))
}

export const markAllAsRead = async (): Promise<{ message: string }> => {
  return apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`)
}

export const deleteNotification = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`)
}