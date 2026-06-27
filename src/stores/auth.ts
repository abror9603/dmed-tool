/**
 * Auth store — orchestrates login/logout and mirrors session user into reactive state.
 *
 * Bearer token is stored in an HttpOnly cookie (not accessible from JavaScript).
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import router, { ROUTE_NAMES } from '../router'
import { i18n } from '../i18n'
import { authService } from '../services/auth'
import { authSession } from '../services/session'
import type { AuthUser, LoginCredentials } from '../types/auth.types'
import { getErrorMessage } from '../utils/errors'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(authSession.getUser())
  const sessionActive = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => sessionActive.value)

  function syncFromSession(): void {
    user.value = authSession.getUser()
    sessionActive.value = Boolean(user.value)
  }

  async function restoreSession(): Promise<boolean> {
    try {
      const session = await authService.getSession()
      if (!session.authenticated) {
        authSession.clearUser()
        user.value = null
        sessionActive.value = false
        return false
      }

      sessionActive.value = true

      if (session.user) {
        authSession.setUser(session.user)
        user.value = session.user
      } else {
        user.value = authSession.getUser()
      }

      return true
    } catch {
      authSession.clearUser()
      user.value = null
      sessionActive.value = false
      return false
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      const sessionUser = response.user ?? { id: 0, login: credentials.login }
      authSession.setUser(sessionUser)
      user.value = sessionUser
      sessionActive.value = true
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.loginFailed'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout()
    } catch {
      // Clear local state even if the logout request fails.
    }

    authSession.clearUser()
    user.value = null
    sessionActive.value = false
    error.value = null
    await router.push({ name: ROUTE_NAMES.LOGIN })
  }

  function clearError(): void {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    syncFromSession,
    restoreSession,
    login,
    logout,
    clearError,
  }
})
