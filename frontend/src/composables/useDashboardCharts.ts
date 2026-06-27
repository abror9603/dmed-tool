/**
 * Pure chart geometry helpers — no Vue reactivity, safe to unit-test in isolation.
 *
 * SVG charts consume these functions; presentation components stay thin.
 */
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

  const max = niceChartMax(Math.max(...values, 0))
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

export interface LineChartPoint {
  x: number
  y: number
  value: number
}

export interface LineChartLayout {
  width: number
  height: number
  padLeft: number
  padRight: number
  padTop: number
  padBottom: number
}

export const DEFAULT_LINE_CHART_LAYOUT: LineChartLayout = {
  width: 640,
  height: 200,
  padLeft: 28,
  padRight: 4,
  padTop: 12,
  padBottom: 28,
}

export function niceChartMax(value: number): number {
  if (value <= 0) return 4
  if (value <= 4) return 4
  const exp = Math.floor(Math.log10(value))
  const pow = 10 ** exp
  const normalized = value / pow
  let nice: number
  if (normalized <= 1) nice = 1
  else if (normalized <= 2) nice = 2
  else if (normalized <= 5) nice = 5
  else nice = 10
  return nice * pow
}

export function buildLineChartCoords(
  values: number[],
  layout: LineChartLayout = DEFAULT_LINE_CHART_LAYOUT,
): { points: LineChartPoint[]; max: number; baselineY: number } {
  const max = niceChartMax(Math.max(...values, 0))
  const innerWidth = layout.width - layout.padLeft - layout.padRight
  const innerHeight = layout.height - layout.padTop - layout.padBottom
  const baselineY = layout.padTop + innerHeight

  const points = values.map((value, index) => ({
    x: layout.padLeft + (index / Math.max(values.length - 1, 1)) * innerWidth,
    y: layout.padTop + innerHeight - (value / max) * innerHeight,
    value,
  }))

  return { points, max, baselineY }
}

export function buildSmoothLinePath(points: LineChartPoint[]): string {
  if (points.length === 0) return ''
  const firstPoint = points[0]
  if (!firstPoint) return ''
  if (points.length === 1) return `M ${firstPoint.x},${firstPoint.y}`

  let path = `M ${firstPoint.x},${firstPoint.y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i]
    const next = points[i + 1]
    if (!current || !next) continue
    const midX = (current.x + next.x) / 2
    path += ` C ${midX},${current.y} ${midX},${next.y} ${next.x},${next.y}`
  }
  return path
}

export function buildAreaPath(points: LineChartPoint[], baselineY: number): string {
  if (points.length === 0) return ''
  const linePath = buildSmoothLinePath(points)
  const last = points[points.length - 1]
  const first = points[0]
  if (!last || !first) return linePath
  return `${linePath} L ${last.x},${baselineY} L ${first.x},${baselineY} Z`
}

export function buildYTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0]
  const step = max / (count - 1)
  return Array.from({ length: count }, (_, index) => Math.round(max - step * index))
}

export function pickLabelIndices(length: number, maxLabels = 6): number[] {
  if (length <= maxLabels) {
    return Array.from({ length }, (_, index) => index)
  }
  const step = Math.ceil((length - 1) / (maxLabels - 1))
  const indices = Array.from({ length: maxLabels - 1 }, (_, index) => index * step)
  indices.push(length - 1)
  return [...new Set(indices)]
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
