export type AccountType = 'ADMIN' | 'DOCTOR' | 'OPERATOR'

export interface UserPayload {
  login: string
  password?: string
  firstName?: string
  lastName?: string
  email?: string
  accountType?: string
  phoneNumber?: string
}

export interface User {
  id: number | string
  login: string
  firstName?: string
  lastName?: string
  email?: string
  accountType?: string
  phoneNumber?: string
}

export interface UsersQuery {
  accountType?: AccountType
  firstName?: string
  lastName?: string
  phoneNumber?: string
  page?: number
  size?: number
}

export interface UsersPage {
  users: User[]
  total: number
  page: number
  size: number
}
