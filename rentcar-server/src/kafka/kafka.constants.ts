export const KAFKA_TOPICS = {
  BOOKINGS: {
    CREATED: 'bookings.created',
    CONFIRMED: 'bookings.confirmed',
    CANCELLED: 'bookings.cancelled',
    COMPLETED: 'bookings.completed',
  },
  PAYMENTS: {
    COMPLETED: 'payments.completed',
    FAILED: 'payments.failed',
  },
  NOTIFICATIONS: {
    SEND: 'notifications.send',
  },
  CHAT: {
    MESSAGES: 'chat.messages',
  },
} as const;
