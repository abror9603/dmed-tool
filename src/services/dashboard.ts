import { apiClient } from './http'
import { DEMO_DASHBOARD_STATS } from '../data/dashboard.demo'
import type { DashboardStats } from '../types/dashboard.types'

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

function isDashboardStats(value: unknown): value is DashboardStats {
  if (!value || typeof value !== 'object') return false
  const stats = value as DashboardStats
  return Boolean(stats.medicalEvents && stats.clinics && stats.users && stats.dmedSync)
}

function parseDashboardStats(data: unknown): DashboardStats {
  if (isDashboardStats(data)) {
    return data
  }

  parseApiError(data)

  if (data && typeof data === 'object') {
    const root = data as ApiEnvelope<unknown>
    if (isDashboardStats(root.object)) {
      return root.object
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
    for (const endpoint of DASHBOARD_ENDPOINTS) {
      try {
        const { data } = await apiClient.get<unknown>(endpoint)
        return parseDashboardStats(data)
      } catch {
        continue
      }
    }

    return {
      ...DEMO_DASHBOARD_STATS,
      generatedAt: new Date().toISOString(),
    }
  },
}
