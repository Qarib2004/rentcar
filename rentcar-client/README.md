# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


src/
├── assets/                    # Статические файлы (изображения, иконки)
│   ├── images/
│   └── icons/
│
├── components/                # Переиспользуемые компоненты
│   ├── ui/                   # UI компоненты (shadcn-style)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── radio-group.tsx
│   │   ├── tabs.tsx
│   │   ├── avatar.tsx
│   │   ├── popover.tsx
│   │   ├── label.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   └── calendar.tsx
│   │
│   ├── layout/               # Компоненты разметки
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navigation.tsx
│   │   └── Container.tsx
│   │
│   └── common/               # Общие компоненты
│       ├── ErrorBoundary.tsx
│       ├── Loading.tsx
│       ├── EmptyState.tsx
│       └── ProtectedRoute.tsx
│
├── features/                  # Модули по доменам (зеркалируют бэкенд)
│   │
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   └── ResetPasswordForm.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   ├── useRegister.ts
│   │   │   └── useLogout.ts
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── store/
│   │       └── authStore.ts
│   │
│   ├── bookings/
│   │   ├── components/
│   │   │   ├── BookingList.tsx
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingDetails.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   └── BookingCalendar.tsx
│   │   ├── hooks/
│   │   │   ├── useBookings.ts
│   │   │   ├── useCreateBooking.ts
│   │   │   ├── useUpdateBooking.ts
│   │   │   └── useCancelBooking.ts
│   │   ├── api/
│   │   │   └── bookingsApi.ts
│   │   ├── types/
│   │   │   └── booking.types.ts
│   │   └── utils/
│   │       └── bookingHelpers.ts
│   │
│   ├── cars/
│   │   ├── components/
│   │   │   ├── CarList.tsx
│   │   │   ├── CarCard.tsx
│   │   │   ├── CarDetails.tsx
│   │   │   ├── CarFilters.tsx
│   │   │   ├── CarSearch.tsx
│   │   │   └── CarGallery.tsx
│   │   ├── hooks/
│   │   │   ├── useCars.ts
│   │   │   ├── useCarDetails.ts
│   │   │   └── useCarFilters.ts
│   │   ├── api/
│   │   │   └── carsApi.ts
│   │   ├── types/
│   │   │   └── car.types.ts
│   │   └── utils/
│   │       └── carHelpers.ts
│   │
│   ├── chat/
│   │   ├── components/
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ChatHeader.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useSocket.ts
│   │   ├── api/
│   │   │   └── chatApi.ts
│   │   └── types/
│   │       └── chat.types.ts
│   │
│   ├── payments/
│   │   ├── components/
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── PaymentMethod.tsx
│   │   │   ├── PaymentHistory.tsx
│   │   │   └── StripeCheckout.tsx
│   │   ├── hooks/
│   │   │   ├── usePayment.ts
│   │   │   └── useStripe.ts
│   │   ├── api/
│   │   │   └── paymentsApi.ts
│   │   └── types/
│   │       └── payment.types.ts
│   │
│   ├── reviews/
│   │   ├── components/
│   │   │   ├── ReviewList.tsx
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   └── RatingStars.tsx
│   │   ├── hooks/
│   │   │   ├── useReviews.ts
│   │   │   └── useCreateReview.ts
│   │   ├── api/
│   │   │   └── reviewsApi.ts
│   │   └── types/
│   │       └── review.types.ts
│   │
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserProfile.tsx
│   │   │   ├── UserSettings.tsx
│   │   │   ├── UserAvatar.tsx
│   │   │   └── EditProfileForm.tsx
│   │   ├── hooks/
│   │   │   ├── useUser.ts
│   │   │   └── useUpdateProfile.ts
│   │   ├── api/
│   │   │   └── usersApi.ts
│   │   └── types/
│   │       └── user.types.ts
│   │
│   ├── notifications/
│   │   ├── components/
│   │   │   ├── NotificationList.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   └── NotificationBell.tsx
│   │   ├── hooks/
│   │   │   ├── useNotifications.ts
│   │   │   └── useMarkAsRead.ts
│   │   ├── api/
│   │   │   └── notificationsApi.ts
│   │   └── types/
│   │       └── notification.types.ts
│   │
│   └── statistics/
│       ├── components/
│       │   ├── Dashboard.tsx
│       │   ├── StatsCard.tsx
│       │   ├── Charts.tsx
│       │   └── RevenueChart.tsx
│       ├── hooks/
│       │   └── useStatistics.ts
│       ├── api/
│       │   └── statisticsApi.ts
│       └── types/
│           └── statistics.types.ts
│
├── lib/                       # Утилиты и конфигурации
│   ├── api/
│   │   ├── axios.ts          # Настроенный axios instance
│   │   ├── queryClient.ts    # React Query client
│   │   └── socket.ts         # Socket.io client
│   ├── utils/
│   │   ├── cn.ts             # classnames merger
│   │   ├── format.ts         # Форматирование (даты, цены)
│   │   ├── validation.ts     # Валидация
│   │   └── constants.ts      # Константы
│   └── hooks/
│       ├── useDebounce.ts
│       ├── useLocalStorage.ts
│       └── useMediaQuery.ts
│
├── pages/                     # Страницы
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── Cars.tsx
│   ├── CarDetails.tsx
│   ├── Bookings.tsx
│   ├── BookingDetails.tsx
│   ├── Payment.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   ├── Chat.tsx
│   ├── Dashboard.tsx
│   ├── NotFound.tsx
│   └── Unauthorized.tsx
│
├── routes/                    # Конфигурация маршрутов
│   ├── index.tsx
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
│
├── store/                     # Глобальное состояние (Zustand)
│   ├── useAuthStore.ts
│   ├── useCartStore.ts
│   ├── useThemeStore.ts
│   └── useNotificationStore.ts
│
├── types/                     # Глобальные типы
│   ├── index.ts
│   ├── api.types.ts
│   └── common.types.ts
│
├── styles/                    # Стили
│   ├── index.css
│   └── theme.css
│
├── App.tsx                    # Главный компонент
├── main.tsx                   # Точка входа
└── vite-env.d.ts             # Типы Vite