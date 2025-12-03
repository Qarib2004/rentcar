type TokenCache = {
  accessToken: string | null
  refreshToken: string | null
}

const ACCESS_KEY = 'rc_access_token'
const REFRESH_KEY = 'rc_refresh_token'

const encode = (value: string) => {
  try {
    return typeof window === 'undefined' ? value : window.btoa(value)
  } catch {
    return value
  }
}

const decode = (value: string | null) => {
  if (!value) return null

  try {
    return typeof window === 'undefined' ? value : window.atob(value)
  } catch {
    return value
  }
}

const memoryCache: TokenCache = {
  accessToken: null,
  refreshToken: null,
}

const hasSessionStorage = () => typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'

const persist = (key: string, value: string | null) => {
  if (!hasSessionStorage()) return

  if (value) {
    window.sessionStorage.setItem(key, encode(value))
  } else {
    window.sessionStorage.removeItem(key)
  }
}

const read = (key: string) => {
  if (!hasSessionStorage()) return null
  const stored = window.sessionStorage.getItem(key)
  return decode(stored)
}

export const tokenManager = {
  getAccessToken: () => {
    if (memoryCache.accessToken) return memoryCache.accessToken
    memoryCache.accessToken = read(ACCESS_KEY)
    return memoryCache.accessToken
  },

  getRefreshToken: () => {
    if (memoryCache.refreshToken) return memoryCache.refreshToken
    memoryCache.refreshToken = read(REFRESH_KEY)
    return memoryCache.refreshToken
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    memoryCache.accessToken = accessToken
    memoryCache.refreshToken = refreshToken
    persist(ACCESS_KEY, accessToken)
    persist(REFRESH_KEY, refreshToken)
  },

  updateAccessToken: (accessToken: string) => {
    memoryCache.accessToken = accessToken
    persist(ACCESS_KEY, accessToken)
  },

  clear: () => {
    memoryCache.accessToken = null
    memoryCache.refreshToken = null
    persist(ACCESS_KEY, null)
    persist(REFRESH_KEY, null)
  },
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === ACCESS_KEY) {
      memoryCache.accessToken = decode(event.newValue)
    }

    if (event.key === REFRESH_KEY) {
      memoryCache.refreshToken = decode(event.newValue)
    }
  })
}

