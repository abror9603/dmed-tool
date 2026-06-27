/**
 * Clinic applications API — public apply flow and admin approve/reject actions.
 *
 * Approval may return a one-time `secretKey` in the response envelope; lab applications
 * skip automatic clinic creation on approve.
 */
import { apiClient } from './http'
import { clinicsService } from './clinics'
import type { ClinicPayload } from '../types/clinic.types'
import type { ApplicationType } from '../types/application.types'
import type { ClinicType } from '../types/clinic.types'
import { isAxiosError } from 'axios'
import { buildPageResult, type PaginatedResult } from './api-page'
import {
  extractRecordArray,
  isRecord,
  parseActionResponse,
  parseApiError,
  unwrapEnvelopeObject,
} from './api-envelope'
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

export interface ApproveApplicationResult {
  secretKey?: string
  secretKeyExpiresAt?: string
}

function isApplicationLike(value: Record<string, unknown>): boolean {
  return 'id' in value && 'status' in value
}

function extractApproveResult(data: unknown): ApproveApplicationResult {
  const direct = unwrapEnvelopeObject(data) ?? (isRecord(data) ? data : null)
  if (!direct) return {}

  return {
    secretKey: typeof direct.secretKey === 'string' ? direct.secretKey : undefined,
    secretKeyExpiresAt:
      typeof direct.secretKeyExpiresAt === 'string' ? direct.secretKeyExpiresAt : undefined,
  }
}

function parseApplicationList(data: unknown): ClinicApplication[] {
  return extractRecordArray(data)
    .filter(isApplicationLike)
    .map((row) => row as unknown as ClinicApplication)
}

function parseApplicationItem(data: unknown): ClinicApplication {
  const direct = unwrapEnvelopeObject(data)
  if (direct && isApplicationLike(direct)) {
    return direct as unknown as ClinicApplication
  }

  parseApiError(data)
  throw new Error('Invalid application response')
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

  async approve(id: string | number): Promise<ApproveApplicationResult> {
    const { data } = await apiClient.post<unknown>(`/api/v1/clinic-applications/${id}/approve`)
    parseActionResponse(data)
    return extractApproveResult(data)
  },

  async approveWithClinic(
    id: string | number,
    application: ClinicApplication,
  ): Promise<ApproveApplicationResult> {
    const result = await this.approve(id)

    try {
      await clinicsService.create(applicationToClinicPayload(application))
    } catch (err) {
      // Clinic may already exist after a partial approve — keep the secret key result.
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 403 || status === 409 || status === 400) {
          return result
        }
      }
      throw err
    }

    return result
  },

  async approveApplication(
    id: string | number,
    application: ClinicApplication,
  ): Promise<ApproveApplicationResult> {
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
