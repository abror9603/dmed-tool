import { apiClient } from './http'

export interface UserPayload {
  login: string
  password?: string
  firstName?: string
  lastName?: string
  email?: string
  accountType?: string
}

export interface User {
  id: number
  login: string
  firstName?: string
  lastName?: string
  email?: string
  accountType?: string
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/api/v1/users')
    return data
  },

  async getById(id: number | string): Promise<User> {
    const { data } = await apiClient.get<User>(`/api/v1/users/${id}`)
    return data
  },

  async create(payload: UserPayload): Promise<User> {
    const { data } = await apiClient.post<User>('/api/v1/users', payload)
    return data
  },

  async update(id: number | string, payload: UserPayload): Promise<User> {
    const { data } = await apiClient.put<User>(`/api/v1/users/${id}`, payload)
    return data
  },

  async delete(id: number | string): Promise<void> {
    await apiClient.delete(`/api/v1/users/${id}`)
  },
}
