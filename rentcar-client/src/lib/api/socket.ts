import { io, Socket } from 'socket.io-client'
import Cookies from 'js-cookie'
import { WS_URL, STORAGE_KEYS } from '@/lib/utils/constants'

class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN)

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    })

    this.setupEventListeners()

    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      
      if (reason === 'io server disconnect') {
        this.socket?.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Обработчики событий для чата
    this.socket.on('message', (data) => {
      console.log('📨 New message:', data)
    })

    this.socket.on('notification', (data) => {
      console.log('New notification:', data)
    })

    this.socket.on('booking_update', (data) => {
      console.log('Booking update:', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
      console.log(' Socket disconnected manually')
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn(' Socket not connected. Attempting to reconnect...')
      this.connect()
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off(event, callback)
    } else {
      this.socket?.off(event)
    }
  }

  reconnectWithToken(token: string) {
    this.disconnect()
    Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, token)
    this.connect()
  }
}

export const socketClient = new SocketClient()

export const useSocket = () => {
  return socketClient
}

export default socketClient