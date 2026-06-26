import type { AuthUser, LoginCredentials, LoginResponse } from '../types/auth.types'
import { apiClient } from './http'

const AUTH_LOGIN_ENDPOINT = '/sdg/uz/login'

function parseLoginResponse(data: unknown): LoginResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid login response')
  }

  const root = data as Record<string, unknown>
  const nested = root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null

  const token =
    typeof root.token === 'string'
      ? root.token
      : nested && typeof nested.token === 'string'
        ? nested.token
        : null

  if (!token) {
    throw new Error('Token not found in login response')
  }

  const rawUser = root.user ?? nested?.user
  const user = rawUser && typeof rawUser === 'object' ? (rawUser as AuthUser) : undefined

  return { token, user }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<unknown>(AUTH_LOGIN_ENDPOINT, null, {
      params: {
        login: credentials.login,
        password: credentials.password,
      },
    })

    return parseLoginResponse(data)
  },
}
