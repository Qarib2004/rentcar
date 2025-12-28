import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import * as authApi from '../api/authApi'
import { useAuthStore } from '@/store/useAuthStore'
import { QUERY_KEYS, ROUTES, TOAST_MESSAGES } from '@/lib/utils/constants'
import type { LoginCredentials, RegisterData, User } from '@/types'
import type { ForgotPasswordData, ResetPasswordData } from '@/types/api.types'
import { socketClient } from '@/lib/api/socket'
import { trackEvent, logError } from '@/lib/analytics'

import { useEffect } from 'react'
import queryClient from '@/lib/api/queryClient'





export const useCurrentUser = () => {
  const { setUser, setLoading } = useAuthStore()
  const query = useQuery({
    queryKey: QUERY_KEYS.AUTH,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: true,  
  })

  useEffect(() => {

    if (query.isLoading) {
      setLoading(true)
    }

    if (query.data) {
      setUser(query.data)
      setLoading(false)
    }
  }, [query.data, setUser, setLoading])

  useEffect(() => {
    if (query.isError) {
      setUser(null)
      setLoading(false)
    }
  }, [query.isError, setUser, setLoading])

  return query
}

export const useRegister = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      login(response.user, response.accessToken, response.refreshToken)
      toast.success(TOAST_MESSAGES.REGISTER_SUCCESS)
      navigate(ROUTES.HOME)
      
      socketClient.connect()
      trackEvent('auth_register_success', { userId: response.user.id })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || TOAST_MESSAGES.REGISTER_ERROR
      toast.error(message)
      logError(error, { action: 'auth_register' })
    },
  })
}

export const useLogin = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response) => {
      login(response.user, response.accessToken, response.refreshToken)
      toast.success(TOAST_MESSAGES.LOGIN_SUCCESS)
      
      queryClient.invalidateQueries()
      
      socketClient.connect()
      
      navigate(ROUTES.HOME)
      trackEvent('auth_login_success', { userId: response.user.id })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || TOAST_MESSAGES.LOGIN_ERROR
      toast.error(message)
      logError(error, { action: 'auth_login' })
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
      toast.success(TOAST_MESSAGES.LOGOUT_SUCCESS)
      
      queryClient.clear()
      
      socketClient.disconnect()
      
      navigate(ROUTES.HOME)
      trackEvent('auth_logout')
    },
    onError: (error: any) => {
      logout()
      queryClient.clear()
      socketClient.disconnect()
      navigate(ROUTES.HOME)
      logError(error, { action: 'auth_logout' })
    },
  })
}

export const useVerifyEmail = () => {
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      updateUser({ isVerified: true })
      toast.success('Email verified successfully!')
      navigate(ROUTES.LOGIN)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to verify email'
      toast.error(message)
    },
  })
}

export const useResendVerification = () => {
  const {updateUser} = useAuthStore()
  return useMutation({
    mutationFn: authApi.resendVerificationEmail,
    onSuccess: () => {
      toast.success('Verification email sent! Check your inbox.')
    },
    onError: (error: any) => {
      
      const message = error?.response?.data?.message || 'Failed to send verification email'

      if (message === 'Email already verified') {
        updateUser({ isVerified: true }); 
        
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH });
        
        toast.success('Status updated: Email already verified!');
      } else {
        toast.error(message || 'Ошибка');
      }
      toast.error(message)
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
    },
  })
}

export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: ResetPasswordData) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully!')
      navigate(ROUTES.LOGIN)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to reset password'
      toast.error(message)
    },
  })
}