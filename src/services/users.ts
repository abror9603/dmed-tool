import { apiClient } from './http'
import { buildPageResult } from './api-page'
import {
  extractRecordArray,
  parseActionResponse,
  parseApiError,
  unwrapEnvelopeObject,
} from './api-envelope'
import { DEFAULT_PAGE_SIZE } from '../utils/pagination'
import type { User, UserPayload, UsersPage, UsersQuery } from '../types/user.types'

export type { AccountType, User, UserPayload, UsersPage, UsersQuery } from '../types/user.types'

const USER_LIST_KEYS = ['content', 'items', 'data', 'users', 'userList'] as const

function isUserLike(value: Record<string, unknown>): boolean {
  if (!('id' in value)) return false
  return (
    'login' in value ||
    'userName' in value ||
    'username' in value ||
    'userLogin' in value
  )
}

function normalizeUser(raw: Record<string, unknown>): User {
  const login = raw.login ?? raw.userName ?? raw.username ?? raw.userLogin

  return {
    id: raw.id as number | string,
    login: login ? String(login) : '',
    firstName: raw.firstName ? String(raw.firstName) : undefined,
    lastName: raw.lastName ? String(raw.lastName) : undefined,
    email: raw.email ? String(raw.email) : undefined,
    accountType: raw.accountType ? String(raw.accountType) : undefined,
    phoneNumber: raw.phoneNumber
      ? String(raw.phoneNumber)
      : raw.phone
        ? String(raw.phone)
        : undefined,
  }
}

function parseUsersList(data: unknown): User[] {
  return extractRecordArray(data, USER_LIST_KEYS)
    .filter(isUserLike)
    .map(normalizeUser)
    .filter((user) => user.login.length > 0)
}

function parseUsersPage(data: unknown, page: number, size: number): UsersPage {
  const result = buildPageResult(parseUsersList(data), data, page, size)
  return {
    users: result.items,
    total: result.total,
    page: result.page,
    size: result.size,
  }
}

function buildUsersParams(query: UsersQuery = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page ?? 0,
    size: query.size ?? DEFAULT_PAGE_SIZE,
  }

  if (query.accountType) params.accountType = query.accountType
  if (query.firstName?.trim()) params.firstName = query.firstName.trim()
  if (query.lastName?.trim()) params.lastName = query.lastName.trim()
  if (query.phoneNumber?.trim()) params.phoneNumber = query.phoneNumber.trim()

  return params
}

function parseUserItem(data: unknown): User {
  const direct = unwrapEnvelopeObject(data)
  if (direct && isUserLike(direct)) {
    return normalizeUser(direct)
  }

  parseApiError(data)
  throw new Error('Invalid user response')
}

export const usersService = {
  async getAll(query: UsersQuery = {}): Promise<UsersPage> {
    const page = query.page ?? 0
    const size = query.size ?? DEFAULT_PAGE_SIZE
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
