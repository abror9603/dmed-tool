<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Eye, EyeOff, Loader2, Lock, LogIn, User } from 'lucide-vue-next'
import type { LoginCredentials } from '../../types/auth.types'

const emit = defineEmits<{
  submit: [credentials: LoginCredentials]
}>()

const props = defineProps<{
  loading?: boolean
  error?: string | null
}>()

const { t } = useI18n()

const form = reactive<LoginCredentials>({
  login: '',
  password: '',
})

const showPassword = ref(false)
const loginReadonly = ref(true)
const passwordReadonly = ref(true)
const touched = reactive({
  login: false,
  password: false,
})

const loginError = computed(() => {
  if (!touched.login) return ''
  return form.login.trim() ? '' : t('loginPage.loginRequired')
})

const passwordError = computed(() => {
  if (!touched.password) return ''
  return form.password ? '' : t('loginPage.passwordRequired')
})

const isValid = computed(() => Boolean(form.login.trim() && form.password))

function enableLoginInput(): void {
  loginReadonly.value = false
}

function enablePasswordInput(): void {
  passwordReadonly.value = false
}

function handleSubmit(): void {
  touched.login = true
  touched.password = true
  if (!isValid.value) return

  emit('submit', {
    login: form.login.trim(),
    password: form.password,
  })
}
</script>

<template>
  <form class="space-y-5" autocomplete="off" novalidate @submit.prevent="handleSubmit">
    <div v-if="props.error" class="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
      {{ props.error }}
    </div>

    <div class="space-y-1.5">
      <label for="dmed-login" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {{ t('loginPage.loginLabel') }}
      </label>
      <div class="relative">
        <User class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="dmed-login"
          v-model="form.login"
          type="text"
          name="dmed-admin-identifier"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          :readonly="loginReadonly"
          :placeholder="t('loginPage.loginPlaceholder')"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
          :class="loginError ? 'border-red-400 focus:border-red-400' : ''"
          :disabled="props.loading"
          @focus="enableLoginInput"
          @blur="touched.login = true"
        />
      </div>
      <p v-if="loginError" class="text-xs text-red-500">{{ loginError }}</p>
    </div>

    <div class="space-y-1.5">
      <label for="dmed-password" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {{ t('loginPage.passwordLabel') }}
      </label>
      <div class="relative">
        <Lock class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="dmed-password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          name="dmed-admin-secret"
          autocomplete="new-password"
          :readonly="passwordReadonly"
          :placeholder="t('loginPage.passwordPlaceholder')"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition-colors focus:border-brand-primary dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
          :class="passwordError ? 'border-red-400 focus:border-red-400' : ''"
          :disabled="props.loading"
          @focus="enablePasswordInput"
          @blur="touched.password = true"
        />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
          :aria-label="showPassword ? t('loginPage.hidePassword') : t('loginPage.showPassword')"
          :disabled="props.loading"
          @click="showPassword = !showPassword"
        >
          <EyeOff v-if="showPassword" class="h-4 w-4" />
          <Eye v-else class="h-4 w-4" />
        </button>
      </div>
      <p v-if="passwordError" class="text-xs text-red-500">{{ passwordError }}</p>
    </div>

    <button
      type="submit"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition-all hover:bg-brand-primary/95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="props.loading || !isValid"
    >
      <Loader2 v-if="props.loading" class="h-4 w-4 animate-spin" />
      <LogIn v-else class="h-4 w-4" />
      <span>{{ props.loading ? t('loginPage.submitting') : t('loginPage.submit') }}</span>
    </button>
  </form>
</template>
