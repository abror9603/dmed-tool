<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { FlaskConical, Key, Send, User, TestTube2, Phone } from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import { labIntakeService } from '../../services/lab-intake'
import { getErrorMessage } from '../../utils/errors'

const { t } = useI18n()

const secretKey = ref('')
const jshshir = ref('')
const patientFullName = ref('')
const testName = ref('')
const testResult = ref('')
const unit = ref('')
const referenceRange = ref('')
const familyDoctorPhone = ref('')
const familyDoctorFcmToken = ref('')
const familyDoctorId = ref('')
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
    error.value = t('labIntake.secretKeyRequired')
    return
  }

  if (
    !jshshir.value.trim() ||
    !patientFullName.value.trim() ||
    !testName.value.trim() ||
    !testResult.value.trim() ||
    !unit.value.trim() ||
    !referenceRange.value.trim() ||
    !familyDoctorPhone.value.trim()
  ) {
    error.value = t('labIntake.fillRequired')
    return
  }

  if (!/^\d{14}$/.test(jshshir.value.trim())) {
    error.value = t('labIntake.jshshirInvalid')
    return
  }

  loading.value = true
  try {
    const data = await labIntakeService.submit(
      {
        jshshir: jshshir.value.trim(),
        patientFullName: patientFullName.value.trim(),
        testName: testName.value.trim(),
        testResult: testResult.value.trim(),
        unit: unit.value.trim(),
        referenceRange: referenceRange.value.trim(),
        familyDoctorPhone: familyDoctorPhone.value.trim(),
        familyDoctorFcmToken: familyDoctorFcmToken.value.trim() || undefined,
        familyDoctorId: familyDoctorId.value.trim() || undefined,
      },
      secretKey.value.trim(),
    )
    successMessage.value = t('labIntake.success')
    responseText.value = JSON.stringify(data, null, 2)
  } catch (err) {
    error.value = getErrorMessage(err, t('labIntake.failed'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full space-y-4">
    <AdminAlerts :error="error" :success="successMessage" />

    <section class="overflow-hidden rounded-xl border border-slate-700/70 bg-[#111b2e] p-5 sm:p-6">
      <div class="mb-5 flex items-start gap-3">
        <FlaskConical class="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
        <div>
          <h2 class="text-sm font-bold text-white">{{ t('labIntake.title') }}</h2>
          <p class="mt-1 text-xs text-slate-400">{{ t('labIntake.subtitle') }}</p>
        </div>
      </div>

      <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="submitIntake">
        <div class="sm:col-span-2">
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.secretKey') }} *
          </label>
          <div class="relative">
            <Key class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              v-model="secretKey"
              type="text"
              required
              :placeholder="t('clinics.secretKeyPlaceholder')"
              class="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2 pl-9 pr-3 font-mono text-xs text-slate-200"
            />
          </div>
          <p class="mt-1 text-[11px] text-slate-500">{{ t('labIntake.secretKeyHint') }}</p>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.jshshir') }} *
          </label>
          <div class="relative">
            <User class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              v-model="jshshir"
              type="text"
              required
              inputmode="numeric"
              maxlength="14"
              :placeholder="t('labIntake.jshshirPlaceholder')"
              class="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-slate-200"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.patientFullName') }} *
          </label>
          <input
            v-model="patientFullName"
            type="text"
            required
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.testName') }} *
          </label>
          <div class="relative">
            <TestTube2 class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              v-model="testName"
              type="text"
              required
              placeholder="HbA1c"
              class="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-slate-200"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.testResult') }} *
          </label>
          <input
            v-model="testResult"
            type="text"
            required
            placeholder="9.2"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.unit') }} *
          </label>
          <input
            v-model="unit"
            type="text"
            required
            placeholder="%"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.referenceRange') }} *
          </label>
          <input
            v-model="referenceRange"
            type="text"
            required
            placeholder="4.0-6.0"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.familyDoctorPhone') }} *
          </label>
          <div class="relative">
            <Phone class="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              v-model="familyDoctorPhone"
              type="tel"
              required
              :placeholder="t('registration.phoneSuffixPlaceholder')"
              class="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2 pl-9 pr-3 text-xs text-slate-200"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.familyDoctorId') }}
          </label>
          <input
            v-model="familyDoctorId"
            type="text"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {{ t('labIntake.familyDoctorFcmToken') }}
          </label>
          <input
            v-model="familyDoctorFcmToken"
            type="text"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </div>

        <div class="sm:col-span-2">
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
            :disabled="loading"
          >
            <Send class="h-4 w-4" />
            <span>{{ loading ? t('labIntake.sending') : t('labIntake.send') }}</span>
          </button>
        </div>
      </form>
    </section>

    <section
      v-if="responseText"
      class="overflow-hidden rounded-xl border border-slate-700/70 bg-[#111b2e] p-5"
    >
      <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{{ t('labIntake.response') }}</h3>
      <pre class="overflow-x-auto rounded-lg bg-slate-950 p-4 text-[11px] leading-relaxed text-emerald-400">{{ responseText }}</pre>
    </section>
  </div>
</template>
