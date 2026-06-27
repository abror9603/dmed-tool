<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { totalPages } from '../../utils/pagination'

const props = defineProps<{
  page: number
  total: number
  pageSize: number
  loading?: boolean
}>()

const emit = defineEmits<{
  change: [page: number]
}>()

const { t } = useI18n()

const pages = computed(() => totalPages(props.total, props.pageSize))
const hasMultiplePages = computed(() => pages.value > 1)

function goToPage(nextPage: number): void {
  if (nextPage < 0 || nextPage >= pages.value || nextPage === props.page || props.loading) return
  emit('change', nextPage)
}
</script>

<template>
  <div
    v-if="total > 0"
    class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/80 px-4 py-3"
  >
    <p class="text-xs text-slate-500">
      {{ t('common.pagination', { page: page + 1, total: pages, count: total }) }}
    </p>
    <div v-if="hasMultiplePages" class="flex gap-2">
      <button
        type="button"
        class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200 disabled:opacity-40"
        :disabled="page <= 0 || loading"
        @click="goToPage(page - 1)"
      >
        {{ t('common.prevPage') }}
      </button>
      <button
        type="button"
        class="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200 disabled:opacity-40"
        :disabled="page >= pages - 1 || loading"
        @click="goToPage(page + 1)"
      >
        {{ t('common.nextPage') }}
      </button>
    </div>
  </div>
</template>
