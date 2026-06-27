/**
 * Laboratories API — full CRUD aligned with /api/v1/labs endpoints.
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
import type { Lab, LabPayload, LabRegisterPayload, LabsQuery } from '../types/lab.types'
import type { LabApplicationApplyPayload } from './clinic-applications'

export type { Lab, LabPayload, LabRegisterPayload, LabsQuery } from '../types/lab.types'

export type LabsPage = PaginatedResult<Lab>

const LAB_LIST_KEYS = ['content', 'items', 'data', 'labs', 'labList'] as const

function isLabLike(value: Record<string, unknown>): boolean {
  return 'id' in value && ('name' in value || 'labName' in value || 'clinicName' in value)
}

function normalizeLab(raw: Record<string, unknown>): Lab {
  const phone =
    raw.phone ??
    raw.phoneNumber ??
    raw.phoneNumber1 ??
    raw.contactInfo ??
    raw.contact

  return {
    id: raw.id as number | string,
    name: String(raw.name ?? raw.labName ?? raw.clinicName ?? ''),
    address: String(raw.address ?? '—'),
    phone: phone ? String(phone) : undefined,
    contactInfo: raw.contactInfo ? String(raw.contactInfo) : undefined,
    contact: raw.contact ? String(raw.contact) : undefined,
    email: String(raw.email ?? ''),
    status: raw.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
    secretKey: raw.secretKey ? String(raw.secretKey) : null,
  }
}

function parseLabList(data: unknown): Lab[] {
  return extractRecordArray(data, LAB_LIST_KEYS)
    .filter(isLabLike)
    .map(normalizeLab)
}

function parseLabItem(data: unknown): Lab {
  const direct = unwrapEnvelopeObject(data)
  if (direct && isLabLike(direct)) {
    return normalizeLab(direct)
  }

  parseApiError(data)
  throw new Error('Invalid laboratory response')
}

function parseLabsPage(data: unknown, page: number, size: number): LabsPage {
  return buildPageResult(parseLabList(data), data, page, size)
}

function buildLabsParams(query: LabsQuery = {}): Record<string, number> {
  return {
    page: query.page ?? 0,
    size: query.size ?? DEFAULT_PAGE_SIZE,
  }
}

export function buildLabRegisterPayload(payload: LabApplicationApplyPayload): LabRegisterPayload {
  const contact = [payload.firstName, payload.lastName].filter(Boolean).join(' ')
  const login = payload.login.trim()
  const phone = payload.phoneNumber1.trim()

  return {
    name: payload.clinicName.trim(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    login,
    password: payload.password,
    phoneNumber1: phone,
    phone,
    email: `${login}@dmed.uz`,
    address: contact || 'Manzil kiritilmagan',
    contact,
  }
}

export const labsService = {
  async create(payload: LabRegisterPayload): Promise<Lab> {
    const { data } = await apiClient.post<unknown>('/api/v1/labs', payload)
    return parseLabItem(data)
  },

  async getPage(query: LabsQuery = {}): Promise<LabsPage> {
    const page = query.page ?? 0
    const size = query.size ?? DEFAULT_PAGE_SIZE
    const { data } = await apiClient.get<unknown>('/api/v1/labs', {
      params: buildLabsParams(query),
    })
    return parseLabsPage(data, page, size)
  },

  async getById(id: string | number): Promise<Lab> {
    const { data } = await apiClient.get<unknown>(`/api/v1/labs/${id}`)
    return parseLabItem(data)
  },

  async getPageByStatus(status: 'ACTIVE' | 'INACTIVE', query: LabsQuery = {}): Promise<LabsPage> {
    const page = query.page ?? 0
    const size = query.size ?? DEFAULT_PAGE_SIZE
    const { data } = await apiClient.get<unknown>(`/api/v1/labs/status/${status}`, {
      params: buildLabsParams(query),
    })
    return parseLabsPage(data, page, size)
  },

  async update(id: string | number, payload: LabPayload): Promise<Lab> {
    const { data } = await apiClient.put<unknown>(`/api/v1/labs/${id}`, payload)
    return parseLabItem(data)
  },

  async toggleStatus(id: string | number): Promise<Lab> {
    const { data } = await apiClient.patch<unknown>(`/api/v1/labs/${id}/status`)
    return parseLabItem(data)
  },

  async regenerateKey(id: string | number): Promise<Lab> {
    const { data } = await apiClient.post<unknown>(`/api/v1/labs/${id}/regenerate-key`)
    return parseLabItem(data)
  },

  async delete(id: string | number): Promise<void> {
    const { data } = await apiClient.delete<unknown>(`/api/v1/labs/${id}`)
    parseActionResponse(data)
  },
}
