/** Default page size for admin list tables. */
export const DEFAULT_PAGE_SIZE = 10

/** 1-based row number shown in tables (replaces opaque backend IDs in the UI). */
export function rowNumber(page: number, pageSize: number, index: number): number {
  return page * pageSize + index + 1
}

export function totalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}
