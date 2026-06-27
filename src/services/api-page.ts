/**
 * Normalizes list API responses that may be a plain array or a Spring-style page envelope.
 * Falls back to client-side slicing when the backend returns the full collection at once.
 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  size: number
}

function extractServerTotal(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null

  const root = data as Record<string, unknown>
  const candidates: unknown[] = [root, root.object, root.data, root.result]

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue
    const pageObj = candidate as Record<string, unknown>
    if (typeof pageObj.totalElements === 'number') return pageObj.totalElements
    if (typeof pageObj.total === 'number') return pageObj.total
    if (typeof pageObj.count === 'number') return pageObj.count
  }

  if (typeof root.totalElements === 'number') return root.totalElements
  if (typeof root.total === 'number') return root.total

  return null
}

export function buildPageResult<T>(
  items: T[],
  data: unknown,
  page: number,
  size: number,
): PaginatedResult<T> {
  const serverTotal = extractServerTotal(data)

  if (serverTotal !== null) {
    return { items, total: serverTotal, page, size }
  }

  const total = items.length
  const start = page * size
  return {
    items: items.slice(start, start + size),
    total,
    page,
    size,
  }
}
