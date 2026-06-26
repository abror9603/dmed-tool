<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  items: Array<{ key: string; value: number; color: string; label: string }>
}>()

const maxValue = computed(() => Math.max(...props.items.map((item) => item.value), 1))
</script>

<template>
  <div class="flex h-48 w-full items-end justify-between gap-2 sm:gap-3">
    <div
      v-for="item in items"
      :key="item.key"
      class="flex min-w-0 flex-1 flex-col items-center gap-2"
    >
      <span class="text-[10px] font-bold text-slate-300">{{ item.value }}</span>
      <div class="flex h-32 w-full items-end justify-center sm:h-36">
        <div
          class="w-full max-w-12 rounded-t-lg transition-all"
          :style="{
            height: `${(item.value / maxValue) * 100}%`,
            backgroundColor: item.color,
            minHeight: item.value > 0 ? '8px' : '0',
          }"
        />
      </div>
      <span class="text-center text-[10px] leading-tight text-slate-400">{{ item.label }}</span>
    </div>
  </div>
</template>
