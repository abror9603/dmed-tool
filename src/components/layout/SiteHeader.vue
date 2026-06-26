<script setup lang="ts">
import { inject, onMounted, type Ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Sun, Moon, BookOpen, LayoutDashboard } from 'lucide-vue-next'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { ROUTE_NAMES } from '../../router'
import { useAuthStore } from '../../stores/auth'

const { t } = useI18n()
const theme = inject<Ref<'light' | 'dark'>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
const authStore = useAuthStore()

onMounted(() => {
  authStore.syncFromSession()
})
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-brand-dark/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center space-x-2">
        <span class="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
          {{ t('common.brand') }}
        </span>
        <span class="px-2 py-0.5 text-xs font-semibold rounded bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
          {{ t('common.mvp') }}
        </span>
      </RouterLink>

      <div class="flex items-center space-x-3">
        <LanguageSwitcher />

        <RouterLink
          to="/docs/intro"
          class="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-primary transition-colors py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <BookOpen class="w-4 h-4" />
          <span>{{ t('common.docs') }}</span>
        </RouterLink>

        <RouterLink
          v-if="authStore.isAuthenticated"
          :to="{ name: ROUTE_NAMES.ADMIN_DASHBOARD }"
          class="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-primary transition-colors py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span>{{ t('admin.title') }}</span>
        </RouterLink>

        <RouterLink
          v-else
          to="/login"
          class="hidden sm:flex items-center text-sm font-medium text-slate-600 hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-primary transition-colors py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span>{{ t('common.login') }}</span>
        </RouterLink>

        <button
          type="button"
          class="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          :aria-label="t('common.themeToggle')"
          @click="toggleTheme"
        >
          <Sun v-if="theme === 'dark'" class="w-5 h-5 text-amber-400 animate-spin-slow" />
          <Moon v-else class="w-5 h-5 text-slate-600" />
        </button>

        <a
          href="#clinic-registration"
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary/95 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-95"
        >
          {{ t('common.getStarted') }}
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
