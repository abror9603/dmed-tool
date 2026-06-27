/**
 * Normalizes thrown values into user-facing error strings.
 *
 * Priority: mapped API codes → HTTP status → backend `message` → fallback.
 * Network failures append the target URL to aid debugging in admin settings scenarios.
 */
import { isAxiosError } from 'axios'
import { i18n } from '../i18n'
import { getResolvedApiUrl } from '../services/http'

const API_ERROR_I18N: Record<string, string> = {
  KEY_NOT_FOUND: 'errors.api.KEY_NOT_FOUND',
  PATIENT_NOT_IN_DMED: 'errors.api.PATIENT_NOT_IN_DMED',
  INVALID_CLINIC_RESPONSE: 'errors.api.INVALID_CLINIC_RESPONSE',
  'Invalid clinic response': 'errors.api.INVALID_CLINIC_RESPONSE',
  'Request failed': 'errors.api.REQUEST_FAILED',
  'Access Denied': 'errors.api.ACCESS_DENIED',
  'Network Error': 'errors.api.NETWORK_ERROR',
  'Upstream API unavailable': 'errors.api.UPSTREAM_UNAVAILABLE',
  'Invalid login response': 'errors.api.INVALID_LOGIN_RESPONSE',
  KEY_INACTIVE: 'errors.api.KEY_INACTIVE',
  KEY_EXPIRED: 'errors.api.KEY_EXPIRED',
  CLINIC_INACTIVE: 'errors.api.CLINIC_INACTIVE',
}

function translateApiKey(key: string): string | null {
  if (i18n.global.te(key)) return i18n.global.t(key)
  return null
}

function resolveMappedMessage(raw: string): string | null {
  const mappedKey = API_ERROR_I18N[raw]
  if (mappedKey) return translateApiKey(mappedKey)

  if (/^[A-Z][A-Z0-9_]+$/.test(raw)) {
    const codeKey = `errors.api.${raw}`
    if (i18n.global.te(codeKey)) return i18n.global.t(codeKey)
  }

  return null
}

function resolveHttpStatusMessage(status: number): string | null {
  if (status === 401) return translateApiKey('errors.api.UNAUTHORIZED')
  if (status === 403) return translateApiKey('errors.api.FORBIDDEN')
  if (status === 404) return translateApiKey('errors.api.NOT_FOUND')
  if (status === 502 || status === 503) return translateApiKey('errors.api.UPSTREAM_UNAVAILABLE')
  if (status >= 500) return translateApiKey('errors.api.SERVER_ERROR')
  return null
}

function extractBackendMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object' || !('message' in data)) return null
  const message = (data as { message: unknown }).message
  return typeof message === 'string' && message.trim() ? message.trim() : null
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      const target = error.config?.url || getResolvedApiUrl()
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return translateApiKey('errors.api.NETWORK_ERROR') ?? `${fallback} (${target})`
      }
      return error.message || fallback
    }

    const backendMessage = extractBackendMessage(error.response.data)
    if (backendMessage) return backendMessage

    const statusMessage = resolveHttpStatusMessage(error.response.status)
    if (statusMessage) return statusMessage

    return error.message || fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const raw = getErrorMessage(error, fallback)
  return resolveMappedMessage(raw) ?? (looksTechnical(raw) ? fallback : raw)
}

function looksTechnical(message: string): boolean {
  if (!message) return true
  if (message.includes('http://') || message.includes('https://')) return true
  if (/^[A-Z][A-Z0-9_]+$/.test(message)) return true
  if (/^(Invalid|Request failed|Network Error|Access Denied|Upstream)/.test(message)) return true
  return false
}
