import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/lib/utils/constants'

import RootLayout from '@/components/layout/RootLayout'

import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'

import Home from '@/pages/Home'
import { Cars } from '@/pages/Cars'
import { CarDetails } from '@/pages/CarDetails'
import { Bookings } from '@/pages/Bookings'
import { BookingDetails } from '@/pages/BookingDetails'
import { Profile } from '@/pages/Profile'
import { Settings } from '@/pages/Settings'
import { Chat } from '@/pages/Chat'
import { Dashboard } from '@/pages/Dashboard'
import { Payment } from '@/pages/Payment'
import Categories from '@/pages/Categories'

import { NotFound } from '@/pages/NotFound'

import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import MyCars from '@/pages/MyCars'
import CreateCar from '@/pages/CreateCar'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
      
          {
            path: ROUTES.LOGIN,
            element: <Login />,
          },
          {
            path: ROUTES.REGISTER,
            element: <Register />,
          },
          {
            path: ROUTES.FORGOT_PASSWORD,
            element: <ForgotPassword />,
          },
          {
            path: ROUTES.RESET_PASSWORD,
            element: <ResetPassword />,
          },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.HOME,
            element: <Home />,
          },
          {
            path: ROUTES.CREATE_CAR,
            element: <CreateCar />,
          },
          {
            path: ROUTES.MyCARS,
            element: <MyCars />,
          },
          {
            path: ROUTES.CARS,
            element: <Cars />,
          },
          {
            path: '/cars/:id',
            element: <CarDetails />,
          },
          {
            path: ROUTES.BOOKINGS,
            element: <Bookings />,
          },
          {
            path: '/bookings/:id',
            element: <BookingDetails />,
          },
          {
            path: ROUTES.PROFILE,
            element: <Profile />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <Settings />,
          },
          {
            path: ROUTES.CHAT,
            element: <Chat />,
          },
          {
            path: ROUTES.DASHBOARD,
            element: <Dashboard />,
          },
          {
            path: ROUTES.PAYMENT,
            element: <Payment />,
          },
          {
            path: ROUTES.CATEGORIES,
            element: <Categories />,
          },
        ],
      },

      {
        path: ROUTES.NOT_FOUND,
        element: <NotFound />,
      },
    ],
  },
])

export default router