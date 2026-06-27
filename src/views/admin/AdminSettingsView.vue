<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessageSquare, Settings } from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import { DEFAULT_API_URL, STORAGE_KEYS } from '../../config/app'
import { clinicsService } from '../../services/clinics'
import { sendTestSms, TEST_SMS_RECIPIENTS, type TestSmsRecipient } from '../../services/sms'
import { getApiErrorMessage } from '../../utils/errors'
import { isValidJshshir, JSHSHIR_LENGTH } from '../../utils/jshshir'

const { t } = useI18n()

const defaultApiUrl = DEFAULT_API_URL
const apiUrl = ref(localStorage.getItem(STORAGE_KEYS.API_URL) || defaultApiUrl)
const successMessage = ref<string | null>(null)

const secretKey = ref('')
const diagnosis = ref('')
const conclusion = ref('')
const recipientJshshirs = reactive<Record<string, string>>(
  Object.fromEntries(TEST_SMS_RECIPIENTS.map((recipient) => [recipient.id, recipient.jshshir])),
)
const testSuccessMessage = ref<string | null>(null)
const testErrorMessage = ref<string | null>(null)
const keyValidationMessage = ref<string | null>(null)
const sendingRecipientId = ref<string | null>(null)
const validatingKey = ref(false)

async function validateSecretKey(): Promise<void> {
  if (!secretKey.value.trim()) {
    testErrorMessage.value = t('medicalEvents.secretKeyRequired')
    return
  }

  validatingKey.value = true
  keyValidationMessage.value = null
  testErrorMessage.value = null

  try {
    const clinic = await clinicsService.validateKey(secretKey.value.trim())
    const clinicName = clinic.name || t('admin.testingKeyValidFallback')
    keyValidationMessage.value = t('admin.testingKeyValid', { name: clinicName })
  } catch (err) {
    testErrorMessage.value = getApiErrorMessage(err, t('clinics.validateKeyError'))
  } finally {
    validatingKey.value = false
  }
}

function updateApiUrl(): void {
  localStorage.setItem(STORAGE_KEYS.API_URL, apiUrl.value)
  successMessage.value = t('clinics.apiUrlUpdated')
}

function resetApiUrl(): void {
  localStorage.removeItem(STORAGE_KEYS.API_URL)
  apiUrl.value = defaultApiUrl
  successMessage.value = t('clinics.apiUrlReset')
}

function validateSharedPayload(): string | null {
  if (!secretKey.value.trim()) {
    return t('medicalEvents.secretKeyRequired')
  }
  if (!diagnosis.value.trim() || !conclusion.value.trim()) {
    return t('medicalEvents.fillRequired')
  }
  return null
}

function validateRecipientJshshir(recipient: TestSmsRecipient): string | null {
  const sharedError = validateSharedPayload()
  if (sharedError) return sharedError

  const jshshir = recipientJshshirs[recipient.id]?.trim() ?? ''
  if (!jshshir) {
    return t('admin.testingRecipientJshshirRequired', { name: recipient.name })
  }
  if (!isValidJshshir(jshshir)) {
    return t('admin.testingJshshirInvalid')
  }
  return null
}

async function handleSendTestSms(recipient: TestSmsRecipient): Promise<void> {
  if (sendingRecipientId.value) return

  testSuccessMessage.value = null
  testErrorMessage.value = null

  const validationError = validateRecipientJshshir(recipient)
  if (validationError) {
    testErrorMessage.value = validationError
    return
  }

  sendingRecipientId.value = recipient.id
  const jshshir = recipientJshshirs[recipient.id]?.trim() ?? ''
  try {
    await sendTestSms(recipient, {
      secretKey: secretKey.value.trim(),
      jshshir,
      diagnosis: diagnosis.value.trim(),
      conclusion: conclusion.value.trim(),
    })
    testSuccessMessage.value = t('admin.testingSmsSent', { name: recipient.name })
  } catch (err) {
    testErrorMessage.value = getApiErrorMessage(err, t('errors.api.REQUEST_FAILED'))
  } finally {
    sendingRecipientId.value = null
  }
}
</script>

<template>
  <div class="mx-auto min-w-0 max-w-2xl space-y-6">
    <AdminAlerts :success="successMessage" />

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
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
      <div class="mb-5 flex items-center gap-2">
        <MessageSquare class="h-5 w-5 text-brand-primary" />
        <div>
          <h2 class="text-sm font-bold text-slate-800 dark:text-white">{{ t('admin.testingSettings') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('admin.testingSettingsDesc') }}</p>
        </div>
      </div>

      <AdminAlerts :error="testErrorMessage" :success="testSuccessMessage" class="mb-4" />

      <div class="mb-5 space-y-4">
        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('medicalEvents.secretKey') }} *
          </label>
          <div class="mt-1.5 flex flex-wrap gap-2">
            <input
              v-model="secretKey"
              type="text"
              autocomplete="off"
              spellcheck="false"
              :placeholder="t('clinics.secretKeyPlaceholder')"
              class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-800 focus:border-brand-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              @input="keyValidationMessage = null"
            />
            <button
              type="button"
              class="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              :disabled="validatingKey || sendingRecipientId !== null"
              @click="validateSecretKey"
            >
              {{ validatingKey ? t('medicalEvents.sending') : t('clinics.check') }}
            </button>
          </div>
          <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{{ t('admin.testingSecretKeyHint') }}</p>
          <p
            v-if="keyValidationMessage"
            class="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
          >
            {{ keyValidationMessage }}
          </p>
        </div>

        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('medicalEvents.diagnosis') }} *
          </label>
          <input
            v-model="diagnosis"
            type="text"
            :placeholder="t('medicalEvents.diagnosisPlaceholder')"
            class="mt-1.5 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:border-brand-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
          />
        </div>

        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('medicalEvents.conclusion') }} *
          </label>
          <textarea
            v-model="conclusion"
            rows="3"
            :placeholder="t('medicalEvents.conclusionPlaceholder')"
            class="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:border-brand-primary focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
          />
        </div>
      </div>

      <p class="mb-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        {{ t('admin.testingJshshirHint') }}
      </p>

      <div class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="recipient in TEST_SMS_RECIPIENTS"
          :key="recipient.id"
          class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/60"
        >
          <p class="mb-2 text-xs font-bold text-slate-800 dark:text-slate-100">{{ recipient.name }}</p>
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {{ t('medicalEvents.jshshir') }}
          </label>
          <input
            v-model="recipientJshshirs[recipient.id]"
            type="text"
            inputmode="numeric"
            :maxlength="JSHSHIR_LENGTH"
            :placeholder="t('medicalEvents.jshshirPlaceholder')"
            class="mt-1 mb-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-brand-primary focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-brand-primary hover:bg-brand-primary/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-brand-primary"
            :disabled="sendingRecipientId !== null"
            @click="handleSendTestSms(recipient)"
          >
            <span v-if="sendingRecipientId === recipient.id">{{ t('medicalEvents.sending') }}</span>
            <span v-else>{{ t('admin.testingSendSms') }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
