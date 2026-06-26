export const STORAGE_KEYS = {
  API_URL: 'dmed-api-url',
  THEME: 'dmed-theme',
  AUTH_TOKEN: 'dmed-auth-token',
  AUTH_USER: 'dmed-auth-user',
  LOCALE: 'dmed-locale',
} as const

export const DEFAULT_API_URL = 'https://3ed4-185-139-137-95.ngrok-free.app'

export function normalizeApiUrl(url: string): string {
  return url.trim().replace(/\/$/, '')
}
