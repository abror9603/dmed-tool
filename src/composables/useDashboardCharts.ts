export interface ChartSegment {
  key: string
  value: number
  percent: number
  color: string
  dashArray: string
  dashOffset: number
}

export function buildDonutSegments(
  entries: Array<{ key: string; value: number; color: string }>,
): ChartSegment[] {
  const total = entries.reduce((sum, item) => sum + item.value, 0) || 1
  const circumference = 2 * Math.PI * 42
  let offset = 0

  return entries
    .filter((item) => item.value > 0)
    .map((item) => {
      const percent = item.value / total
      const length = percent * circumference
      const segment: ChartSegment = {
        key: item.key,
        value: item.value,
        percent,
        color: item.color,
        dashArray: `${length} ${circumference - length}`,
        dashOffset: -offset,
      }
      offset += length
      return segment
    })
}

export function buildLinePoints(
  values: number[],
  width: number,
  height: number,
  padding = 12,
): string {
  if (values.length === 0) return ''

  const max = Math.max(...values, 1)
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * innerWidth
      const y = padding + innerHeight - (value / max) * innerHeight
      return `${x},${y}`
    })
    .join(' ')
}

export function formatDashboardTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatShortDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('uz-UZ', { month: '2-digit', day: '2-digit' })
}

export function percentOf(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}
