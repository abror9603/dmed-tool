/**
 * Shared Axios client — single entry point for all backend HTTP traffic.
 *
 * Auth: HttpOnly cookie (same-origin). The Vite auth proxy attaches Bearer tokens upstream.
 */
import axios from 'axios'
import { DEFAULT_API_URL, STORAGE_KEYS, normalizeApiUrl } from '../config/app'
import { authSession } from './session'

/**
 * API requests are same-origin so the auth proxy can read the HttpOnly cookie.
 * The stored admin API URL is kept for display / future server-side proxy config only.
 */
export function getApiUrl(): string {
  if (import.meta.env.DEV || import.meta.env.VITE_AUTH_COOKIE_PROXY === 'true') {
    return ''
  }

  const stored = localStorage.getItem(STORAGE_KEYS.API_URL)
  if (stored?.trim()) {
    return normalizeApiUrl(stored)
  }

  return normalizeApiUrl(DEFAULT_API_URL)
}

/** Used by error messages when the request never reached the server. */
export function getResolvedApiUrl(): string {
  const base = getApiUrl()
  return base || normalizeApiUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL)
}

export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

apiClient.interceptors.request.use((config) => {
  const path = config.url ?? ''
  const base = getApiUrl()
  config.url = base ? `${base}${path}` : path
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginRequest = error.config?.url?.includes('/sdg/uz/login')
    const isSessionRequest = error.config?.url?.includes('/__auth/session')

    const isIntakeRequest = error.config?.url?.includes('/medical-events/intake')
    const isValidateKeyRequest = error.config?.url?.includes('/validate-key')

    const unauthorized = error.response?.status === 401 || error.response?.status === 403

    if (unauthorized && !isLoginRequest && !isSessionRequest && !isIntakeRequest && !isValidateKeyRequest) {
      let sessionValid = false
      try {
        const { data } = await apiClient.get<{ authenticated?: boolean }>('/__auth/session')
        sessionValid = data?.authenticated === true
      } catch {
        sessionValid = false
      }

      if (!sessionValid) {
        authSession.clearUser()
        try {
          await apiClient.post('/__auth/logout')
        } catch {
          // Cookie may already be cleared upstream.
        }

        const { default: router, ROUTE_NAMES } = await import('../router')
        if (router.currentRoute.value.name !== ROUTE_NAMES.LOGIN) {
          await router.push({ name: ROUTE_NAMES.LOGIN })
        }
      }
    }

    return Promise.reject(error)
  },
)
