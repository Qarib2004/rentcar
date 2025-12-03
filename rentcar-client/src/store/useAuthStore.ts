import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { STORAGE_KEYS } from '@/lib/utils/constants'
import { tokenManager } from '@/lib/utils/tokenManager'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (isLoading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        })
      },

      setTokens: (accessToken, refreshToken) => {
        tokenManager.setTokens(accessToken, refreshToken)
      },

      login: (user, accessToken, refreshToken) => {
        get().setTokens(accessToken, refreshToken)
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        tokenManager.clear()
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        
        localStorage.removeItem(STORAGE_KEYS.USER)
      },

      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)