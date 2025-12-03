import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as usersApi from '../api/usersApi'
import { useAuthStore } from '@/store/useAuthStore'
import { QUERY_KEYS, TOAST_MESSAGES } from '@/lib/utils/constants'
import type { UpdateUserProfileData, ChangePasswordData } from '@/types/api.types'

export function useMyProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: usersApi.getMyProfile,
  })
}

export function useMyStats() {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER, 'stats'],
    queryFn: usersApi.getMyStats,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: UpdateUserProfileData) => usersApi.updateMyProfile(data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH })
      updateUser(user)
      toast.success(TOAST_MESSAGES.UPDATE_SUCCESS)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || TOAST_MESSAGES.UPDATE_ERROR
      toast.error(message)
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { updateUser } = useAuthStore()

  return useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH })
      updateUser({ avatar: data.avatar })
      toast.success('Avatar updated successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to upload avatar'
      toast.error(message)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => usersApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to change password'
      toast.error(message)
    },
  })
}

export function useDeactivateAccount() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: usersApi.deactivateAccount,
    onSuccess: () => {
      logout()
      queryClient.clear()
      toast.success('Account deactivated successfully')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to deactivate account'
      toast.error(message)
    },
  })
}