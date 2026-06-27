<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  buildAreaPath,
  buildLineChartCoords,
  buildSmoothLinePath,
  buildYTicks,
  formatShortDate,
  pickLabelIndices,
  type LineChartLayout,
} from '../../../composables/useDashboardCharts'

const props = defineProps<{
  points: Array<{ date: string; count: number }>
}>()

const { t } = useI18n()
const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(640)
let resizeObserver: ResizeObserver | null = null

const layout = computed<LineChartLayout>(() => ({
  width: containerWidth.value,
  height: 200,
  padLeft: 28,
  padRight: 4,
  padTop: 12,
  padBottom: 28,
}))

const activeIndex = ref<number | null>(null)

const values = computed(() => props.points.map((point) => point.count))
const chart = computed(() => buildLineChartCoords(values.value, layout.value))
const linePath = computed(() => buildSmoothLinePath(chart.value.points))
const areaPath = computed(() => buildAreaPath(chart.value.points, chart.value.baselineY))
const yTicks = computed(() => buildYTicks(chart.value.max))

const yTickPositions = computed(() => {
  const innerHeight = layout.value.height - layout.value.padTop - layout.value.padBottom
  return yTicks.value.map((tick) => ({
    value: tick,
    y: layout.value.padTop + innerHeight - (tick / chart.value.max) * innerHeight,
  }))
})

const labelIndices = computed(() => pickLabelIndices(props.points.length, 7))
const xLabels = computed(() =>
  labelIndices.value.map((index) => ({
    index,
    x: chart.value.points[index]?.x ?? layout.value.padLeft,
    label: formatShortDate(props.points[index]?.date ?? ''),
  })),
)

const total = computed(() => values.value.reduce((sum, value) => sum + value, 0))
const peak = computed(() => Math.max(...values.value, 0))

const activePoint = computed(() =>
  activeIndex.value === null ? null : chart.value.points[activeIndex.value],
)

const activeDate = computed(() =>
  activeIndex.value === null ? '' : formatShortDate(props.points[activeIndex.value]?.date ?? ''),
)

function setActiveIndex(index: number | null): void {
  activeIndex.value = index
}

function syncContainerWidth(width: number): void {
  containerWidth.value = Math.max(Math.round(width), 280)
}

onMounted(() => {
  const element = containerRef.value
  if (!element) return

  syncContainerWidth(element.clientWidth)
  resizeObserver = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect.width
    if (width) syncContainerWidth(width)
  })
  resizeObserver.observe(element)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3 text-xs text-slate-400">
      <span>{{ t('dashboardPage.charts.summaryTotal', { total }) }}</span>
      <span>{{ t('dashboardPage.charts.summaryPeak', { peak }) }}</span>
    </div>

    <div
      v-if="points.length === 0"
      class="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/20 text-sm text-slate-500"
    >
      {{ t('dashboardPage.charts.noData') }}
    </div>

    <div v-else ref="containerRef" class="relative w-full">
      <svg
        :viewBox="`0 0 ${layout.width} ${layout.height}`"
        class="block h-52 w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        :aria-label="t('dashboardPage.charts.last30Days')"
        @mouseleave="setActiveIndex(null)"
      >
        <defs>
          <linearGradient id="dashboardLineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#22d3ee" />
          </linearGradient>
          <linearGradient id="dashboardLineFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(34, 211, 238, 0.28)" />
            <stop offset="100%" stop-color="rgba(34, 211, 238, 0)" />
          </linearGradient>
        </defs>

        <g aria-hidden="true">
          <line
            v-for="tick in yTickPositions"
            :key="`grid-${tick.value}`"
            :x1="layout.padLeft"
            :y1="tick.y"
            :x2="layout.width - layout.padRight"
            :y2="tick.y"
            stroke="rgba(148, 163, 184, 0.12)"
            stroke-width="1"
          />
        </g>

        <g aria-hidden="true">
          <text
            v-for="tick in yTickPositions"
            :key="`ylabel-${tick.value}`"
            :x="layout.padLeft - 6"
            :y="tick.y + 4"
            text-anchor="end"
            class="fill-slate-500 text-[10px]"
          >
            {{ tick.value }}
          </text>
        </g>

        <path
          v-if="areaPath"
          :d="areaPath"
          fill="url(#dashboardLineFill)"
          stroke="none"
        />

        <path
          v-if="linePath"
          :d="linePath"
          fill="none"
          stroke="url(#dashboardLineStroke)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <g>
          <circle
            v-for="(point, index) in chart.points"
            :key="`${index}-${point.value}`"
            :cx="point.x"
            :cy="point.y"
            :r="activeIndex === index ? 5 : 3.5"
            :fill="activeIndex === index ? '#22d3ee' : '#0f172a'"
            :stroke="activeIndex === index ? '#ffffff' : '#38bdf8'"
            :stroke-width="activeIndex === index ? 2 : 1.5"
            class="cursor-pointer transition-all duration-150"
            @mouseenter="setActiveIndex(index)"
          />
        </g>

        <g aria-hidden="true">
          <text
            v-for="item in xLabels"
            :key="`xlabel-${item.index}`"
            :x="item.x"
            :y="layout.height - 8"
            text-anchor="middle"
            class="fill-slate-500 text-[10px]"
          >
            {{ item.label }}
          </text>
        </g>

        <g v-if="activePoint">
          <line
            :x1="activePoint.x"
            :y1="layout.padTop"
            :x2="activePoint.x"
            :y2="chart.baselineY"
            stroke="rgba(34, 211, 238, 0.35)"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
        </g>
      </svg>

      <div
        v-if="activePoint && activeIndex !== null"
        class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-cyan-500/30 bg-[#0b1324]/95 px-2.5 py-1.5 text-[11px] shadow-lg shadow-black/30"
        :style="{
          left: `${(activePoint.x / layout.width) * 100}%`,
          top: `${Math.max((activePoint.y / layout.height) * 100 - 18, 4)}%`,
        }"
      >
        <p class="font-semibold text-white">{{ activeDate }}</p>
        <p class="mt-0.5 text-cyan-300">{{ t('dashboardPage.charts.eventsCount', { count: activePoint.value }) }}</p>
      </div>
    </div>
  </div>
</template>
