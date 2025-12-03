
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CarsQueryParams extends PaginationParams {
  categoryId?: string
  transmission?: string
  fuelType?: string
  minPrice?: number
  maxPrice?: number
  minSeats?: number
  maxSeats?: number
  features?: string[]
  location?: string
  startDate?: string
  endDate?: string
  minRating?: number
  search?: string
  status?: string
}

export interface BookingsQueryParams extends PaginationParams {
  userId?: string
  carId?: string
  status?: string
  startDate?: string
  endDate?: string
}

export interface ReviewsQueryParams extends PaginationParams {
  carId?: string
  userId?: string
  minRating?: number
  maxRating?: number
}

export interface NotificationsQueryParams extends PaginationParams {
  isRead?: boolean
  type?: string
}

export interface MessagesQueryParams extends PaginationParams {
  chatRoomId: string
}

export interface CreateReviewData {
  bookingId: string
  carId: string
  rating: number
  comment?: string
}

export interface SendMessageData {
  chatRoomId: string
  content: string
}
export interface UpdateUserProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  licenseNumber?: string
  licenseExpiry?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface UpdateCarData {
  categoryId?: string
  brand?: string
  model?: string
  year?: number
  color?: string
  transmission?: string
  fuelType?: string
  seats?: number
  doors?: number
  engineCapacity?: number
  horsePower?: number
  mileage?: number
  pricePerDay?: number
  pricePerHour?: number
  deposit?: number
  description?: string
  images?: string[]
  location?: string
  latitude?: number
  longitude?: number
  features?: string[]
  status?: string
  isActive?: boolean
}

export interface UpdateBookingData {
  status?: string
  notes?: string
  pickupLocation?: string
  returnLocation?: string
}

export interface CarAvailabilityParams {
  carId: string
  startDate: string
  endDate: string
}

export interface CarAvailabilityResponse {
  isAvailable: boolean
  conflictingBookings?: Array<{
    startDate: string
    endDate: string
  }>
}

export interface UploadResponse {
  url: string
  publicId: string
  format: string
  width?: number
  height?: number
  bytes: number
}

export interface MultipleUploadResponse {
  urls: string[]
  files: UploadResponse[]
}

export interface SearchParams {
  query: string
  type?: 'cars' | 'users' | 'bookings'
  limit?: number
}

export interface SearchResult {
  cars?: Array<{
    id: string
    brand: string
    model: string
    year: number
    pricePerDay: number
    images: string[]
  }>
  total: number
}

export interface RevenueByMonthData {
  month: string
  revenue: number
}

export interface BookingsByStatusData {
  status: string
  count: number
}

export interface PopularCarsData {
  carId: string
  brand: string
  model: string
  bookingsCount: number
  revenue: number
}

export interface UserActivityData {
  date: string
  newUsers: number
  activeUsers: number
}

export interface StatisticsFilters {
  startDate?: string
  endDate?: string
  userId?: string
  carId?: string
}

export interface SocketMessage {
  event: string
  data: any
  timestamp: string
}

export interface ChatMessageEvent {
  chatRoomId: string
  message: {
    id: string
    senderId: string
    content: string
    createdAt: string
  }
}

export interface NotificationEvent {
  userId: string
  notification: {
    id: string
    title: string
    message: string
    type: string
    createdAt: string
  }
}

export interface BookingUpdateEvent {
  bookingId: string
  status: string
  updatedAt: string
}