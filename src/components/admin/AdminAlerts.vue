<script setup lang="ts">
import { CheckCircle2, XCircle } from 'lucide-vue-next'

defineProps<{
  error?: string | null
  success?: string | null
}>()
</script>

<template>
  <div v-if="error" class="flex items-center space-x-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-600 dark:text-red-400">
    <XCircle class="h-5 w-5 shrink-0" />
    <span>{{ error }}</span>
  </div>
  <div
    v-if="success"
    class="flex items-center space-x-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-600 dark:text-emerald-400"
  >
    <CheckCircle2 class="h-5 w-5 shrink-0" />
    <span>{{ success }}</span>
  </div>
</template>
