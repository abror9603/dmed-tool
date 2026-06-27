/**
 * Shared helpers for backend response envelopes and paginated list shapes.
 *
 * Many endpoints return `{ success, message, object }` or Spring-style `{ content, totalElements }`.
 * Centralizing parsers here keeps services thin and consistent.
 */

export interface ApiEnvelope<T = unknown> {
  success?: boolean
  message?: string
  object?: T
  data?: T
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Throws when the backend signals failure inside a 2xx body. */
export function parseApiError(data: unknown): void {
  if (!isRecord(data)) return
  const root = data as ApiEnvelope
  if (root.success === false) {
    throw new Error(root.message || 'Request failed')
  }
}

/** Accepts empty bodies and explicit `{ success: true }` action responses. */
export function parseActionResponse(data: unknown): void {
  if (data == null) return
  if (isRecord(data) && Object.keys(data).length === 0) return

  parseApiError(data)

  if (isRecord(data) && (data as ApiEnvelope).success === true) return
}

const DEFAULT_LIST_KEYS = ['content', 'items', 'data', 'clinics', 'applications', 'users', 'userList'] as const

/**
 * Extracts row arrays from plain arrays or nested page envelopes.
 * `nestedKeys` can be extended per domain when the backend uses custom property names.
 */
export function extractRecordArray(
  data: unknown,
  nestedKeys: readonly string[] = DEFAULT_LIST_KEYS,
): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter(isRecord)
  }

  parseApiError(data)

  if (!isRecord(data)) return []

  const envelope = data as ApiEnvelope
  if (Array.isArray(envelope.object)) {
    return envelope.object.filter(isRecord)
  }

  if (isRecord(envelope.object)) {
    for (const key of nestedKeys) {
      const value = envelope.object[key]
      if (Array.isArray(value)) return value.filter(isRecord)
    }
  }

  for (const key of nestedKeys) {
    const value = data[key]
    if (Array.isArray(value)) return value.filter(isRecord)
  }

  return []
}

/** Returns `object` when wrapped, otherwise the root record. */
export function unwrapEnvelopeObject(data: unknown): Record<string, unknown> | null {
  if (!isRecord(data)) return null
  if (isRecord(data.object)) return data.object
  return data
}
