<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Hospital, ShieldCheck } from 'lucide-vue-next'
import ClinicApplicationForm from '../forms/ClinicApplicationForm.vue'
import {
  clinicApplicationsService,
  type ApplicationApplyPayload,
  type LabApplicationApplyPayload,
} from '../../services/clinic-applications'
import { buildLabRegisterPayload, labsService } from '../../services/labs'
import { getErrorMessage } from '../../utils/errors'

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const formRef = ref<InstanceType<typeof ClinicApplicationForm> | null>(null)

async function handleSubmit(payload: ApplicationApplyPayload): Promise<void> {
  loading.value = true
  error.value = null
  success.value = null

  try {
    if (payload.applicationType === 'LAB') {
      await labsService.create(buildLabRegisterPayload(payload as LabApplicationApplyPayload))
      success.value = t('labRegistration.success')
    } else {
      await clinicApplicationsService.apply(payload)
      success.value = t('registration.success')
    }
    formRef.value?.resetForm()
  } catch (err) {
    error.value = getErrorMessage(err, t('registration.failed'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section
    id="clinic-registration"
    class="relative overflow-hidden bg-white py-20 transition-colors duration-300 dark:bg-brand-dark"
  >
    <div class="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-brand-primary/10 blur-[100px]" />
    <div class="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-brand-secondary/10 blur-[100px]" />

    <div class="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div
          v-motion
          :initial="{ opacity: 0, x: -20 }"
          :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 600 } }"
          class="space-y-5"
        >
          <div class="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-primary">
            <Hospital class="h-4 w-4" />
            <span>{{ t('registration.badge') }}</span>
          </div>

          <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {{ t('registration.title') }}
          </h2>
          <p class="max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400">
            {{ t('registration.subtitle') }}
          </p>

          <ul class="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li class="flex items-start gap-2">
              <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <span>{{ t('registration.benefit1') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <span>{{ t('registration.benefit2') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
              <span>{{ t('registration.benefit3') }}</span>
            </li>
          </ul>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600, delay: 100 } }"
          class="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-brand-dark-card/80 sm:p-8"
        >
          <h3 class="mb-6 text-lg font-bold text-slate-900 dark:text-white">
            {{ t('registration.formTitle') }}
          </h3>

          <ClinicApplicationForm
            ref="formRef"
            :loading="loading"
            :error="error"
            :success="success"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </div>
  </section>
</template>
