import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import Header from './Header'
import { ROUTES } from '@/lib/utils/constants'

export default function RootLayout() {
  const { pathname } = useLocation()

  const hideHeaderRoutes:string[] = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.DASHBOARD,
    ROUTES.ADMIN_BOOKINGS,
    ROUTES.ADMIN_CARS,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_REQUESTS
  ]

  const hideHeader = hideHeaderRoutes.includes(pathname)

  return (
    <>
      {!hideHeader && <Header />}
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}