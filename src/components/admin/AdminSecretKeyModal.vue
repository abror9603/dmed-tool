<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Copy, KeyRound, X } from 'lucide-vue-next'
import { closeSecretKeyDialog, secretKeyDialogState } from '../../composables/useSecretKeyDialog'
import { copySecretKey } from '../../utils/secret-key'

const { t } = useI18n()
const copied = ref(false)

const copyLabel = computed(
  () => secretKeyDialogState.copyLabel ?? t('applications.secretKeyModalCopy'),
)
const copiedLabel = computed(
  () => secretKeyDialogState.copiedLabel ?? t('applications.secretKeyModalCopied'),
)
const closeLabel = computed(
  () => secretKeyDialogState.closeLabel ?? t('applications.secretKeyModalClose'),
)

async function handleCopy(): Promise<void> {
  if (!secretKeyDialogState.secretKey) return
  await copySecretKey(secretKeyDialogState.secretKey)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function onKeydown(event: KeyboardEvent): void {
  if (!secretKeyDialogState.open) return
  if (event.key === 'Escape') {
    closeSecretKeyDialog()
  }
}

watch(
  () => secretKeyDialogState.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) copied.value = false
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
        v-if="secretKeyDialogState.open"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="secret-key-dialog-title"
      >
        <div class="absolute inset-0 bg-black/65 backdrop-blur-sm" @click="closeSecretKeyDialog" />

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
            v-if="secretKeyDialogState.open"
            class="relative w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#111b2e] shadow-2xl shadow-black/40"
          >
            <button
              type="button"
              class="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              :aria-label="closeLabel"
              @click="closeSecretKeyDialog"
            >
              <X class="h-4 w-4" />
            </button>

            <div class="p-6 pt-7">
              <div class="flex gap-4">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
                >
                  <KeyRound class="h-5 w-5" />
                </div>

                <div class="min-w-0 flex-1 pr-6">
                  <h2 id="secret-key-dialog-title" class="text-base font-bold text-white">
                    {{ secretKeyDialogState.title }}
                  </h2>
                  <p class="mt-2 text-sm leading-relaxed text-slate-300">
                    {{ secretKeyDialogState.message }}
                  </p>
                </div>
              </div>

              <div class="mt-5 rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {{ t('applications.secretKeyModalKeyLabel') }}
                </p>
                <code
                  class="mt-2 block break-all font-mono text-sm leading-relaxed text-cyan-300 select-all"
                >
                  {{ secretKeyDialogState.secretKey }}
                </code>
                <p
                  v-if="secretKeyDialogState.expiresAt"
                  class="mt-3 text-[11px] text-slate-500"
                >
                  {{ t('applications.secretKeyModalExpires', { date: secretKeyDialogState.expiresAt }) }}
                </p>
              </div>

              <div class="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20"
                  @click="handleCopy"
                >
                  <Check v-if="copied" class="h-4 w-4 text-emerald-400" />
                  <Copy v-else class="h-4 w-4" />
                  {{ copied ? copiedLabel : copyLabel }}
                </button>
                <button
                  type="button"
                  class="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
                  @click="closeSecretKeyDialog"
                >
                  {{ closeLabel }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
