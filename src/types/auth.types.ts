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
  token: string
  user?: AuthUser
}
