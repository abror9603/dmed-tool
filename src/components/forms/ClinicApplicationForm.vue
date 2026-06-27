<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Phone,
  Send,
  User,
} from 'lucide-vue-next'
import type { ApplicationApplyPayload } from '../../services/clinic-applications'
import { CLINIC_TYPES, type ClinicType } from '../../types/clinic.types'

type OrgType = ClinicType | 'LAB' | ''

const REGISTRATION_TYPES: OrgType[] = [...CLINIC_TYPES, 'LAB']

type ApplicationFormState = {
  clinicName: string
  clinicType: OrgType
  firstName: string
  lastName: string
  login: string
  password: string
  phoneNumber1: string
  phoneNumber2: string
}

const emit = defineEmits<{
  submit: [payload: ApplicationApplyPayload]
}>()

const props = defineProps<{
  loading?: boolean
  error?: string | null
  success?: string | null
}>()

const { t } = useI18n()

const form = reactive<ApplicationFormState>({
  clinicName: '',
  clinicType: '',
  firstName: '',
  lastName: '',
  login: '',
  password: '',
  phoneNumber1: '',
  phoneNumber2: '',
})

const showPassword = ref(false)
const touched = reactive({
  clinicName: false,
  clinicType: false,
  firstName: false,
  lastName: false,
  login: false,
  password: false,
  phoneNumber1: false,
  phoneNumber2: false,
})

const isLab = computed(() => form.clinicType === 'LAB')

const phonePattern = /^\+?[0-9\s()-]{9,20}$/

const fieldErrors = computed(() => ({
  clinicName: touched.clinicName && !form.clinicName.trim() ? t('registration.clinicNameRequired') : '',
  clinicType: touched.clinicType && !form.clinicType ? t('registration.clinicTypeRequired') : '',
  firstName: touched.firstName && !form.firstName.trim() ? t('registration.firstNameRequired') : '',
  lastName: touched.lastName && !form.lastName.trim() ? t('registration.lastNameRequired') : '',
  login: touched.login && !form.login.trim() ? t('registration.loginRequired') : '',
  password: touched.password && !form.password ? t('registration.passwordRequired') : '',
  phoneNumber1:
    touched.phoneNumber1 && !phonePattern.test(form.phoneNumber1.trim())
      ? t('registration.phoneInvalid')
      : '',
  phoneNumber2:
    !isLab.value &&
    touched.phoneNumber2 &&
    !phonePattern.test(form.phoneNumber2.trim())
      ? t('registration.phoneInvalid')
      : '',
}))

const isValid = computed(() => {
  const baseValid =
    form.clinicName.trim() &&
    form.clinicType &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.login.trim() &&
    form.password &&
    phonePattern.test(form.phoneNumber1.trim())

  if (isLab.value) return Boolean(baseValid)

  return Boolean(baseValid && phonePattern.test(form.phoneNumber2.trim()))
})

function touchAll(): void {
  Object.keys(touched).forEach((key) => {
    touched[key as keyof typeof touched] = true
  })
}

function resetForm(): void {
  form.clinicName = ''
  form.clinicType = ''
  form.firstName = ''
  form.lastName = ''
  form.login = ''
  form.password = ''
  form.phoneNumber1 = ''
  form.phoneNumber2 = ''
  Object.keys(touched).forEach((key) => {
    touched[key as keyof typeof touched] = false
  })
}

function handleSubmit(): void {
  touchAll()
  if (!isValid.value) return

  const base = {
    clinicName: form.clinicName.trim(),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    login: form.login.trim(),
    password: form.password,
    phoneNumber1: form.phoneNumber1.trim(),
  }

  if (isLab.value) {
    emit('submit', {
      applicationType: 'LAB',
      ...base,
    })
    return
  }

  emit('submit', {
    applicationType: 'CLINIC',
    ...base,
    clinicType: form.clinicType as ClinicType,
    phoneNumber2: form.phoneNumber2.trim(),
  })
}

defineExpose({ resetForm })
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
    <div
      v-if="props.error"
      class="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
    >
      {{ props.error }}
    </div>
    <div
      v-if="props.success"
      class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400"
    >
      {{ props.success }}
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="space-y-1.5 sm:col-span-2">
        <label for="clinicName" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ isLab ? t('labRegistration.labName') : t('registration.clinicName') }}
        </label>
        <div class="relative">
          <Building2 class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="clinicName"
            v-model="form.clinicName"
            type="text"
            required
            :placeholder="isLab ? t('labRegistration.labNamePlaceholder') : t('registration.clinicNamePlaceholder')"
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            :class="fieldErrors.clinicName ? 'border-red-400' : ''"
            :disabled="props.loading"
            @blur="touched.clinicName = true"
          />
        </div>
        <p v-if="fieldErrors.clinicName" class="text-xs text-red-500">{{ fieldErrors.clinicName }}</p>
      </div>

      <div class="space-y-1.5 sm:col-span-2">
        <label for="clinicType" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('registration.clinicType') }}
        </label>
        <select
          id="clinicType"
          v-model="form.clinicType"
          required
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
          :class="fieldErrors.clinicType ? 'border-red-400' : ''"
          :disabled="props.loading"
          @blur="touched.clinicType = true"
        >
          <option value="" disabled>{{ t('registration.clinicTypePlaceholder') }}</option>
          <option v-for="type in REGISTRATION_TYPES" :key="type" :value="type">
            {{ t(`registration.clinicTypes.${type}`) }}
          </option>
        </select>
        <p v-if="fieldErrors.clinicType" class="text-xs text-red-500">{{ fieldErrors.clinicType }}</p>
      </div>

      <div class="space-y-1.5">
        <label for="firstName" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('registration.firstName') }}
        </label>
        <div class="relative">
          <User class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            required
            :placeholder="t('registration.firstNamePlaceholder')"
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            :class="fieldErrors.firstName ? 'border-red-400' : ''"
            :disabled="props.loading"
            @blur="touched.firstName = true"
          />
        </div>
        <p v-if="fieldErrors.firstName" class="text-xs text-red-500">{{ fieldErrors.firstName }}</p>
      </div>

      <div class="space-y-1.5">
        <label for="lastName" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('registration.lastName') }}
        </label>
        <div class="relative">
          <User class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            required
            :placeholder="t('registration.lastNamePlaceholder')"
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            :class="fieldErrors.lastName ? 'border-red-400' : ''"
            :disabled="props.loading"
            @blur="touched.lastName = true"
          />
        </div>
        <p v-if="fieldErrors.lastName" class="text-xs text-red-500">{{ fieldErrors.lastName }}</p>
      </div>

      <div class="space-y-1.5">
        <label for="login" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('registration.login') }}
        </label>
        <div class="relative">
          <User class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="login"
            v-model="form.login"
            type="text"
            required
            autocomplete="username"
            :placeholder="t('registration.loginPlaceholder')"
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            :class="fieldErrors.login ? 'border-red-400' : ''"
            :disabled="props.loading"
            @blur="touched.login = true"
          />
        </div>
        <p v-if="fieldErrors.login" class="text-xs text-red-500">{{ fieldErrors.login }}</p>
      </div>

      <div class="space-y-1.5">
        <label for="password" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('registration.password') }}
        </label>
        <div class="relative">
          <Lock class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="new-password"
            :placeholder="t('registration.passwordPlaceholder')"
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            :class="fieldErrors.password ? 'border-red-400' : ''"
            :disabled="props.loading"
            @blur="touched.password = true"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            :aria-label="showPassword ? t('loginPage.hidePassword') : t('loginPage.showPassword')"
            :disabled="props.loading"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
        </div>
        <p v-if="fieldErrors.password" class="text-xs text-red-500">{{ fieldErrors.password }}</p>
      </div>

      <div class="space-y-1.5" :class="isLab ? 'sm:col-span-2' : ''">
        <label for="phoneNumber1" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ isLab ? t('labRegistration.phone') : t('registration.phoneNumber1') }}
        </label>
        <div class="relative">
          <Phone class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="phoneNumber1"
            v-model="form.phoneNumber1"
            type="tel"
            required
            :placeholder="t('registration.phonePlaceholder')"
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            :class="fieldErrors.phoneNumber1 ? 'border-red-400' : ''"
            :disabled="props.loading"
            @blur="touched.phoneNumber1 = true"
          />
        </div>
        <p v-if="fieldErrors.phoneNumber1" class="text-xs text-red-500">{{ fieldErrors.phoneNumber1 }}</p>
      </div>

      <div v-if="!isLab" class="space-y-1.5">
        <label for="phoneNumber2" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ t('registration.phoneNumber2') }}
        </label>
        <div class="relative">
          <Phone class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="phoneNumber2"
            v-model="form.phoneNumber2"
            type="tel"
            required
            :placeholder="t('registration.phonePlaceholder')"
            class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            :class="fieldErrors.phoneNumber2 ? 'border-red-400' : ''"
            :disabled="props.loading"
            @blur="touched.phoneNumber2 = true"
          />
        </div>
        <p v-if="fieldErrors.phoneNumber2" class="text-xs text-red-500">{{ fieldErrors.phoneNumber2 }}</p>
      </div>
    </div>

    <button
      type="submit"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-primary/95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
      :disabled="props.loading || !isValid"
    >
      <Loader2 v-if="props.loading" class="h-4 w-4 animate-spin" />
      <Send v-else class="h-4 w-4" />
      <span>{{ props.loading ? t('registration.submitting') : t('registration.submit') }}</span>
    </button>
  </form>
</template>
