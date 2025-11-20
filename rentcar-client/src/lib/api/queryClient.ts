import { QueryClient, DefaultOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

const queryConfig: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    
    gcTime: 10 * 60 * 1000,
    
    retry: 1,
    
    refetchOnWindowFocus: false,
    
    refetchOnReconnect: false,
    
    throwOnError: false,
  },
  mutations: {
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Something went wrong'
      toast.error(message)
    },
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

export const invalidateQueries = {
  auth: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
  user: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  cars: () => queryClient.invalidateQueries({ queryKey: ['cars'] }),
  bookings: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  reviews: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  notifications: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  statistics: () => queryClient.invalidateQueries({ queryKey: ['statistics'] }),
  chat: () => queryClient.invalidateQueries({ queryKey: ['chat'] }),
}

export const prefetchQuery = async (
  queryKey: string[],
  queryFn: () => Promise<any>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  })
}

export default queryClient