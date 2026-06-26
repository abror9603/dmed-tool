<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Hospital, Moon, Sun } from 'lucide-vue-next'
import LoginForm from '../components/auth/LoginForm.vue'
import LanguageSwitcher from '../components/layout/LanguageSwitcher.vue'
import { ROUTE_NAMES } from '../router'
import { useAuthStore } from '../stores/auth'
import type { LoginCredentials } from '../types/auth.types'

const { t } = useI18n()
const theme = inject<Ref<'light' | 'dark'>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

async function handleLogin(credentials: LoginCredentials): Promise<void> {
  authStore.clearError()

  try {
    await authStore.login(credentials)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await router.push(redirect ?? { name: ROUTE_NAMES.ADMIN_DASHBOARD })
  } catch {
    // handled in store
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-brand-dark">
    <div class="pointer-events-none absolute left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-brand-primary/10 blur-[120px]" />
    <div class="pointer-events-none absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full bg-brand-secondary/10 blur-[100px]" />

    <div class="relative z-10 w-full max-w-md">
      <div class="mb-6 flex items-center justify-between">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition-colors hover:text-brand-primary dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>{{ t('common.backHome') }}</span>
        </RouterLink>

        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            :aria-label="t('common.themeToggle')"
            @click="toggleTheme"
          >
            <Sun v-if="theme === 'dark'" class="h-5 w-5 text-amber-400" />
            <Moon v-else class="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-brand-dark-card/90">
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <Hospital class="h-7 w-7" />
          </div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {{ t('loginPage.title') }}
          </h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {{ t('loginPage.subtitle') }}
          </p>
        </div>

        <LoginForm
          :loading="authStore.loading"
          :error="authStore.error"
          @submit="handleLogin"
        />
      </div>
    </div>
  </div>
</template>
