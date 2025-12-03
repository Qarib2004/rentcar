import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'
import type { ChatRoom, Message } from '@/types'
import type { SendMessageData } from '@/types/api.types'

export const getMyChatRooms = async (): Promise<ChatRoom[]> => {
  return apiClient.get(`${API_ENDPOINTS.CHAT}/rooms`)
}

export const getOrCreateChatRoom = async (bookingId: string): Promise<ChatRoom> => {
  return apiClient.get(`${API_ENDPOINTS.CHAT}/rooms/${bookingId}`)
}

export const getMessages = async (chatRoomId: string): Promise<Message[]> => {
  return apiClient.get(`${API_ENDPOINTS.CHAT}/rooms/${chatRoomId}/messages`)
}

export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  return apiClient.post(`${API_ENDPOINTS.MESSAGES}`, data)
}

export const markMessagesAsRead = async (chatRoomId: string): Promise<{ message: string }> => {
  return apiClient.patch(`${API_ENDPOINTS.CHAT}/rooms/${chatRoomId}/read`)
}