import { apiClient } from './http'

export { apiClient, getApiUrl } from './http'

export interface ClinicPayload {
  name: string
  address: string
  phone: string
  email: string
  contact?: string
  contactInfo?: string
}

export interface Clinic {
  id: number
  name: string
  address: string
  phone?: string
  contactInfo?: string
  contact?: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  secretKey: string | null
}

export const clinicsService = {
  async create(payload: ClinicPayload): Promise<Clinic> {
    const { data } = await apiClient.post<Clinic>('/api/v1/clinics', payload)
    return data
  },

  async getAll(): Promise<Clinic[]> {
    const { data } = await apiClient.get<Clinic[]>('/api/v1/clinics')
    return data
  },

  async getById(id: string | number): Promise<Clinic> {
    const { data } = await apiClient.get<Clinic>(`/api/v1/clinics/${id}`)
    return data
  },

  async getByStatus(status: 'ACTIVE' | 'INACTIVE'): Promise<Clinic[]> {
    const { data } = await apiClient.get<Clinic[]>(`/api/v1/clinics/status/${status}`)
    return data
  },

  async update(id: string | number, payload: ClinicPayload): Promise<Clinic> {
    const { data } = await apiClient.put<Clinic>(`/api/v1/clinics/${id}`, payload)
    return data
  },

  async toggleStatus(id: string | number): Promise<Clinic> {
    const { data } = await apiClient.patch<Clinic>(`/api/v1/clinics/${id}/status`)
    return data
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/api/v1/clinics/${id}`)
  },

  async validateKey(secretKey: string): Promise<Clinic> {
    const { data } = await apiClient.get<Clinic>('/api/v1/clinics/validate-key', {
      params: { secretKey },
    })
    return data
  },
}
