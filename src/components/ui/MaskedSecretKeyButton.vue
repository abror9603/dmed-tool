<script setup lang="ts">
import { computed } from 'vue'
import { Check, Copy } from 'lucide-vue-next'
import { SECRET_KEY_MASK_FILL, secretKeyPrefix } from '../../utils/secret-key'

const props = defineProps<{
  secretKey: string
  title?: string
  copied?: boolean
}>()

defineEmits<{ copy: [] }>()

const prefix = computed(() => secretKeyPrefix(props.secretKey))
</script>

<template>
  <div class="flex min-w-0 items-center gap-1">
    <button
      type="button"
      class="flex min-w-0 flex-1 items-center gap-0 rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-left font-mono text-[11px] text-cyan-400 transition-colors hover:border-cyan-500/40 hover:bg-slate-800"
      :title="title"
      @click="$emit('copy')"
    >
      <slot name="leading" />
      <span class="shrink-0">{{ prefix }}</span>
      <span class="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left text-cyan-400/90">
        {{ SECRET_KEY_MASK_FILL }}
      </span>
    </button>
    <button
      type="button"
      class="shrink-0 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
      :title="title"
      @click="$emit('copy')"
    >
      <Check v-if="copied" class="h-3.5 w-3.5 text-emerald-400" />
      <Copy v-else class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
