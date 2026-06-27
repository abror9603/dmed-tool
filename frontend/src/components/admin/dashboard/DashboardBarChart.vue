<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  items: Array<{ key: string; value: number; color: string; label: string }>
  compact?: boolean
}>()

const maxValue = computed(() => {
  const peak = Math.max(...props.items.map((item) => item.value), 0)
  if (peak <= 0) return 4
  if (peak <= 4) return 4
  const exp = Math.floor(Math.log10(peak))
  const pow = 10 ** exp
  const normalized = peak / pow
  let nice: number
  if (normalized <= 1) nice = 1
  else if (normalized <= 2) nice = 2
  else if (normalized <= 5) nice = 5
  else nice = 10
  return nice * pow
})

const gridLines = computed(() => {
  const count = 4
  const step = maxValue.value / (count - 1)
  return Array.from({ length: count }, (_, index) => Math.round(maxValue.value - step * index))
})

const barHeight = computed(() => (props.compact ? 'h-28 sm:h-32' : 'h-32 sm:h-36'))
</script>

<template>
  <div class="flex h-full w-full gap-2 sm:gap-3">
    <div class="flex w-7 shrink-0 flex-col justify-between py-1 text-[10px] tabular-nums text-slate-500">
      <span v-for="tick in gridLines" :key="`tick-${tick}`">{{ tick }}</span>
    </div>

    <div class="relative min-w-0 flex-1">
      <div class="pointer-events-none absolute inset-x-0 top-1 bottom-8 flex flex-col justify-between">
        <div
          v-for="tick in gridLines"
          :key="`grid-${tick}`"
          class="border-t border-slate-700/50"
        />
      </div>

      <div class="relative flex h-full items-end gap-1.5 pb-8 pt-1 sm:gap-2">
        <div
          v-for="item in items"
          :key="item.key"
          class="group flex min-w-0 flex-1 flex-col items-center gap-2"
        >
          <span class="text-[10px] font-bold tabular-nums text-slate-300">{{ item.value }}</span>
          <div class="flex w-full items-end justify-center px-0.5" :class="barHeight">
            <div
              class="relative w-full overflow-hidden rounded-t-md bg-slate-800/80 transition-all duration-300 group-hover:brightness-110"
              :style="{
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: item.value > 0 ? '6px' : '2px',
              }"
            >
              <div
                class="absolute inset-0 rounded-t-md"
                :style="{
                  background: `linear-gradient(180deg, ${item.color} 0%, color-mix(in srgb, ${item.color} 72%, #0f172a) 100%)`,
                }"
              />
            </div>
          </div>
          <span class="w-full truncate text-center text-[10px] leading-tight text-slate-400">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
