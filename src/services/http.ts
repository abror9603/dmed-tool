import axios from 'axios'
import { DEFAULT_API_URL, STORAGE_KEYS, normalizeApiUrl } from '../config/app'
import { authSession } from './session'

export function getApiUrl(): string {
  const stored = localStorage.getItem(STORAGE_KEYS.API_URL)
  if (stored?.trim()) {
    return normalizeApiUrl(stored)
  }

  // Dev: same-origin requests via Vite proxy (avoids CORS / ngrok browser issues)
  if (import.meta.env.DEV) {
    return ''
  }

  return normalizeApiUrl(DEFAULT_API_URL)
}

export function getResolvedApiUrl(): string {
  const base = getApiUrl()
  return base || normalizeApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL)
}

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

apiClient.interceptors.request.use((config) => {
  const path = config.url ?? ''
  config.url = `${getApiUrl()}${path}`

  const token = authSession.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginRequest = error.config?.url?.includes('/sdg/uz/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      authSession.clearSession()
      const { default: router, ROUTE_NAMES } = await import('../router')
      if (router.currentRoute.value.name !== ROUTE_NAMES.LOGIN) {
        await router.push({ name: ROUTE_NAMES.LOGIN })
      }
    }

    return Promise.reject(error)
  },
)
