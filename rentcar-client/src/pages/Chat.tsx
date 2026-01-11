import { useState, useEffect, useRef } from 'react'
import Header from '@/components/layout/Header'
import { useChatRooms, useMessages, useSendMessage, useMarkAsRead } from '@/features/chat/hooks/useChat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { MessageCircle, Send } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { format } from 'date-fns'
import type { ChatRoom, Message } from '@/types'
import { Helmet } from 'react-helmet-async'

export function Chat() {
  const { user } = useAuthStore()
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: chatRooms, isLoading: roomsLoading } = useChatRooms()
  const { data: messages, isLoading: messagesLoading } = useMessages(selectedChatRoom || '')
  const { mutate: sendMessage, isPending: isSending } = useSendMessage()
  const { mutate: markAsRead } = useMarkAsRead()

  useEffect(() => {
    if (chatRooms && chatRooms.length > 0 && !selectedChatRoom) {
      setSelectedChatRoom(chatRooms[0].id)
    }
  }, [chatRooms, selectedChatRoom])

  useEffect(() => {
    if (selectedChatRoom) {
      markAsRead(selectedChatRoom)
    }
  }, [selectedChatRoom, markAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim() || !selectedChatRoom) return

    sendMessage(
      {
        chatRoomId: selectedChatRoom,
        content: messageText.trim(),
      },
      {
        onSuccess: () => {
          setMessageText('')
        },
      }
    )
  }

  const getOtherUser = (chatRoom: ChatRoom) => {
    if (!user) return null
    
    if (chatRoom.booking) {
      if (chatRoom.booking?.userId === user.id) {
        return chatRoom.booking?.car?.owner
      }
      return chatRoom.booking?.user
    }
    
    if (chatRoom.user1?.id === user.id) {
      return chatRoom.user2
    }
    return chatRoom.user1
  }

  const getLastMessage = (chatRoom: ChatRoom) => {
    return chatRoom.messages?.[0]
  }

  const selectedRoom = chatRooms?.find(room => room.id === selectedChatRoom)

  return (
    <>
      <Helmet>
        <title>Chat - RentCar</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {roomsLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : chatRooms && chatRooms.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {chatRooms.map((room: ChatRoom) => {
                      const otherUser = getOtherUser(room)
                      const lastMessage = getLastMessage(room)
                      const unreadCount = room._count?.messages || 0

                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedChatRoom(room.id)}
                          className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left ${
                            selectedChatRoom === room.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <Avatar className="w-12 h-12 shrink-0">
                            <AvatarImage src={otherUser?.avatar || undefined} />
                            <AvatarFallback>
                              {otherUser ? getInitials(`${otherUser.firstName} ${otherUser.lastName}`) : '?'}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {otherUser?.firstName} {otherUser?.lastName}
                                </p>
                                {lastMessage && (
                                  <p className="text-sm text-gray-600 truncate">
                                    {lastMessage.content}
                                  </p>
                                )}
                              </div>
                              {unreadCount > 0 && (
                                <Badge variant="default" className="ml-2">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            {lastMessage && (
                              <p className="text-xs text-gray-400 mt-1">
                                {format(new Date(lastMessage.createdAt), 'MMM dd, HH:mm')}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8">
                    <EmptyState
                      icon={MessageCircle}
                      title="No conversations yet"
                      description="Start chatting with car owners or clients"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 flex flex-col">
              {selectedRoom ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={getOtherUser(selectedRoom)?.avatar || undefined} />
                        <AvatarFallback>
                          {getOtherUser(selectedRoom) 
                            ? getInitials(`${getOtherUser(selectedRoom)!.firstName} ${getOtherUser(selectedRoom)!.lastName}`)
                            : '?'
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {getOtherUser(selectedRoom)?.firstName} {getOtherUser(selectedRoom)?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedRoom.booking?.car?.brand} {selectedRoom.booking?.car?.model}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className={`h-16 w-3/4 ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                        ))}
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <>
                        {messages.map((message: Message) => {
                          const isMe = message.senderId === user?.id

                          return (
                            <div
                              key={message.id}
                              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                                {!isMe && (
                                  <Avatar className="w-8 h-8 shrink-0">
                                    <AvatarImage src={message.sender?.avatar || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {message.sender 
                                        ? getInitials(`${message.sender.firstName} ${message.sender.lastName}`)
                                        : '?'
                                      }
                                    </AvatarFallback>
                                  </Avatar>
                                )}

                                <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                  <div
                                    className={`rounded-lg px-4 py-2 ${
                                      isMe
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-900'
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                  <p className="text-xs text-gray-400 px-1">
                                    {format(new Date(message.createdAt), 'HH:mm')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </CardContent>

                  <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isSending}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={isSending || !messageText.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <EmptyState
                    icon={MessageCircle}
                    title="Select a conversation"
                    description="Choose a conversation from the list to start messaging"
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
