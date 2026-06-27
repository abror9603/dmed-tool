<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    id?: string
    disabled?: boolean
    invalid?: boolean
    required?: boolean
    variant?: 'admin' | 'default'
  }>(),
  {
    variant: 'admin',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const selectClass = computed(() => {
  const base =
    'w-full appearance-none rounded-lg border py-2 pl-3 pr-10 text-xs outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60'

  if (props.variant === 'admin') {
    return [
      base,
      'rounded-lg border-slate-700 bg-slate-900/60 text-slate-200',
      'focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
      props.invalid ? 'border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20' : '',
    ]
  }

  return [
    base,
    'rounded-xl border-slate-200 bg-white py-3 pl-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100',
    'focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
    props.invalid ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20' : '',
  ]
})

const iconWrapClass = computed(() =>
  props.variant === 'admin'
    ? 'rounded-r-lg border-slate-700/80 bg-slate-800/50'
    : 'rounded-r-[0.65rem] border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60',
)

function onChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="relative">
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="selectClass"
      @change="onChange"
      @blur="emit('blur')"
    >
      <slot />
    </select>
    <span
      class="pointer-events-none absolute inset-y-px right-px flex w-9 items-center justify-center rounded-r-[0.45rem] border-l"
      :class="iconWrapClass"
      aria-hidden="true"
    >
      <ChevronDown class="h-3.5 w-3.5 text-slate-400" :stroke-width="2.25" />
    </span>
  </div>
</template>
