<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Activity, Key, Send } from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import { medicalEventsService } from '../../services/medical-events'
import { getErrorMessage } from '../../utils/errors'

const { t } = useI18n()

const secretKey = ref('')
const payloadText = ref(`{
  "patientId": "12345",
  "eventType": "DISCHARGE",
  "dischargeDate": "2026-06-26",
  "diagnosis": "I10",
  "riskScore": 72
}`)
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

  let payload: unknown
  try {
    payload = JSON.parse(payloadText.value)
  } catch {
    error.value = t('medicalEvents.invalidJson')
    return
  }

  loading.value = true
  try {
    const data = await medicalEventsService.intake(payload, secretKey.value.trim())
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
  <div class="mx-auto max-w-3xl space-y-6">
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
            {{ t('medicalEvents.payload') }}
          </label>
          <textarea
            v-model="payloadText"
            rows="12"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-900/60"
          />
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
