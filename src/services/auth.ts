/**
 * Authentication API — login, logout, and session restore.
 *
 * Token persistence is HttpOnly cookie (set by the auth proxy). Only user profile is kept in sessionStorage.
 */
import type { AuthUser, LoginCredentials, LoginResponse, SessionResponse } from '../types/auth.types'
import { apiClient } from './http'

const AUTH_LOGIN_ENDPOINT = '/sdg/uz/login'
const AUTH_SESSION_ENDPOINT = '/__auth/session'
const AUTH_LOGOUT_ENDPOINT = '/__auth/logout'

function isLoginFailureBody(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  const root = data as Record<string, unknown>
  return root.status === false || root.success === false
}

function isLoginSuccessBody(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  if (isLoginFailureBody(data)) return false

  const root = data as Record<string, unknown>
  return root.status === true || root.success === true || root.code === 200
}

function loginFailureMessage(data: unknown): string {
  if (data && typeof data === 'object' && typeof (data as Record<string, unknown>).message === 'string') {
    const message = (data as Record<string, unknown>).message as string
    // Backend uses "Yaxshi" for successful logins — never surface it as an error.
    if (isLoginSuccessBody(data)) return 'Login failed'
    return message
  }
  return 'Login failed'
}

function isUserRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return 'id' in record && ('login' in record || 'username' in record || 'phoneNumber' in record)
}

function normalizeAuthUser(raw: Record<string, unknown>, fallbackLogin: string): AuthUser {
  const login = String(raw.login ?? raw.username ?? raw.userName ?? raw.phoneNumber ?? fallbackLogin)
  const rawId = raw.id ?? 0
  const id = typeof rawId === 'number' ? rawId : Number(rawId) || 0

  return {
    id,
    login,
    firstName: typeof raw.firstName === 'string' ? raw.firstName : undefined,
    lastName: typeof raw.lastName === 'string' ? raw.lastName : undefined,
    accountType: typeof raw.accountType === 'string' ? raw.accountType : undefined,
    email: typeof raw.email === 'string' ? raw.email : undefined,
  }
}

function parseUserFromLogin(data: unknown, fallbackLogin: string): AuthUser {
  if (!data || typeof data !== 'object') {
    return { id: 0, login: fallbackLogin }
  }

  const root = data as Record<string, unknown>
  const object = root.object
  const nested = root.data
  const rawUser =
    root.user ??
    (isUserRecord(object) ? object : null) ??
    (object && typeof object === 'object' ? (object as Record<string, unknown>).user : null) ??
    (isUserRecord(nested) ? nested : null) ??
    (nested && typeof nested === 'object' ? (nested as Record<string, unknown>).user : null)

  if (rawUser && typeof rawUser === 'object') {
    return normalizeAuthUser(rawUser as Record<string, unknown>, fallbackLogin)
  }

  return { id: 0, login: fallbackLogin }
}

function parseLoginResponse(data: unknown, fallbackLogin: string): LoginResponse {
  return { user: parseUserFromLogin(data, fallbackLogin) }
}

function parseSessionResponse(data: unknown): SessionResponse {
  if (!data || typeof data !== 'object') {
    return { authenticated: false }
  }

  const root = data as Record<string, unknown>
  const authenticated = root.authenticated === true
  const rawUser = root.user
  const user =
    rawUser && typeof rawUser === 'object' ? (rawUser as AuthUser) : undefined

  return { authenticated, user }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<unknown>(AUTH_LOGIN_ENDPOINT, null, {
      params: {
        login: credentials.login,
        password: credentials.password,
      },
    })

    if (isLoginFailureBody(data) || !isLoginSuccessBody(data)) {
      throw new Error(loginFailureMessage(data))
    }

    const response = parseLoginResponse(data, credentials.login)

    // Cookie is set by the auth proxy from the login response. Session restore may lag
    // one tick in the browser, so we trust the login envelope instead of blocking here.
    try {
      const session = await this.getSession()
      if (session.authenticated && session.user) {
        return { user: session.user }
      }
    } catch {
      // Fall back to the user parsed from the login body.
    }

    return response
  },

  async getSession(): Promise<SessionResponse> {
    const { data } = await apiClient.get<unknown>(AUTH_SESSION_ENDPOINT)
    return parseSessionResponse(data)
  },

  async logout(): Promise<void> {
    await apiClient.post<unknown>(AUTH_LOGOUT_ENDPOINT)
  },
}
