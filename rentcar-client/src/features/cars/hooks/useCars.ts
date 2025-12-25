import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import * as carsApi from '../api/carsApi'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categoriesApi'
import { QUERY_KEYS, TOAST_MESSAGES, ROUTES } from '@/lib/utils/constants'
import type { CarsQueryParams } from '@/types/api.types'

export function useCars(params?: CarsQueryParams) {
  const queryKey = useMemo(() => {
    if (!params) return QUERY_KEYS.CARS
    return [...QUERY_KEYS.CARS, params]
  }, [params])

  return useQuery({
    queryKey,
    queryFn: () => carsApi.getCars(params),
    staleTime: 5 * 60 * 1000,
  })
}
export function useCarDetails(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CAR_DETAILS(slug),
    queryFn: () => carsApi.getCarById(slug),
    enabled: !!slug,
  })
}

export function useMyCars(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CARS, 'my-cars', page, limit],
    queryFn: () => carsApi.getMyCars(page, limit),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: getCategories,
    staleTime: 10 * 60 * 1000,
  })
}

type CategoryPayload = {
  name: string
  slug: string
  description?: string
  icon?: string
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoryPayload) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
      toast.success('Category created successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create category'
      toast.error(message)
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryPayload> }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
      toast.success('Category updated successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update category'
      toast.error(message)
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
      toast.success('Category deleted successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete category'
      toast.error(message)
    },
  })
}

export function useCreateCar() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: FormData) => carsApi.createCar(data),
    onSuccess: (car) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CARS })
      toast.success('Car created successfully!')
      navigate(`/cars/${car.slug}`)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create car'
      toast.error(message)
    },
  })
}

export function useUpdateCar(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FormData) => carsApi.updateCar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CARS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAR_DETAILS(id) })
      toast.success(TOAST_MESSAGES.UPDATE_SUCCESS)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || TOAST_MESSAGES.UPDATE_ERROR
      toast.error(message)
    },
  })
}

export function useDeleteCarImage(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageUrl: string) => carsApi.deleteCarImage(id, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAR_DETAILS(id) })
      toast.success('Image deleted successfully!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete image'
      toast.error(message)
    },
  })
}

export function useUpdateCarStatusDynamic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ carId, status }: { carId: string; status: string }) => 
      carsApi.updateCarStatus(carId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CARS })
      toast.success('Car status updated!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update status'
      toast.error(message)
    },
  })
}




export function useUpdateCarStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ carId, status }: { carId: string; status: string }) => 
      carsApi.updateCarStatus(carId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CARS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAR_DETAILS(variables.carId) })
      toast.success('Car status updated!')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update status'
      toast.error(message)
    },
  })
}

export function useDeleteCar() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (id: string) => carsApi.deleteCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CARS })
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS)
      navigate(ROUTES.CARS)
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || TOAST_MESSAGES.DELETE_ERROR
      toast.error(message)
    },
  })
}