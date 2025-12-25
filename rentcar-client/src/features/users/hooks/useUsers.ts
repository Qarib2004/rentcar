import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as usersApi from '../api/usersApi'
import { QUERY_KEYS } from '@/lib/utils/constants'
import { UsersQueryParams } from '@/types/api.types'

export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER, params],
    queryFn: () => usersApi.getUsers(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUserDetails(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USER, id],
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      usersApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      toast.success('User role updated successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update user role'
      toast.error(message)
    },
  })
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => 
      usersApi.toggleUserStatus(userId, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      toast.success(`User ${variables.isActive ? 'activated' : 'deactivated'} successfully!`)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update user status'
      toast.error(message)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      toast.success('User deleted successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete user'
      toast.error(message)
    },
  })
}