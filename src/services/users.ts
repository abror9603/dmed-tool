import { apiClient } from './http'

export type AccountType = 'ADMIN' | 'DOCTOR' | 'OPERATOR'

export interface UserPayload {
  login: string
  password?: string
  firstName?: string
  lastName?: string
  email?: string
  accountType?: string
  phoneNumber?: string
  genderType?: string
}

export interface User {
  id: number | string
  login: string
  firstName?: string
  lastName?: string
  email?: string
  accountType?: string
  genderType?: string
  phoneNumber?: string
}

export interface UsersQuery {
  accountType?: AccountType
  firstName?: string
  lastName?: string
  genderType?: string
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

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  object?: T
}

function parseApiError(data: unknown): void {
  if (!data || typeof data !== 'object') return
  const root = data as ApiEnvelope<unknown>
  if (root.success === false) {
    throw new Error(root.message || 'Request failed')
  }
}

function parseUsersList(data: unknown): User[] {
  if (Array.isArray(data)) {
    return data as User[]
  }

  parseApiError(data)

  if (!data || typeof data !== 'object') {
    return []
  }

  const root = data as ApiEnvelope<unknown>
  if (Array.isArray(root.object)) {
    return root.object as User[]
  }

  if (root.object && typeof root.object === 'object') {
    const page = root.object as Record<string, unknown>
    if (Array.isArray(page.content)) {
      return page.content as User[]
    }
    if (Array.isArray(page.items)) {
      return page.items as User[]
    }
    if (Array.isArray(page.data)) {
      return page.data as User[]
    }
  }

  return []
}

function parseUsersPage(data: unknown, page: number, size: number): UsersPage {
  const users = parseUsersList(data)
  let total = users.length

  if (data && typeof data === 'object') {
    const root = data as ApiEnvelope<unknown>
    const obj = root.object
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const pageObj = obj as Record<string, unknown>
      if (typeof pageObj.totalElements === 'number') {
        total = pageObj.totalElements
      } else if (typeof pageObj.total === 'number') {
        total = pageObj.total
      }
    }
  }

  return { users, total, page, size }
}

function buildUsersParams(query: UsersQuery = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page ?? 0,
    size: query.size ?? 30,
  }

  if (query.accountType) params.accountType = query.accountType
  if (query.firstName?.trim()) params.firstName = query.firstName.trim()
  if (query.lastName?.trim()) params.lastName = query.lastName.trim()
  if (query.genderType?.trim()) params.genderType = query.genderType.trim()
  if (query.phoneNumber?.trim()) params.phoneNumber = query.phoneNumber.trim()

  return params
}

function parseUserItem(data: unknown): User {
  if (data && typeof data === 'object' && 'id' in data && 'login' in data) {
    return data as User
  }

  parseApiError(data)

  if (data && typeof data === 'object') {
    const root = data as ApiEnvelope<User>
    if (root.object && typeof root.object === 'object' && 'id' in root.object) {
      return root.object
    }
  }

  throw new Error('Invalid user response')
}

function parseActionResponse(data: unknown): void {
  if (data == null) return

  if (typeof data === 'object' && Object.keys(data as object).length === 0) {
    return
  }

  parseApiError(data)

  if (data && typeof data === 'object') {
    const root = data as ApiEnvelope<unknown>
    if (root.success === true) return
  }
}

export const usersService = {
  async getAll(query: UsersQuery = {}): Promise<UsersPage> {
    const page = query.page ?? 0
    const size = query.size ?? 30
    const { data } = await apiClient.get<unknown>('/api/v1/users', {
      params: buildUsersParams(query),
    })
    return parseUsersPage(data, page, size)
  },

  async getById(id: number | string): Promise<User> {
    const { data } = await apiClient.get<unknown>(`/api/v1/users/${id}`)
    return parseUserItem(data)
  },

  async create(payload: UserPayload): Promise<User> {
    const { data } = await apiClient.post<unknown>('/api/v1/users', payload)
    return parseUserItem(data)
  },

  async update(id: number | string, payload: UserPayload): Promise<User> {
    const { data } = await apiClient.put<unknown>(`/api/v1/users/${id}`, payload)
    return parseUserItem(data)
  },

  async delete(id: number | string): Promise<void> {
    const { data } = await apiClient.delete<unknown>(`/api/v1/users/${id}`)
    parseActionResponse(data)
  },
}
