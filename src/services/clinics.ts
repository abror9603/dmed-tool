import { apiClient } from './http'
import { buildPageResult, type PaginatedResult } from './api-page'
import { DEFAULT_PAGE_SIZE } from '../utils/pagination'

export { apiClient, getApiUrl, getResolvedApiUrl } from './http'

export interface ClinicsQuery {
  page?: number
  size?: number
}

export type ClinicsPage = PaginatedResult<Clinic>

export interface ClinicPayload {
  name: string
  address: string
  phone: string
  email: string
  contact?: string
  contactInfo?: string
}

export interface Clinic {
  id: number | string
  name: string
  address: string
  phone?: string
  contactInfo?: string
  contact?: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  secretKey: string | null
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function isClinicLike(value: Record<string, unknown>): boolean {
  return 'id' in value && ('name' in value || 'clinicName' in value)
}

function normalizeClinic(raw: Record<string, unknown>): Clinic {
  const phone =
    raw.phone ??
    raw.phoneNumber ??
    raw.phoneNumber1 ??
    raw.contactInfo ??
    raw.contact

  return {
    id: raw.id as number | string,
    name: String(raw.name ?? raw.clinicName ?? ''),
    address: String(raw.address ?? '—'),
    phone: phone ? String(phone) : undefined,
    contactInfo: raw.contactInfo ? String(raw.contactInfo) : undefined,
    contact: raw.contact ? String(raw.contact) : undefined,
    email: String(raw.email ?? ''),
    status: raw.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
    secretKey: raw.secretKey ? String(raw.secretKey) : null,
  }
}

function extractClinicArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter(isRecord)
  }

  parseApiError(data)

  if (!isRecord(data)) {
    return []
  }

  const root = data as ApiEnvelope<unknown>
  const object = root.object

  if (Array.isArray(object)) {
    return object.filter(isRecord)
  }

  if (isRecord(object)) {
    for (const key of ['content', 'items', 'data', 'clinics'] as const) {
      const value = object[key]
      if (Array.isArray(value)) {
        return value.filter(isRecord)
      }
    }
  }

  return []
}

function parseClinicList(data: unknown): Clinic[] {
  return extractClinicArray(data)
    .filter(isClinicLike)
    .map(normalizeClinic)
}

function parseClinicItem(data: unknown): Clinic {
  if (isRecord(data) && isClinicLike(data)) {
    return normalizeClinic(data)
  }

  parseApiError(data)

  if (isRecord(data)) {
    const root = data as ApiEnvelope<unknown>
    if (isRecord(root.object) && isClinicLike(root.object)) {
      return normalizeClinic(root.object)
    }
  }

  throw new Error('Invalid clinic response')
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

function parseClinicsPage(data: unknown, page: number, size: number): ClinicsPage {
  return buildPageResult(parseClinicList(data), data, page, size)
}

function buildClinicsParams(query: ClinicsQuery = {}): Record<string, number> {
  return {
    page: query.page ?? 0,
    size: query.size ?? DEFAULT_PAGE_SIZE,
  }
}

export const clinicsService = {
  async create(payload: ClinicPayload): Promise<Clinic> {
    const { data } = await apiClient.post<unknown>('/api/v1/clinics', payload)
    return parseClinicItem(data)
  },

  async getPage(query: ClinicsQuery = {}): Promise<ClinicsPage> {
    const page = query.page ?? 0
    const size = query.size ?? DEFAULT_PAGE_SIZE
    const { data } = await apiClient.get<unknown>('/api/v1/clinics', {
      params: buildClinicsParams(query),
    })
    return parseClinicsPage(data, page, size)
  },

  async getById(id: string | number): Promise<Clinic> {
    const { data } = await apiClient.get<unknown>(`/api/v1/clinics/${id}`)
    return parseClinicItem(data)
  },

  async getPageByStatus(status: 'ACTIVE' | 'INACTIVE', query: ClinicsQuery = {}): Promise<ClinicsPage> {
    const page = query.page ?? 0
    const size = query.size ?? DEFAULT_PAGE_SIZE
    const { data } = await apiClient.get<unknown>(`/api/v1/clinics/status/${status}`, {
      params: buildClinicsParams(query),
    })
    return parseClinicsPage(data, page, size)
  },

  async update(id: string | number, payload: ClinicPayload): Promise<Clinic> {
    const { data } = await apiClient.put<unknown>(`/api/v1/clinics/${id}`, payload)
    return parseClinicItem(data)
  },

  async toggleStatus(id: string | number): Promise<Clinic> {
    const { data } = await apiClient.patch<unknown>(`/api/v1/clinics/${id}/status`)
    return parseClinicItem(data)
  },

  async delete(id: string | number): Promise<void> {
    const { data } = await apiClient.delete<unknown>(`/api/v1/clinics/${id}`)
    parseActionResponse(data)
  },

  async validateKey(secretKey: string): Promise<Clinic> {
    const { data } = await apiClient.get<unknown>('/api/v1/clinics/validate-key', {
      params: { secretKey },
    })
    return parseClinicItem(data)
  },
}
