/**
 * Auth store — orchestrates login/logout and mirrors `authSession` into reactive state.
 *
 * `syncFromSession()` is called on every route change so hard refreshes and
 * interceptor-driven logouts stay consistent with Pinia.
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
  const token = ref<string | null>(authSession.getToken())
  const user = ref<AuthUser | null>(authSession.getUser())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function syncFromSession(): void {
    token.value = authSession.getToken()
    user.value = authSession.getUser()
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)
      const sessionUser = response.user ?? { id: 0, login: credentials.login }
      authSession.setSession(response.token, sessionUser)
      token.value = response.token
      user.value = sessionUser
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.loginFailed'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    authSession.clearSession()
    token.value = null
    user.value = null
    error.value = null
    await router.push({ name: ROUTE_NAMES.LOGIN })
  }

  function clearError(): void {
    error.value = null
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    syncFromSession,
    login,
    logout,
    clearError,
  }
})
