<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Copy } from 'lucide-vue-next'

const props = defineProps<{
  code: string
  copyId: string
}>()

const { t } = useI18n()
const copied = ref(false)

async function copyCode(): Promise<void> {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
      :aria-label="copied ? t('common.copied') : t('common.copy')"
      @click="copyCode"
    >
      <Check v-if="copied" class="h-4 w-4 text-emerald-400" />
      <Copy v-else class="h-4 w-4" />
    </button>
    <pre class="overflow-x-auto whitespace-pre-wrap break-words p-4 text-[12px] leading-relaxed text-slate-200"><code>{{ code }}</code></pre>
  </div>
</template>
