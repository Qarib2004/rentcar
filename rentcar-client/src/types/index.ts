export enum UserRole {
  CLIENT = 'CLIENT',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: UserRole
  isVerified: boolean
  isActive: boolean
  licenseNumber?: string
  licenseExpiry?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  createdAt: string
  updatedAt: string
  _count?: {
    cars: number
  }
}

export interface Car {
  id: string
  ownerId: string
  categoryId: string
  brand: string
  model: string
  year: number
  color: string
  licensePlate: string
  vin?: string
  transmission: TransmissionType
  fuelType: FuelType
  seats: number
  doors: number
  engineCapacity?: number
  horsePower?: number
  mileage: number
  pricePerDay: number
  pricePerHour?: number
  deposit: number
  description?: string
  images: string[]
  location: string
  latitude?: number
  longitude?: number
  features: string[]
  status: CarStatus
  isActive: boolean
  averageRating: number
  totalReviews: number
  createdAt: string
  updatedAt: string
  owner?: User
  category?: Category
  reviews?: Review[]
  _count?: {
    bookings: number
    reviews: number
  }
}

export interface CarFilters {
  categoryId?: string
  transmission?: TransmissionType
  fuelType?: FuelType
  minPrice?: number
  maxPrice?: number
  minSeats?: number
  features?: string[]
  location?: string
  startDate?: string
  endDate?: string
  minRating?: number
}

export interface CreateCarData {
  categoryId: string
  brand: string
  model: string
  year: number
  color: string
  licensePlate: string
  vin?: string
  transmission: TransmissionType
  fuelType: FuelType
  seats: number
  doors: number
  engineCapacity?: number
  horsePower?: number
  mileage: number
  pricePerDay: number
  pricePerHour?: number
  deposit: number
  description?: string
  images: string[]
  location: string
  latitude?: number
  longitude?: number
  features: string[]
}

export interface Booking {
  id: string
  userId: string
  carId: string
  startDate: string
  endDate: string
  pricePerDay: number
  totalDays: number
  totalPrice: number
  deposit: number
  status: BookingStatus
  notes?: string
  pickupLocation?: string
  returnLocation?: string
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  cancelledAt?: string
  completedAt?: string
  user?: User
  car?: Car
  payment?: Payment
  review?: Review
}

export interface CreateBookingData {
  carId: string
  startDate: string
  endDate: string
  notes?: string
  pickupLocation?: string
  returnLocation?: string
}

export interface Payment {
  id: string
  bookingId: string
  userId: string
  stripePaymentId?: string
  stripeSessionId?: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod?: string
  description?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  refundedAt?: string
  booking?: Booking
  user?: User
}

export interface CreatePaymentIntentData {
  bookingId: string
  amount: number
}

export interface Review {
  id: string
  bookingId: string
  userId: string
  carId: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
  user?: User
  car?: Car
}

export interface CreateReviewData {
  bookingId: string
  carId: string
  rating: number
  comment?: string
}

export interface ChatRoom {
  id: string
  bookingId: string
  createdAt: string
  updatedAt: string
  booking?: Booking
  messages?: Message[]
  _count?: {
    messages: number
  }
}

export interface Message {
  id: string
  chatRoomId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
  readAt?: string
  sender?: User
}

export interface SendMessageData {
  chatRoomId: string
  content: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  data?: any
  isRead: boolean
  createdAt: string
  readAt?: string
}

export interface DashboardStats {
  totalBookings: number
  activeBookings: number
  completedBookings: number
  cancelledBookings: number
  totalRevenue: number
  totalCars: number
  availableCars: number
  totalUsers: number
  recentBookings: Booking[]
  popularCars: Car[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}