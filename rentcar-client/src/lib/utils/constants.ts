export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
} as const

export const ROUTES = {
  HOME: '/',
  ABOUT:'/about',
  MyCARS:'/my-cars',
  ADMIN_BOOKINGS: '/dashboard/bookings',
  ADMIN_CARS: '/dashboard/cars',
  ADMIN_REQUESTS:'/dashboard/requests',
  CREATE_CAR:'/create-car',
  ADMIN_USERS: '/dashboard/users',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CARS: '/cars',
  CAR_DETAILS: '/cars/:id',
  BOOKINGS: '/bookings',
  BOOKING_DETAILS: '/bookings/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  CHAT: '/chat',
  DASHBOARD: '/dashboard',
  PAYMENT: '/payment',
  CATEGORIES: '/categories',

  NOT_FOUND: '*',
} as const

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  ME: '/auth/me',
  
  CARS: '/cars',
  CAR_DETAILS: (slug: string) => `/cars/${slug}`,
  CAR_SEARCH: '/cars/search',
  
  BOOKINGS: '/bookings',
  BOOKING_DETAILS: (id: string) => `/bookings/${id}`,
  CREATE_BOOKING: '/bookings',
  CANCEL_BOOKING: (id: string) => `/bookings/${id}/cancel`,
  
  PAYMENTS: '/payments',
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  PAYMENT_HISTORY: '/payments/history',
  
  REVIEWS: '/reviews',
  CAR_REVIEWS: (carId: string) => `/reviews/car/${carId}`,
  CREATE_REVIEW: '/reviews',
  
  USERS: '/user',
  USER_PROFILE: (id: string) => `/user/${id}`,
  UPDATE_PROFILE: '/user/me',
  
  NOTIFICATIONS: '/notifications',
  MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
  MESSAGE_NOTIFICATIONS:['notifications','messages'],
  
  CHAT: '/chat',
  MESSAGES: '/chat/messages',
  CONVERSATIONS: '/chat/conversations',
  
  STATISTICS: '/statistics',
  DASHBOARD_STATS: '/statistics/dashboard',
  
  CATEGORIES: '/categories',
  CATEGORY_DETAILS: (id: string) => `/categories/${id}`,
} as const

export const CAR_CATEGORIES = [
  'Economy',
  'Compact',
  'Midsize',
  'Standard',
  'Fullsize',
  'Premium',
  'Luxury',
  'SUV',
  'Van',
  'Convertible',
  'Sports',
  'Electric',
] as const

export const CAR_FEATURES = [
  'Air Conditioning',
  'Bluetooth',
  'GPS Navigation',
  'Backup Camera',
  'Heated Seats',
  'Sunroof',
  'Leather Seats',
  'Cruise Control',
  'Parking Sensors',
  'USB Ports',
  'Apple CarPlay',
  'Android Auto',
] as const

export const TRANSMISSION_TYPES = ['Automatic', 'Manual'] as const

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'] as const

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  OWNER: 'owner',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGIN_ERROR: 'Invalid credentials',
  REGISTER_SUCCESS: 'Account created successfully!',
  REGISTER_ERROR: 'Failed to create account',
  LOGOUT_SUCCESS: 'Logged out successfully',
  BOOKING_SUCCESS: 'Booking created successfully!',
  BOOKING_ERROR: 'Failed to create booking',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  PAYMENT_ERROR: 'Payment failed',
  UPDATE_SUCCESS: 'Updated successfully!',
  UPDATE_ERROR: 'Failed to update',
  DELETE_SUCCESS: 'Deleted successfully!',
  DELETE_ERROR: 'Failed to delete',
} as const

export const QUERY_KEYS = {
  AUTH: ['auth'],
  USER: ['user'],
  CARS: ['cars'],
  PAYMENTS: ['payments'],
  CAR_DETAILS: (id: string) => ['cars', id],
  CATEGORIES: ['categories'],
  BOOKINGS: ['bookings'],
  BOOKING_DETAILS: (id: string) => ['bookings', id],
  REVIEWS: ['reviews'],
  CAR_REVIEWS: (carId: string) => ['reviews', 'car', carId],
  NOTIFICATIONS: ['notifications'],
  MESSAGE_NOTIFICATIONS:['notifications','messages'],
  NOTIFICATION_UNREAD: ['notifications', 'unread'],
  STATISTICS: ['statistics'],
  CHAT: ['chat'],
  MESSAGES: (conversationId: string) => ['messages', conversationId],
} as const