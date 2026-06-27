<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from 'lucide-vue-next'
import { confirmDialogState, resolveConfirmDialog } from '../../composables/useConfirmDialog'

const { t } = useI18n()

const icon = computed(() => {
  switch (confirmDialogState.variant) {
    case 'success':
      return CheckCircle2
    case 'danger':
      return Trash2
    case 'warning':
      return AlertTriangle
    default:
      return Info
  }
})

const iconWrapClass = computed(() => {
  switch (confirmDialogState.variant) {
    case 'success':
      return 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25'
    case 'danger':
      return 'bg-red-500/15 text-red-400 ring-red-500/25'
    case 'warning':
      return 'bg-amber-500/15 text-amber-400 ring-amber-500/25'
    default:
      return 'bg-cyan-500/15 text-cyan-400 ring-cyan-500/25'
  }
})

const confirmButtonClass = computed(() => {
  switch (confirmDialogState.variant) {
    case 'success':
      return 'bg-emerald-500 text-white hover:bg-emerald-400'
    case 'danger':
      return 'bg-red-500 text-white hover:bg-red-400'
    case 'warning':
      return 'bg-amber-500 text-slate-900 hover:bg-amber-400'
    default:
      return 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
  }
})

const confirmLabel = computed(
  () =>
    confirmDialogState.confirmLabel ??
    (confirmDialogState.alert ? t('common.understood') : t('common.confirm')),
)

const cancelLabel = computed(() => confirmDialogState.cancelLabel ?? t('common.cancel'))

function onKeydown(event: KeyboardEvent): void {
  if (!confirmDialogState.open) return
  if (event.key === 'Escape') {
    resolveConfirmDialog(false)
  }
}

watch(
  () => confirmDialogState.open,
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
        v-if="confirmDialogState.open"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="confirmDialogState.title ? 'confirm-dialog-title' : undefined"
      >
        <div
          class="absolute inset-0 bg-black/65 backdrop-blur-sm"
          @click="resolveConfirmDialog(false)"
        />

        <Transition
          appear
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="confirmDialogState.open"
            class="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-[#111b2e] shadow-2xl shadow-black/40"
          >
            <button
              type="button"
              class="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              :aria-label="t('common.cancel')"
              @click="resolveConfirmDialog(false)"
            >
              <X class="h-4 w-4" />
            </button>

            <div class="p-6 pt-7">
              <div class="flex gap-4">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1"
                  :class="iconWrapClass"
                >
                  <component :is="icon" class="h-5 w-5" />
                </div>

                <div class="min-w-0 flex-1 pr-6">
                  <h2
                    v-if="confirmDialogState.title"
                    id="confirm-dialog-title"
                    class="text-base font-bold text-white"
                  >
                    {{ confirmDialogState.title }}
                  </h2>
                  <p
                    class="text-sm leading-relaxed text-slate-300"
                    :class="confirmDialogState.title ? 'mt-2' : ''"
                  >
                    {{ confirmDialogState.message }}
                  </p>
                </div>
              </div>

              <div class="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  v-if="!confirmDialogState.alert"
                  type="button"
                  class="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800"
                  @click="resolveConfirmDialog(false)"
                >
                  {{ cancelLabel }}
                </button>
                <button
                  type="button"
                  class="rounded-xl px-4 py-2.5 text-sm font-bold transition-colors"
                  :class="confirmButtonClass"
                  @click="resolveConfirmDialog(true)"
                >
                  {{ confirmLabel }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
