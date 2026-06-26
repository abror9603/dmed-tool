<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Activity, Key, Send, User, Stethoscope, FileText } from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import { medicalEventsService } from '../../services/medical-events'
import { getErrorMessage } from '../../utils/errors'

const { t } = useI18n()

const secretKey = ref('')
const jshshir = ref('')
const diagnosis = ref('')
const conclusion = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const responseText = ref('')

function clearMessages(): void {
  error.value = null
  successMessage.value = null
}

async function submitIntake(): Promise<void> {
  clearMessages()
  responseText.value = ''

  if (!secretKey.value.trim()) {
    error.value = t('medicalEvents.secretKeyRequired')
    return
  }

  if (!jshshir.value.trim() || !diagnosis.value.trim() || !conclusion.value.trim()) {
    error.value = t('medicalEvents.fillRequired')
    return
  }

  loading.value = true
  try {
    const data = await medicalEventsService.intake(
      {
        jshshir: jshshir.value.trim(),
        diagnosis: diagnosis.value.trim(),
        conclusion: conclusion.value.trim(),
      },
      secretKey.value.trim(),
    )
    successMessage.value = t('medicalEvents.success')
    responseText.value = JSON.stringify(data, null, 2)
  } catch (err) {
    error.value = getErrorMessage(err, t('medicalEvents.failed'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto min-w-0 max-w-3xl space-y-6">
    <AdminAlerts :error="error" :success="successMessage" />

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
      <div class="mb-5 flex items-start gap-3">
        <Activity class="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
        <div>
          <h2 class="text-sm font-bold text-slate-800 dark:text-white">{{ t('medicalEvents.title') }}</h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ t('medicalEvents.subtitle') }}</p>
        </div>
      </div>

      <form class="space-y-4" @submit.prevent="submitIntake">
        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('medicalEvents.secretKey') }}
          </label>
          <div class="relative">
            <Key class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              v-model="secretKey"
              type="text"
              required
              :placeholder="t('clinics.secretKeyPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 font-mono text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
          <p class="mt-1 text-[11px] text-slate-500">{{ t('medicalEvents.secretKeyHint') }}</p>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('medicalEvents.jshshir') }} *
          </label>
          <div class="relative">
            <User class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              v-model="jshshir"
              type="text"
              required
              inputmode="numeric"
              maxlength="14"
              :placeholder="t('medicalEvents.jshshirPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('medicalEvents.diagnosis') }} *
          </label>
          <div class="relative">
            <Stethoscope class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              v-model="diagnosis"
              type="text"
              required
              :placeholder="t('medicalEvents.diagnosisPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('medicalEvents.conclusion') }} *
          </label>
          <div class="relative">
            <FileText class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <textarea
              v-model="conclusion"
              rows="4"
              required
              :placeholder="t('medicalEvents.conclusionPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
        </div>

        <button
          type="submit"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-primary/95 disabled:opacity-60"
          :disabled="loading"
        >
          <Send class="h-4 w-4" />
          <span>{{ loading ? t('medicalEvents.sending') : t('medicalEvents.send') }}</span>
        </button>
      </form>
    </section>

    <section
      v-if="responseText"
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card"
    >
      <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('medicalEvents.response') }}</h3>
      <pre class="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[11px] leading-relaxed text-emerald-400">{{ responseText }}</pre>
    </section>
  </div>
</template>
