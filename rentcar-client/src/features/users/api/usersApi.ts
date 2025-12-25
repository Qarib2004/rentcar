
import { apiClient } from '@/lib/api/axios'
import { API_ENDPOINTS } from '@/lib/utils/constants'
import type { User, PaginatedResponse } from '@/types'
import type {
  UpdateUserProfileData,
  ChangePasswordData,
  UsersQueryParams,
} from '@/types/api.types'

export const getAllUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<User>> => {
  return apiClient.get(`${API_ENDPOINTS.USERS}?page=${page}&limit=${limit}`)
}


export const getUsers = async (params?: UsersQueryParams) => {
  const { data } = await apiClient.get<PaginatedResponse<User>>('/user', { params })
  return data
}



export const updateUserRole = async (userId: string, role: string) => {
  return apiClient.patch(`/user/${userId}/role`, { role })

}

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  const { data } = await apiClient.patch(`/user/${userId}/status`, { isActive })
  return data
}

export const deleteUser = async (userId: string) => {
  const { data } = await apiClient.delete(`/user/${userId}`)
  return data
}

export const getMyProfile = async (): Promise<User> => {
  return apiClient.get(`${API_ENDPOINTS.USERS}/me`)
}

export const getUserById = async (id: string): Promise<User> => {
  return apiClient.get(API_ENDPOINTS.USER_PROFILE(id))
}

export const updateMyProfile = async (data: UpdateUserProfileData): Promise<User> => {
  return apiClient.put(`${API_ENDPOINTS.USERS}/me`, data)
}

export const uploadAvatar = async (file: File): Promise<{ avatar: string }> => {
  const formData = new FormData()
  formData.append('avatar', file)
  
  return apiClient.post(`${API_ENDPOINTS.USERS}/me/avatar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  return apiClient.patch(`${API_ENDPOINTS.USERS}/me/change-password`, data)
}

export const deactivateAccount = async (): Promise<{ message: string }> => {
  return apiClient.delete(`${API_ENDPOINTS.USERS}/me`)
}

export const activateAccount = async (id: string): Promise<{ message: string }> => {
  return apiClient.patch(`${API_ENDPOINTS.USERS}/${id}/activate`)
}

export const getMyStats = async (): Promise<{
  totalBookings: number
  activeBookings: number
  completedBookings: number
  totalSpent: number
  totalReviews: number
}> => {
  return apiClient.get(`${API_ENDPOINTS.USERS}/me/stats`)
}

export const getUserStats = async (id: string): Promise<{
  totalBookings: number
  activeBookings: number
  completedBookings: number
  totalSpent: number
  totalReviews: number
}> => {
  return apiClient.get(`${API_ENDPOINTS.USERS}/${id}/stats`)
}