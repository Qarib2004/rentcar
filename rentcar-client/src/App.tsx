import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'
import { queryClient } from '@/lib/api/queryClient'
import { router } from '@/routes'
import { useAuthStore } from '@/store/useAuthStore'
import { socketClient } from '@/lib/api/socket'
import { useCurrentUser } from '@/features/auth/hooks/useAuth'
import { trackEvent } from '@/lib/analytics'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="text-gray-600 max-w-md">
        {error.message || 'The page could not be displayed. Try refreshing the page.'}
      </p>
      <div className="flex gap-2">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 rounded-md bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
        >
          Refresh page
        </button>
      </div>
    </div>
  )
}

function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-gray-600">Loading interface…</p>
      </div>
    </div>
  )
}

function App() {
  const { isAuthenticated, setLoading } = useAuthStore()
  useCurrentUser()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(false)

        if (isAuthenticated) {
          socketClient.connect()
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setLoading(false)
      }
    }

    initializeApp()

    return () => {
      socketClient.disconnect()
    }
  }, [isAuthenticated, setLoading])

  useEffect(() => {
    const unsubscribe = router.subscribe((state) => {
      trackEvent('page_view', { path: state.location.pathname })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<SuspenseFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App