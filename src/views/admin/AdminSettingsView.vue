<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Settings } from 'lucide-vue-next'
import { i18n } from '../../i18n'
import { DEFAULT_API_URL, STORAGE_KEYS } from '../../config/app'
import { useClinicsStore } from '../../stores/clinics'

const { t } = useI18n()
const clinicsStore = useClinicsStore()

const defaultApiUrl = DEFAULT_API_URL
const apiUrl = ref(localStorage.getItem(STORAGE_KEYS.API_URL) || defaultApiUrl)
const saved = ref(false)

function updateApiUrl(): void {
  localStorage.setItem(STORAGE_KEYS.API_URL, apiUrl.value)
  clinicsStore.clearMessages()
  clinicsStore.successMessage = i18n.global.t('clinics.apiUrlUpdated')
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2500)
}

function resetApiUrl(): void {
  localStorage.removeItem(STORAGE_KEYS.API_URL)
  apiUrl.value = defaultApiUrl
  saved.value = true
  clinicsStore.clearMessages()
  clinicsStore.successMessage = i18n.global.t('clinics.apiUrlReset')
  setTimeout(() => {
    saved.value = false
  }, 2500)
}
</script>

<template>
  <div class="mx-auto min-w-0 max-w-2xl space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
      <div class="mb-5 flex items-center gap-2">
        <Settings class="h-5 w-5 text-brand-primary" />
        <div>
          <h2 class="text-sm font-bold text-slate-800 dark:text-white">{{ t('admin.apiSettings') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.apiSettingsDesc') }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {{ t('common.apiUrl') }}
        </label>
        <input
          v-model="apiUrl"
          type="text"
          :placeholder="t('clinics.backendUrlPlaceholder')"
          class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-800 focus:border-brand-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
        />
        <p class="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          {{ t('clinics.ngrokHint') }}
        </p>

        <div class="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            class="rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-primary/95"
            @click="updateApiUrl"
          >
            {{ t('common.save') }}
          </button>
          <button
            type="button"
            class="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            @click="resetApiUrl"
          >
            {{ t('common.reset') }}
          </button>
        </div>

        <p
          v-if="saved"
          class="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
        >
          {{ t('clinics.apiUrlUpdated') }}
        </p>
      </div>
    </section>
  </div>
</template>
