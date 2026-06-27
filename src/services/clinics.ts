/**
 * Clinics API — paginated list and CRUD with envelope-aware response parsing.
 */
import { apiClient } from './http'
import { buildPageResult, type PaginatedResult } from './api-page'
import {
  extractRecordArray,
  parseActionResponse,
  parseApiError,
  unwrapEnvelopeObject,
} from './api-envelope'
import { DEFAULT_PAGE_SIZE } from '../utils/pagination'
import type { Clinic, ClinicPayload, ClinicsQuery } from '../types/clinic.types'

export type { Clinic, ClinicPayload, ClinicsQuery } from '../types/clinic.types'

export type ClinicsPage = PaginatedResult<Clinic>

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

function parseClinicList(data: unknown): Clinic[] {
  return extractRecordArray(data)
    .filter(isClinicLike)
    .map(normalizeClinic)
}

function parseClinicItem(data: unknown): Clinic {
  const direct = unwrapEnvelopeObject(data)
  if (direct && isClinicLike(direct)) {
    return normalizeClinic(direct)
  }

  parseApiError(data)
  throw new Error('Invalid clinic response')
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
