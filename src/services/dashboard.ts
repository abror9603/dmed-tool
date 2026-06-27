import { apiClient } from './http'
import type { DashboardStats } from '../types/dashboard.types'

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  object?: T
  data?: T
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

function isDashboardStats(value: unknown): value is DashboardStats {
  if (!isRecord(value)) return false
  return Boolean(value.medicalEvents && value.clinics && value.users && value.dmedSync)
}

function extractStatsPayload(data: unknown): DashboardStats {
  parseApiError(data)

  if (isDashboardStats(data)) {
    return data
  }

  if (isRecord(data)) {
    for (const key of ['object', 'data', 'result', 'stats'] as const) {
      const nested = data[key]
      if (isDashboardStats(nested)) {
        return nested
      }
    }
  }

  throw new Error('Invalid dashboard response')
}

const DASHBOARD_ENDPOINTS = [
  '/api/v1/admin/dashboard',
  '/api/v1/dashboard',
  '/api/v1/admin/stats',
] as const

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    let lastError: unknown

    for (const endpoint of DASHBOARD_ENDPOINTS) {
      try {
        const { data } = await apiClient.get<unknown>(endpoint)
        return extractStatsPayload(data)
      } catch (err) {
        lastError = err
      }
    }

    if (lastError instanceof Error) {
      throw lastError
    }

    throw new Error('Dashboard ma\'lumotlari yuklanmadi')
  },
}
