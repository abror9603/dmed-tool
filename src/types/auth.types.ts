export interface LoginCredentials {
  login: string
  password: string
}

export interface AuthUser {
  id: number
  login: string
  firstName?: string
  lastName?: string
  accountType?: string
  email?: string
}

export interface LoginResponse {
  user: AuthUser
}

export interface SessionResponse {
  authenticated: boolean
  user?: AuthUser
}
