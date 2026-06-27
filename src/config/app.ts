/**
 * Application-wide constants and environment helpers.
 *
 * Keep cross-cutting config here so services/stores do not hard-code
 * storage keys or default backend URLs in multiple places.
 */
export const STORAGE_KEYS = {
  API_URL: 'dmed-api-url',
  THEME: 'dmed-theme',
  AUTH_TOKEN: 'dmed-auth-token',
  AUTH_USER: 'dmed-auth-user',
  LOCALE: 'dmed-locale',
} as const

export const DEFAULT_API_URL = 'https://3ed4-185-139-137-95.ngrok-free.app'

export const BRAND_NAME = 'DMED Tool'
export const BRAND_LOGO_PATH = '/images/dmed-tool-logo.png'

/** Strip trailing slash so URL concatenation in the HTTP client stays predictable. */
export function normalizeApiUrl(url: string): string {
  return url.trim().replace(/\/$/, '')
}
