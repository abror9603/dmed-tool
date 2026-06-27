/**
 * Shared Axios client — single entry point for all backend HTTP traffic.
 *
 * Architecture:
 * - Services import `apiClient` only; views/stores never call axios directly.
 * - Base URL resolution is dynamic: admin settings → dev proxy → env fallback.
 * - Auth token injection and 401 handling live here to avoid duplicating interceptors.
 */
import axios from 'axios'
import { DEFAULT_API_URL, STORAGE_KEYS, normalizeApiUrl } from '../config/app'
import { authSession } from './session'

/**
 * Resolves the API base URL for outgoing requests.
 * In dev, returns '' so requests hit the Vite proxy (same-origin, no CORS/ngrok issues).
 */
export function getApiUrl(): string {
  const stored = localStorage.getItem(STORAGE_KEYS.API_URL)
  if (stored?.trim()) {
    return normalizeApiUrl(stored)
  }

  if (import.meta.env.DEV) {
    return ''
  }

  return normalizeApiUrl(DEFAULT_API_URL)
}

/** Used by error messages when the request never reached the server. */
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

    // Global session expiry: clear credentials and redirect unless login itself failed.
    if (error.response?.status === 401 && !isLoginRequest) {
      authSession.clearSession()
      // Lazy import breaks the circular dependency: http → router → stores → http.
      const { default: router, ROUTE_NAMES } = await import('../router')
      if (router.currentRoute.value.name !== ROUTE_NAMES.LOGIN) {
        await router.push({ name: ROUTE_NAMES.LOGIN })
      }
    }

    return Promise.reject(error)
  },
)
