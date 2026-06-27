import type { IncomingMessage, ServerResponse } from 'node:http'

/** HttpOnly cookie that stores the bearer token server-side (never exposed to JS). */
export const AUTH_COOKIE_NAME = 'dmed-auth-token'

const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 7

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {}
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=')
    if (!rawKey) return acc
    acc[rawKey] = decodeURIComponent(rest.join('='))
    return acc
  }, {})
}

export function getAuthTokenFromRequest(req: IncomingMessage): string | null {
  const cookies = parseCookies(req.headers.cookie)
  return cookies[AUTH_COOKIE_NAME] || null
}

export function buildAuthCookie(token: string, secure: boolean): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${DEFAULT_MAX_AGE_SEC}`,
  ]
  if (secure) {
    parts.push('Secure')
  }
  return parts.join('; ')
}

export function buildClearAuthCookie(secure: boolean): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ]
  if (secure) {
    parts.push('Secure')
  }
  return parts.join('; ')
}

const TOKEN_KEYS = ['token', 'accessToken', 'access_token', 'jwt', 'authToken'] as const

function looksLikeJwt(value: string): boolean {
  return value.split('.').length === 3
}

function tokenFromRecord(record: Record<string, unknown>): string | null {
  for (const key of TOKEN_KEYS) {
    const value = record[key]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }
  return null
}

function tokenFromEnvelopeValue(value: unknown): string | null {
  if (typeof value === 'string' && looksLikeJwt(value)) {
    return value
  }

  if (value && typeof value === 'object') {
    return tokenFromRecord(value as Record<string, unknown>)
  }

  return null
}

export function isLoginFailureBody(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false
  const root = data as Record<string, unknown>
  return root.status === false || root.success === false
}

export function loginFailureMessage(data: unknown): string {
  if (data && typeof data === 'object' && typeof (data as Record<string, unknown>).message === 'string') {
    return (data as Record<string, unknown>).message as string
  }
  return 'Login failed'
}

/** Reads bearer token from DMED envelope shapes (`object.token`, `data.token`, root `token`, etc.). */
export function extractTokenFromBody(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const root = data as Record<string, unknown>

  const fromRoot = tokenFromRecord(root)
  if (fromRoot) return fromRoot

  for (const key of ['object', 'data'] as const) {
    const token = tokenFromEnvelopeValue(root[key])
    if (token) return token
  }

  return null
}

export function stripTokenFromBody(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data
  const root = { ...(data as Record<string, unknown>) }

  for (const key of TOKEN_KEYS) {
    delete root[key]
  }

  for (const envelopeKey of ['object', 'data'] as const) {
    const nestedValue = root[envelopeKey]
    if (typeof nestedValue === 'string' && looksLikeJwt(nestedValue)) {
      root[envelopeKey] = null
      continue
    }

    if (nestedValue && typeof nestedValue === 'object') {
      const nested = { ...(nestedValue as Record<string, unknown>) }
      for (const key of TOKEN_KEYS) {
        delete nested[key]
      }
      root[envelopeKey] = nested
    }
  }

  return root
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segment = token.split('.')[1]
  if (!segment) return null

  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(normalized, 'base64').toString('utf8')
    const payload = JSON.parse(json) as unknown
    return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function userFromToken(token: string): {
  id: number
  login: string
  firstName?: string
  lastName?: string
  accountType?: string
  email?: string
} | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null

  const login =
    (typeof payload.login === 'string' && payload.login) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    (typeof payload.userName === 'string' && payload.userName) ||
    (typeof payload.username === 'string' && payload.username) ||
    (typeof payload.phoneNumber === 'string' && payload.phoneNumber) ||
    null

  if (!login) return null

  const rawId = payload.id ?? payload.userId ?? payload.user_id ?? 0
  const id = typeof rawId === 'number' ? rawId : Number(rawId) || 0

  return {
    id,
    login,
    firstName: typeof payload.firstName === 'string' ? payload.firstName : undefined,
    lastName: typeof payload.lastName === 'string' ? payload.lastName : undefined,
    accountType: typeof payload.accountType === 'string' ? payload.accountType : undefined,
    email: typeof payload.email === 'string' ? payload.email : undefined,
  }
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}
