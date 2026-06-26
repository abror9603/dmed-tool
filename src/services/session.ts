import { STORAGE_KEYS } from '../config/app'
import type { AuthUser } from '../types/auth.types'

export const authSession = {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  setSession(token: string, user: AuthUser | null): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
    }
  },

  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
  },
}
