<script setup lang="ts">
import { computed, inject, type Ref, ref } from 'vue'
import { BRAND_LOGO_PATH, BRAND_NAME } from '../../config/app'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    subtitle?: string
    /** Always-on-dark surfaces (e.g. admin sidebar) — boosts logo contrast */
    onDark?: boolean
  }>(),
  {
    size: 'md',
    onDark: false,
  },
)

const theme = inject<Ref<'light' | 'dark'>>('theme', ref('dark'))

const isOnDarkSurface = computed(() => props.onDark || theme.value === 'dark')

const sizeClass = {
  sm: 'h-7 sm:h-8',
  md: 'h-9 sm:h-10',
  lg: 'h-11 sm:h-12',
} as const
</script>

<template>
  <div class="min-w-0">
    <img
      :src="BRAND_LOGO_PATH"
      :alt="BRAND_NAME"
      class="w-auto max-w-full object-contain object-left"
      :class="[sizeClass[size], isOnDarkSurface && 'brightness-110 contrast-105']"
    />
    <p
      v-if="subtitle"
      class="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
