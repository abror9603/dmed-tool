import { apiClient } from './http'

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ClinicApplication {
  id: number
  name: string
  address: string
  phone?: string
  email: string
  contactPerson?: string
  contact?: string
  status: ApplicationStatus
  createdAt?: string
  notes?: string
}

export interface ClinicApplicationPayload {
  name: string
  address: string
  phone: string
  email: string
  contactPerson?: string
}

export const clinicApplicationsService = {
  async getAll(status?: ApplicationStatus): Promise<ClinicApplication[]> {
    const { data } = await apiClient.get<ClinicApplication[]>('/api/v1/clinic-applications', {
      params: status ? { status } : undefined,
    })
    return data
  },

  async apply(payload: ClinicApplicationPayload): Promise<ClinicApplication> {
    const { data } = await apiClient.post<ClinicApplication>('/api/v1/clinic-applications/apply', payload)
    return data
  },

  async approve(id: number | string): Promise<ClinicApplication> {
    const { data } = await apiClient.post<ClinicApplication>(`/api/v1/clinic-applications/${id}/approve`)
    return data
  },

  async reject(id: number | string): Promise<ClinicApplication> {
    const { data } = await apiClient.post<ClinicApplication>(`/api/v1/clinic-applications/${id}/reject`)
    return data
  },
}
