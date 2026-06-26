<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex items-center justify-end">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800"
      :aria-label="t('common.refresh')"
      @click="emit('refresh')"
    >
      <RefreshCw class="h-4 w-4" :class="loading ? 'animate-spin' : ''" />
      <span>{{ t('common.refresh') }}</span>
    </button>
  </div>
</template>
