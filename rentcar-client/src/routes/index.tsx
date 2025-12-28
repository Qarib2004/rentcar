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
import Categories from '@/pages/Categories'

import { NotFound } from '@/pages/NotFound'

import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import MyCars from '@/pages/MyCars'
import CreateCar from '@/pages/CreateCar'
import CarsAdmin from '@/pages/CarsAdmin'
import UsersAdmin from '@/pages/UsersAdmin'
import Payment from '@/pages/Payments'
import BookingsAdmin from '@/pages/BookingsAdmin'
import About from '@/pages/About'
import OwnerRequests from '@/features/owner-requests/components/OwnerRequests'
import VerifyEmail from '@/pages/VerifyEmail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: ROUTES.HOME,
        element: <Home />,
      },
      {
        path: ROUTES.ABOUT,
        element: <About />,
      },
      {
        path: ROUTES.VERIFY_EMAIL,
        element: <VerifyEmail />,
      },
      {
        path: ROUTES.CARS,
        element: <Cars />,
      },
      {
        path: '/cars/:slug',
        element: <CarDetails />,
      },
      {
        path: ROUTES.RESET_PASSWORD, 
        element: <ResetPassword />,
      },

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
          // {
          //   path: ROUTES.RESET_PASSWORD,
          //   element: <ResetPassword />,
          // },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.CREATE_CAR,
            element: <CreateCar />,
          },
          {
            path: ROUTES.ADMIN_USERS,
            element: <UsersAdmin />,
          },
          {
            path: ROUTES.ADMIN_CARS,
            element: <CarsAdmin />,
          },
          {
            path: ROUTES.MyCARS,
            element: <MyCars />,
          },
          {
            path: ROUTES.BOOKINGS,
            element: <Bookings />,
          },
          {
            path: ROUTES.ADMIN_BOOKINGS,
            element: <BookingsAdmin />,
          },
          {
            path: '/bookings/:id',
            element: <BookingDetails />,
          },
          {
            path: '/payment/:id',
            element: <Payment />,
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
          {
            path:ROUTES.ADMIN_REQUESTS,
            element:<OwnerRequests/>
          }
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