import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { API_URL, API_ENDPOINTS, ROUTES, STORAGE_KEYS } from '@/lib/utils/constants'
import { tokenManager } from '@/lib/utils/tokenManager'
import { router } from '@/routes'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken()
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = tokenManager.getRefreshToken()
        
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(
          `${API_URL}${API_ENDPOINTS.REFRESH}`,
          { refreshToken },
          { withCredentials: true }
        )

        const { accessToken } = response.data

        tokenManager.updateAccessToken(accessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        return api(originalRequest)
      } catch (refreshError) {
        tokenManager.clear()
        localStorage.removeItem(STORAGE_KEYS.USER)
        
        const publicPaths = [
          ROUTES.LOGIN,
          ROUTES.REGISTER,
          ROUTES.FORGOT_PASSWORD,
          ROUTES.RESET_PASSWORD, 
          ROUTES.HOME,
          ROUTES.ABOUT,
          ROUTES.CARS,
        ]
        
        const currentPath = window.location.pathname
        const isPublicPath = publicPaths.some(path => currentPath.startsWith(path))
        
        if (!isPublicPath) {
          router.navigate(ROUTES.LOGIN)
        }
        
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const apiClient = {
  get: <T = any>(url: string, config?: any) => 
    api.get<T>(url, config).then(res => res.data),
    
  post: <T = any>(url: string, data?: any, config?: any) => 
    api.post<T>(url, data, config).then(res => res.data),
    
  put: <T = any>(url: string, data?: any, config?: any) => 
    api.put<T>(url, data, config).then(res => res.data),
    
  patch: <T = any>(url: string, data?: any, config?: any) => 
    api.patch<T>(url, data, config).then(res => res.data),
    
  delete: <T = any>(url: string, config?: any) => 
    api.delete<T>(url, config).then(res => res.data),
}

export default api