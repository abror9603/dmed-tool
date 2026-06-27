/**
 * Dashboard statistics API.
 *
 * The backend may wrap payloads in different envelope keys (`object`, `data`, etc.).
 * Runtime guards here keep the UI decoupled from response-shape drift.
 */
import { apiClient } from './http'
import type { DashboardStats } from '../types/dashboard.types'

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  object?: T
  data?: T
}

/** Backend convention: `{ success: false, message }` instead of HTTP 4xx for some errors. */
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

/** Minimum shape required before the dashboard view can render safely. */
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

const DASHBOARD_ENDPOINT = '/api/v1/admin/dashboard'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<unknown>(DASHBOARD_ENDPOINT)
    return extractStatsPayload(data)
  },
}
