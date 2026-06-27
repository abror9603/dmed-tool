<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Building2, FlaskConical, X } from 'lucide-vue-next'
import type { LabsStats } from '../../../types/dashboard.types'

const props = defineProps<{
  open: boolean
  type: 'clinics' | 'labs' | null
  clinics?: {
    total: number
    active: number
    inactive: number
  }
  labs?: LabsStats
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const entityStats = computed(() => {
  if (props.type === 'clinics' && props.clinics) return props.clinics
  if (props.type === 'labs' && props.labs) return props.labs
  return null
})

const title = computed(() => {
  if (props.type === 'clinics') return t('dashboardPage.modals.clinicsTitle')
  if (props.type === 'labs') return t('dashboardPage.modals.labsTitle')
  return ''
})

const icon = computed(() => (props.type === 'labs' ? FlaskConical : Building2))

const iconAccent = computed(() =>
  props.type === 'labs' ? 'bg-teal-500/15 text-teal-400 ring-teal-500/25' : 'bg-blue-500/15 text-blue-400 ring-blue-500/25',
)

function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && entityStats"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open && entityStats"
            class="w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#111b2e] p-6 shadow-2xl shadow-black/40"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-xl ring-1"
                  :class="iconAccent"
                >
                  <component :is="icon" class="h-5 w-5" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white">{{ title }}</h3>
                  <p class="mt-0.5 text-xs text-slate-400">{{ t('dashboardPage.modals.subtitle') }}</p>
                </div>
              </div>
              <button
                type="button"
                class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                :aria-label="t('common.cancel')"
                @click="emit('close')"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <div class="mt-6 grid grid-cols-3 gap-3">
              <div class="rounded-xl border border-slate-700/70 bg-slate-900/50 px-3 py-4 text-center">
                <p class="text-2xl font-black text-white">{{ entityStats.total }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {{ t('dashboardPage.modals.total') }}
                </p>
              </div>
              <div class="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-4 text-center">
                <p class="text-2xl font-black text-emerald-400">{{ entityStats.active }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {{ t('dashboardPage.modals.active') }}
                </p>
              </div>
              <div class="rounded-xl border border-slate-600/40 bg-slate-800/50 px-3 py-4 text-center">
                <p class="text-2xl font-black text-slate-300">{{ entityStats.inactive }}</p>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {{ t('dashboardPage.modals.inactive') }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="mt-6 w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400"
              @click="emit('close')"
            >
              {{ t('common.understood') }}
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
