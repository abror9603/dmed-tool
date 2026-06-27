<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  LayoutDashboard,
  Hospital,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Users,
} from 'lucide-vue-next'
import { useAdminLocale } from '../composables/useAdminLocale'
import AdminConfirmDialog from '../components/admin/AdminConfirmDialog.vue'
import { ROUTE_NAMES } from '../router'
import { useAuthStore } from '../stores/auth'

const { t } = useI18n()
useAdminLocale()
const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const sidebarNav = computed(() => [
  {
    name: ROUTE_NAMES.ADMIN_DASHBOARD,
    label: t('admin.dashboard'),
    icon: LayoutDashboard,
    to: { name: ROUTE_NAMES.ADMIN_DASHBOARD },
  },
  {
    name: ROUTE_NAMES.ADMIN_CLINICS,
    label: t('admin.clinics'),
    icon: Hospital,
    to: { name: ROUTE_NAMES.ADMIN_CLINICS },
  },
  {
    name: ROUTE_NAMES.ADMIN_APPLICATIONS,
    label: t('admin.applications'),
    icon: ClipboardList,
    to: { name: ROUTE_NAMES.ADMIN_APPLICATIONS },
  },
  {
    name: ROUTE_NAMES.ADMIN_USERS,
    label: t('admin.users'),
    icon: Users,
    to: { name: ROUTE_NAMES.ADMIN_USERS },
  },
  {
    name: ROUTE_NAMES.ADMIN_SETTINGS,
    label: t('admin.settings'),
    icon: Settings,
    to: { name: ROUTE_NAMES.ADMIN_SETTINGS },
  },
])

const userLabel = computed(() => {
  const user = authStore.user
  if (!user) return t('admin.superAdmin')
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.login
})

const userInitial = computed(() => userLabel.value.charAt(0).toUpperCase())

const isDashboard = computed(() => route.name === ROUTE_NAMES.ADMIN_DASHBOARD)

function closeSidebarOnMobile(): void {
  sidebarOpen.value = false
}

function isActive(name: string): boolean {
  return route.name === name
}
</script>

<template>
  <div class="flex min-h-screen bg-[#0a101d] text-slate-100">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/60 lg:hidden"
      @click="sidebarOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0d1526] transition-transform duration-300 lg:static lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <RouterLink to="/" class="block" @click="closeSidebarOnMobile">
          <p class="text-lg font-black tracking-tight text-white">{{ t('common.brand') }}</p>
          <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            {{ t('admin.panelSubtitle') }}
          </p>
        </RouterLink>
        <button
          type="button"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          @click="sidebarOpen = false"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto p-4">
        <div class="space-y-1">
          <RouterLink
            v-for="item in sidebarNav"
            :key="item.name"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
            :class="
              isActive(item.name)
                ? 'border-l-2 border-cyan-400 bg-cyan-500/10 text-cyan-300'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
            "
            @click="closeSidebarOnMobile"
          >
            <component :is="item.icon" class="h-4.5 w-4.5 shrink-0" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="border-t border-slate-800 p-4">
        <div class="flex items-center gap-3 rounded-2xl bg-slate-900/70 px-3 py-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-black text-cyan-300">
            {{ userInitial }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-white">{{ userLabel }}</p>
            <p class="text-[11px] text-slate-500">{{ t('admin.superAdmin') }}</p>
          </div>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-rose-300"
            :title="t('common.logout')"
            @click="authStore.logout()"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        v-if="!isDashboard"
        class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#0a101d]/95 px-4 backdrop-blur sm:px-6"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-lg p-2 text-slate-400 hover:bg-slate-800 lg:hidden"
            @click="sidebarOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>
          <h1 class="min-w-0 truncate text-base font-extrabold text-white">
            {{ sidebarNav.find((item) => item.name === route.name)?.label ?? sidebarNav[0]?.label }}
          </h1>
        </div>
      </header>

      <header
        v-else
        class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-[#0a101d]/95 px-4 backdrop-blur sm:px-6 lg:hidden"
      >
        <button type="button" class="rounded-lg p-2 text-slate-400 hover:bg-slate-800" @click="sidebarOpen = true">
          <Menu class="h-5 w-5" />
        </button>
      </header>

      <main class="min-w-0 flex-1 overflow-auto p-4 sm:p-5 lg:p-6">
        <RouterView />
      </main>
    </div>

    <AdminConfirmDialog />
  </div>
</template>
