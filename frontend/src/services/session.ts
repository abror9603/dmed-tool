/**
 * Client-side session state (user profile only).
 *
 * The bearer token lives in an HttpOnly cookie set by the dev/preview auth proxy.
 * JavaScript cannot read the token — API auth is handled server-side via cookie → Bearer injection.
 */
import { STORAGE_KEYS } from '../config/app'
import type { AuthUser } from '../types/auth.types'

function migrateLegacyStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
}

migrateLegacyStorage()

export const authSession = {
  getUser(): AuthUser | null {
    const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_USER)
    if (!raw) return null

    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  setUser(user: AuthUser): void {
    sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user))
  },

  clearUser(): void {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER)
  },
}
