import { apiClient } from './http'
import { clinicsService, type ClinicPayload } from './clinics'
import type { ApplicationType } from '../types/application.types'
import type { ClinicType } from '../types/clinic.types'
import { isAxiosError } from 'axios'
import { buildPageResult, type PaginatedResult } from './api-page'
import { DEFAULT_PAGE_SIZE } from '../utils/pagination'

export type { ClinicType } from '../types/clinic.types'
export type { ApplicationType } from '../types/application.types'
export { CLINIC_TYPES } from '../types/clinic.types'

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ApplicationsQuery {
  page?: number
  size?: number
}

export interface BaseApplicationApplyPayload {
  clinicName: string
  firstName: string
  lastName: string
  login: string
  password: string
  phoneNumber1: string
}

export interface ClinicApplicationApplyPayload extends BaseApplicationApplyPayload {
  applicationType?: 'CLINIC'
  clinicType: ClinicType
  phoneNumber2: string
}

export interface LabApplicationApplyPayload extends BaseApplicationApplyPayload {
  applicationType: 'LAB'
  phoneNumber2?: string
}

export type ApplicationApplyPayload = ClinicApplicationApplyPayload | LabApplicationApplyPayload

export interface ClinicApplication {
  id: string | number
  applicationType?: ApplicationType
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

export type ApplicationsPage = PaginatedResult<ClinicApplication>

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function extractSecretKey(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined
  if (typeof data.secretKey === 'string') return data.secretKey
  const nested = data.object
  if (isRecord(nested) && typeof nested.secretKey === 'string') {
    return nested.secretKey
  }
  return undefined
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

export function isLabApplication(app: ClinicApplication): boolean {
  return app.applicationType === 'LAB'
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

function parseApplicationsPage(data: unknown, page: number, size: number): ApplicationsPage {
  return buildPageResult(parseApplicationList(data), data, page, size)
}

function buildApplicationsParams(
  status: ApplicationStatus | undefined,
  query: ApplicationsQuery = {},
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page ?? 0,
    size: query.size ?? DEFAULT_PAGE_SIZE,
  }
  if (status) params.status = status
  return params
}

export const clinicApplicationsService = {
  async getPage(status?: ApplicationStatus, query: ApplicationsQuery = {}): Promise<ApplicationsPage> {
    const page = query.page ?? 0
    const size = query.size ?? DEFAULT_PAGE_SIZE
    const { data } = await apiClient.get<unknown>('/api/v1/clinic-applications', {
      params: buildApplicationsParams(status, query),
    })
    return parseApplicationsPage(data, page, size)
  },

  async apply(payload: ApplicationApplyPayload): Promise<ClinicApplication> {
    const { data } = await apiClient.post<unknown>('/api/v1/clinic-applications/apply', payload)
    return parseApplicationItem(data)
  },

  async approve(id: string | number): Promise<string | undefined> {
    const { data } = await apiClient.post<unknown>(`/api/v1/clinic-applications/${id}/approve`)
    parseActionResponse(data)
    return extractSecretKey(data)
  },

  async approveWithClinic(id: string | number, application: ClinicApplication): Promise<string | undefined> {
    const secretKey = await this.approve(id)

    try {
      await clinicsService.create(applicationToClinicPayload(application))
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 403 || status === 409 || status === 400) {
          return secretKey
        }
      }
      throw err
    }

    return secretKey
  },

  async approveApplication(id: string | number, application: ClinicApplication): Promise<string | undefined> {
    if (isLabApplication(application)) {
      return this.approve(id)
    }
    return this.approveWithClinic(id, application)
  },

  async reject(id: string | number): Promise<void> {
    const { data } = await apiClient.post<unknown>(`/api/v1/clinic-applications/${id}/reject`)
    parseActionResponse(data)
  },
}
