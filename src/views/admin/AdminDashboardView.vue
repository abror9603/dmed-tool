<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Hospital,
  Activity,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Users,
  Send,
} from 'lucide-vue-next'
import { ROUTE_NAMES } from '../../router'
import { useAuthStore } from '../../stores/auth'
import { useClinicsStore } from '../../stores/clinics'
import { useClinicApplicationsStore } from '../../stores/clinic-applications'
import { useUsersStore } from '../../stores/users'
import type { Clinic } from '../../services/clinics'

const { t } = useI18n()
const authStore = useAuthStore()
const clinicsStore = useClinicsStore()
const applicationsStore = useClinicApplicationsStore()
const usersStore = useUsersStore()

const clinics = computed(() => clinicsStore.clinics)
const loading = computed(
  () => clinicsStore.loading || applicationsStore.loading || usersStore.loading,
)

const activeCount = computed(
  () => clinics.value.filter((clinic: Clinic) => clinic.status === 'ACTIVE').length,
)
const inactiveCount = computed(() => clinics.value.length - activeCount.value)
const pendingApplications = computed(
  () => applicationsStore.applications.filter((app) => app.status === 'PENDING').length,
)

const welcomeName = computed(() => {
  const user = authStore.user
  if (!user) {
    return null
  }
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return fullName || user.login
})

const quickLinks = computed(() => [
  {
    to: { name: ROUTE_NAMES.ADMIN_APPLICATIONS },
    icon: ClipboardList,
    label: t('admin.manageApplications'),
  },
  {
    to: { name: ROUTE_NAMES.ADMIN_CLINICS },
    icon: Hospital,
    label: t('admin.manageClinics'),
  },
  {
    to: { name: ROUTE_NAMES.ADMIN_USERS },
    icon: Users,
    label: t('admin.manageUsers'),
  },
  {
    to: { name: ROUTE_NAMES.ADMIN_MEDICAL_EVENTS },
    icon: Send,
    label: t('admin.manageMedicalEvents'),
  },
  {
    to: { name: ROUTE_NAMES.DOCS, params: { section: 'intro' } },
    icon: BookOpen,
    label: t('admin.viewDocs'),
  },
])

onMounted(() => {
  Promise.allSettled([
    clinicsStore.fetchAllClinics(),
    applicationsStore.fetchApplications(),
    usersStore.fetchUsers(),
  ])
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card sm:p-8">
      <p class="text-xs font-bold uppercase tracking-wider text-brand-primary">{{ t('admin.title') }}</p>
      <h2 class="mt-2 text-2xl font-black text-slate-900 dark:text-white">
        {{
          welcomeName
            ? t('admin.welcome', { name: welcomeName })
            : t('admin.welcomeDefault')
        }}
      </h2>
      <p class="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
        {{ t('admin.dashboardSubtitle') }}
      </p>
    </section>

    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('admin.stats.totalClinics') }}</p>
        <p class="mt-3 text-3xl font-black text-slate-900 dark:text-white">
          {{ loading && clinics.length === 0 ? '—' : clinics.length }}
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('admin.stats.activeClinics') }}</p>
        <p class="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400">
          {{ loading && clinics.length === 0 ? '—' : activeCount }}
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('admin.stats.inactiveClinics') }}</p>
        <p class="mt-3 text-3xl font-black text-slate-600 dark:text-slate-300">
          {{ loading && clinics.length === 0 ? '—' : inactiveCount }}
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('admin.stats.pendingApplications') }}</p>
        <p class="mt-3 text-3xl font-black text-amber-600 dark:text-amber-400">
          {{ loading && applicationsStore.applications.length === 0 ? '—' : pendingApplications }}
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ t('admin.stats.totalUsers') }}</p>
        <p class="mt-3 text-3xl font-black text-brand-primary">
          {{ loading && usersStore.users.length === 0 ? '—' : usersStore.users.length }}
        </p>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
      <h3 class="text-sm font-bold text-slate-800 dark:text-white">{{ t('admin.quickActions') }}</h3>
      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.label"
          :to="link.to"
          class="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5 dark:border-slate-700 dark:hover:bg-brand-primary/10"
        >
          <div class="flex items-center gap-3">
            <component :is="link.icon" class="h-5 w-5 text-brand-primary" />
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ link.label }}</span>
          </div>
          <ArrowRight class="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-primary" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
