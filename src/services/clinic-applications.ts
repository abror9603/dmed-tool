import { apiClient } from './http'
import { clinicsService, type ClinicPayload } from './clinics'
import { usersService } from './users'
import type { ClinicType } from '../types/clinic.types'
import { isAxiosError } from 'axios'

export type { ClinicType } from '../types/clinic.types'
export { CLINIC_TYPES } from '../types/clinic.types'

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ClinicApplicationApplyPayload {
  clinicName: string
  clinicType: ClinicType
  firstName: string
  lastName: string
  login: string
  password: string
  phoneNumber1: string
  phoneNumber2: string
}

export interface ClinicApplication {
  id: string | number
  clinicName?: string
  clinicType?: ClinicType
  name?: string
  firstName?: string
  lastName?: string
  login?: string
  phoneNumber1?: string
  phoneNumber2?: string
  phone?: string
  address?: string
  email?: string
  contactPerson?: string
  contact?: string
  status: ApplicationStatus
  createdAt?: string
  secretKey?: string | null
  secretKeyExpiresAt?: string | null
  notes?: string
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

function parseApplicationList(data: unknown): ClinicApplication[] {
  if (Array.isArray(data)) {
    return data as ClinicApplication[]
  }

  parseApiError(data)

  if (!data || typeof data !== 'object') {
    return []
  }

  const root = data as ApiEnvelope<unknown>
  if (Array.isArray(root.object)) {
    return root.object as ClinicApplication[]
  }

  return []
}

function parseApplicationItem(data: unknown): ClinicApplication {
  if (data && typeof data === 'object' && 'id' in data && 'status' in data) {
    return data as ClinicApplication
  }

  parseApiError(data)

  if (data && typeof data === 'object') {
    const root = data as ApiEnvelope<ClinicApplication>
    if (root.object && typeof root.object === 'object' && 'id' in root.object) {
      return root.object
    }
  }

  throw new Error('Invalid application response')
}

/** Approve/reject often return `{}` or `{ success: true }` with no body object */
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

export function getApplicationClinicName(app: ClinicApplication): string {
  return app.clinicName || app.name || '—'
}

export function getApplicationContactName(app: ClinicApplication): string {
  return [app.firstName, app.lastName].filter(Boolean).join(' ') || app.contactPerson || app.contact || '—'
}

export function formatApplicationDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export function applicationToClinicPayload(app: ClinicApplication): ClinicPayload {
  const name = getApplicationClinicName(app)
  const contactName = getApplicationContactName(app)
  const phone = app.phoneNumber1 || app.phoneNumber2 || app.phone || '—'
  const login = app.login?.trim() || `clinic-${app.id}`

  return {
    name: name === '—' ? `Klinika #${app.id}` : name,
    address: app.address?.trim() || (contactName !== '—' ? contactName : 'Manzil kiritilmagan'),
    phone,
    email: app.email?.trim() || `${login}@dmed.uz`,
    contact: contactName !== '—' ? contactName : undefined,
  }
}

export const clinicApplicationsService = {
  async getAll(status?: ApplicationStatus): Promise<ClinicApplication[]> {
    const { data } = await apiClient.get<unknown>('/api/v1/clinic-applications', {
      params: status ? { status } : undefined,
    })
    return parseApplicationList(data)
  },

  async apply(payload: ClinicApplicationApplyPayload): Promise<ClinicApplication> {
    const { data } = await apiClient.post<unknown>('/api/v1/clinic-applications/apply', payload)
    return parseApplicationItem(data)
  },

  async applyWithUser(payload: ClinicApplicationApplyPayload): Promise<ClinicApplication> {
    const application = await this.apply(payload)

    try {
      await usersService.create({
        login: payload.login,
        password: payload.password,
        firstName: payload.firstName,
        lastName: payload.lastName,
        accountType: 'USER',
      })
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 403 || status === 409 || status === 400) {
          return application
        }
      }
      throw err
    }

    return application
  },

  async approve(id: string | number): Promise<void> {
    const { data } = await apiClient.post<unknown>(`/api/v1/clinic-applications/${id}/approve`)
    parseActionResponse(data)
  },

  async approveWithClinic(id: string | number, application: ClinicApplication): Promise<void> {
    await this.approve(id)

    try {
      await clinicsService.create(applicationToClinicPayload(application))
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 403 || status === 409 || status === 400) {
          return
        }
      }
      throw err
    }
  },

  async reject(id: string | number): Promise<void> {
    const { data } = await apiClient.post<unknown>(`/api/v1/clinic-applications/${id}/reject`)
    parseActionResponse(data)
  },
}
