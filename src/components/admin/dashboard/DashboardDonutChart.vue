<script setup lang="ts">
import { computed } from 'vue'
import { buildDonutSegments } from '../../../composables/useDashboardCharts'

const props = defineProps<{
  segments: Array<{ key: string; value: number; color: string }>
  centerLabel?: string
  centerSubLabel?: string
  hideLegend?: boolean
}>()

const chartSegments = computed(() => buildDonutSegments(props.segments))

const rootClass = computed(() => {
  if (props.hideLegend) {
    return 'inline-flex shrink-0'
  }
  return 'inline-flex items-center gap-4 sm:gap-5'
})
</script>

<template>
  <div :class="rootClass">
    <div class="relative h-28 w-28 shrink-0 sm:h-[7.5rem] sm:w-[7.5rem]">
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

    <ul v-if="!hideLegend" class="min-w-[9.5rem] shrink-0 space-y-1.5">
      <li
        v-for="segment in chartSegments"
        :key="`legend-${segment.key}`"
        class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 text-xs"
      >
        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: segment.color }" />
        <span class="truncate text-slate-300">{{ segment.key }}</span>
        <span class="font-bold tabular-nums text-white">{{ segment.value }}</span>
      </li>
    </ul>
  </div>
</template>
