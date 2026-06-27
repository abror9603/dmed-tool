<script setup lang="ts">
import type { HttpMethod } from '../../types/docs.types'

defineProps<{
  method: HttpMethod
}>()

const methodStyles: Record<HttpMethod, string> = {
  GET: 'bg-emerald-500 text-white',
  POST: 'bg-orange-500 text-white',
  PUT: 'bg-blue-500 text-white',
  PATCH: 'bg-violet-500 text-white',
  DELETE: 'bg-red-500 text-white',
}
</script>

<template>
  <span
    class="inline-flex min-w-[52px] items-center justify-center rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
    :class="methodStyles[method]"
  >
    {{ method }}
  </span>
</template>
