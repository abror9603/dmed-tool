<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  LayoutDashboard,
  Hospital,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  BookOpen,
  ClipboardList,
  Users,
  Activity,
} from 'lucide-vue-next'
import { ref } from 'vue'
import LanguageSwitcher from '../components/layout/LanguageSwitcher.vue'
import { ROUTE_NAMES } from '../router'
import { useAuthStore } from '../stores/auth'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const theme = inject<Ref<'light' | 'dark'>>('theme')
const toggleTheme = inject<() => void>('toggleTheme')
const sidebarOpen = ref(false)

const navItems = computed(() => [
  {
    name: ROUTE_NAMES.ADMIN_DASHBOARD,
    label: t('admin.dashboard'),
    icon: LayoutDashboard,
    to: { name: ROUTE_NAMES.ADMIN_DASHBOARD },
  },
  {
    name: ROUTE_NAMES.ADMIN_APPLICATIONS,
    label: t('admin.applications'),
    icon: ClipboardList,
    to: { name: ROUTE_NAMES.ADMIN_APPLICATIONS },
  },
  {
    name: ROUTE_NAMES.ADMIN_CLINICS,
    label: t('admin.clinics'),
    icon: Hospital,
    to: { name: ROUTE_NAMES.ADMIN_CLINICS },
  },
  {
    name: ROUTE_NAMES.ADMIN_USERS,
    label: t('admin.users'),
    icon: Users,
    to: { name: ROUTE_NAMES.ADMIN_USERS },
  },
  {
    name: ROUTE_NAMES.ADMIN_MEDICAL_EVENTS,
    label: t('admin.medicalEvents'),
    icon: Activity,
    to: { name: ROUTE_NAMES.ADMIN_MEDICAL_EVENTS },
  },
  {
    name: ROUTE_NAMES.ADMIN_SETTINGS,
    label: t('admin.settings'),
    icon: Settings,
    to: { name: ROUTE_NAMES.ADMIN_SETTINGS },
  },
])

const pageTitle = computed(() => {
  const item = navItems.value.find((nav) => nav.name === route.name)
  return item?.label ?? t('admin.title')
})

const userLabel = computed(() => {
  const user = authStore.user
  if (!user) {
    return t('admin.welcomeDefault')
  }
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.login
})

function closeSidebarOnMobile(): void {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-brand-dark dark:text-slate-100">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-brand-dark-card lg:static lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
        <RouterLink to="/" class="flex items-center gap-2" @click="closeSidebarOnMobile">
          <span class="text-lg font-black tracking-tight bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            {{ t('common.brand') }}
          </span>
        </RouterLink>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          :aria-label="t('common.cancel')"
          @click="sidebarOpen = false"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('admin.title') }}</p>
        <p class="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-white">{{ userLabel }}</p>
      </div>

      <nav class="flex-1 space-y-1 p-3">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
          :class="
            route.name === item.name
              ? 'bg-brand-primary/10 text-brand-primary'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          "
          @click="closeSidebarOnMobile"
        >
          <component :is="item.icon" class="h-4.5 w-4.5 shrink-0" />
          <span>{{ item.label }}</span>
        </RouterLink>

        <RouterLink
          :to="{ name: ROUTE_NAMES.DOCS, params: { section: 'intro' } }"
          class="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="closeSidebarOnMobile"
        >
          <BookOpen class="h-4.5 w-4.5 shrink-0" />
          <span>{{ t('common.docs') }}</span>
        </RouterLink>
      </nav>

      <div class="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          @click="authStore.logout()"
        >
          <LogOut class="h-4.5 w-4.5 shrink-0" />
          <span>{{ t('common.logout') }}</span>
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-brand-dark/90 sm:px-6">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            :aria-label="t('admin.menu')"
            @click="sidebarOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>
          <h1 class="text-base font-extrabold text-slate-800 dark:text-white">{{ pageTitle }}</h1>
        </div>

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
      </header>

      <main class="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
