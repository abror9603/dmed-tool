<script setup lang="ts">
import { computed } from 'vue'
import { buildDonutSegments } from '../../../composables/useDashboardCharts'

const props = defineProps<{
  segments: Array<{ key: string; value: number; color: string }>
  centerLabel?: string
  centerSubLabel?: string
  hideLegend?: boolean
  fill?: boolean
}>()

const chartSegments = computed(() => buildDonutSegments(props.segments))

const rootClass = computed(() => {
  if (props.fill) {
    return 'flex h-full w-full items-center gap-5 sm:gap-6'
  }
  if (props.hideLegend) {
    return 'inline-flex shrink-0'
  }
  return 'inline-flex items-center gap-4 sm:gap-5'
})

const chartSizeClass = computed(() =>
  props.fill ? 'h-32 w-32 shrink-0 sm:h-36 sm:w-36' : 'h-28 w-28 shrink-0 sm:h-[7.5rem] sm:w-[7.5rem]',
)
</script>

<template>
  <div :class="rootClass">
    <div class="relative shrink-0" :class="chartSizeClass">
      <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.15)" stroke-width="10" />
        <circle
          v-for="segment in chartSegments"
          :key="segment.key"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          :stroke="segment.color"
          stroke-width="10"
          stroke-linecap="round"
          :stroke-dasharray="segment.dashArray"
          :stroke-dashoffset="segment.dashOffset"
        />
      </svg>
      <div
        v-if="centerLabel"
        class="absolute inset-0 flex flex-col items-center justify-center px-2 text-center"
      >
        <span class="text-base font-black leading-none text-white sm:text-lg">{{ centerLabel }}</span>
        <span
          v-if="centerSubLabel"
          class="mt-1 text-[9px] font-bold uppercase leading-tight tracking-wide text-slate-400"
        >
          {{ centerSubLabel }}
        </span>
      </div>
    </div>

    <ul v-if="!hideLegend" class="min-w-0 shrink-0 space-y-2.5">
      <li
        v-for="segment in chartSegments"
        :key="`legend-${segment.key}`"
        class="flex items-center justify-between gap-4 text-sm"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: segment.color }" />
          <span class="truncate text-slate-300">{{ segment.key }}</span>
        </span>
        <span class="shrink-0 font-bold tabular-nums" :style="{ color: segment.color }">
          {{ segment.value }}
        </span>
      </li>
    </ul>
  </div>
</template>
