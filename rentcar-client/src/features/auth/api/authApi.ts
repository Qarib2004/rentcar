import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types'
import type {
  ForgotPasswordData,
  ResetPasswordData,
} from '@/types/api.types'




export const register = async (data:RegisterData):Promise<AuthResponse>=> {
    return apiClient.post(API_ENDPOINTS.REGISTER,data)
}


export const login = async (credentials:LoginCredentials):Promise<AuthResponse>=> {
    return apiClient.post(API_ENDPOINTS.LOGIN,credentials)
}


export const logout = async ():Promise<void>=> {
    return apiClient.post(API_ENDPOINTS.LOGOUT)
}

export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post(API_ENDPOINTS.REFRESH, { refreshToken })
  }
  
  export const getCurrentUser = async (): Promise<User> => {
    return apiClient.get(API_ENDPOINTS.ME)
  }
  
  export const verifyEmail = async (token: string): Promise<{ message: string }> => {
    return apiClient.post(API_ENDPOINTS.VERIFY_EMAIL, { token })
  }
  
  export const resendVerificationEmail = async (): Promise<{ message: string }> => {
    return apiClient.post(API_ENDPOINTS.RESEND_VERIFICATION)
  }
  
  export const forgotPassword = async (data: ForgotPasswordData): Promise<{ message: string }> => {
    return apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, data)
  }
  
  export const resetPassword = async (data: ResetPasswordData): Promise<{ message: string }> => {
    return apiClient.post(API_ENDPOINTS.RESET_PASSWORD, data)
  }