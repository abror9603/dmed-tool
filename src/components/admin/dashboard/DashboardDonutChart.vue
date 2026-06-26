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
  return 'flex w-full flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center'
})
</script>

<template>
  <div :class="rootClass">
    <div class="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
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

    <div v-if="!hideLegend" class="w-full min-w-[10rem] space-y-2 lg:w-auto lg:flex-1">
      <div
        v-for="segment in chartSegments"
        :key="`legend-${segment.key}`"
        class="flex items-center justify-between gap-3 text-xs"
      >
        <div class="flex min-w-0 items-center gap-2">
          <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: segment.color }" />
          <span class="truncate text-slate-300">{{ segment.key }}</span>
        </div>
        <span class="shrink-0 font-bold text-white">{{ segment.value }}</span>
      </div>
    </div>
  </div>
</template>
