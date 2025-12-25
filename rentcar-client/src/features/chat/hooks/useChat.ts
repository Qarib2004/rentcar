import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as chatApi from '../api/chatApi'
import { QUERY_KEYS } from '@/lib/utils/constants'
import type { SendMessageData } from '@/types/api.types'

export function useChatRooms() {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT,
    queryFn: chatApi.getMyChatRooms,
  })
}


export function useCreateChatRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { recipientId: string }) => chatApi.createChatRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT })
      toast.success('Chat room created')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to create chat room'
      toast.error(errorMessage)
    },
  })
}

export function useChatRoom(bookingId: string) {
  return useQuery({
    queryKey: ['chatRoom', bookingId],
    queryFn: () => chatApi.getOrCreateChatRoom(bookingId),
    enabled: !!bookingId,
  })
}

export function useMessages(chatRoomId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MESSAGES(chatRoomId),
    queryFn: () => chatApi.getMessages(chatRoomId),
    enabled: !!chatRoomId,
    refetchInterval: 5000, 
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageData) => chatApi.sendMessage(data),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES(message.chatRoomId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT })
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to send message'
      toast.error(errorMessage)
    },
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatRoomId: string) => chatApi.markMessagesAsRead(chatRoomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT })
    },
  })
}