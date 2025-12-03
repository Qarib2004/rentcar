// src/routes/PublicRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { ROUTES } from '@/lib/utils/constants'

interface LocationState {
  from?: {
    pathname: string
  }
}

export default function PublicRoute() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const state = location.state as LocationState

  if (isAuthenticated) {
    const from = state?.from?.pathname || ROUTES.HOME
    return <Navigate to={from} replace />
  }

  return <Outlet />
}