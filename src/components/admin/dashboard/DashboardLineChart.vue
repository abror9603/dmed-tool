<script setup lang="ts">
import { computed } from 'vue'
import { buildLinePoints, formatShortDate } from '../../../composables/useDashboardCharts'

const props = defineProps<{
  points: Array<{ date: string; count: number }>
}>()

const values = computed(() => props.points.map((point) => point.count))
const linePoints = computed(() => buildLinePoints(values.value, 320, 120))
const labels = computed(() => props.points.map((point) => formatShortDate(point.date)))
const visibleLabels = computed(() => {
  if (labels.value.length <= 6) return labels.value
  const step = Math.ceil(labels.value.length / 6)
  return labels.value.filter((_, index) => index % step === 0 || index === labels.value.length - 1)
})
</script>

<template>
  <div class="space-y-3">
    <svg viewBox="0 0 320 120" class="h-32 w-full">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3B82F6" />
          <stop offset="100%" stop-color="#06B6D4" />
        </linearGradient>
      </defs>
      <g stroke="rgba(148,163,184,0.12)" stroke-width="1">
        <line x1="12" y1="20" x2="308" y2="20" />
        <line x1="12" y1="50" x2="308" y2="50" />
        <line x1="12" y1="80" x2="308" y2="80" />
        <line x1="12" y1="108" x2="308" y2="108" />
      </g>
      <polyline
        v-if="linePoints"
        fill="none"
        stroke="url(#lineGradient)"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        :points="linePoints"
      />
      <circle
        v-for="(value, index) in values"
        :key="`${index}-${value}`"
        :cx="12 + (index / Math.max(values.length - 1, 1)) * 296"
        :cy="12 + 96 - (value / Math.max(...values, 1)) * 96"
        r="4"
        fill="#3B82F6"
        stroke="#0f172a"
        stroke-width="2"
      />
    </svg>
    <div class="flex justify-between text-[10px] text-slate-500">
      <span v-for="label in visibleLabels" :key="label">{{ label }}</span>
    </div>
  </div>
</template>
