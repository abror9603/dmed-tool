<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarDays,
  ClipboardList,
  KeyRound,
  FlaskConical,
  RefreshCw,
  Users,
  X,
} from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import DashboardBarChart from '../../components/admin/dashboard/DashboardBarChart.vue'
import DashboardDonutChart from '../../components/admin/dashboard/DashboardDonutChart.vue'
import DashboardLineChart from '../../components/admin/dashboard/DashboardLineChart.vue'
import { formatDashboardTime, percentOf } from '../../composables/useDashboardCharts'
import { useAdminLabels } from '../../composables/useAdminLabels'
import { useDashboardStore } from '../../stores/dashboard'
import type { SystemAlert } from '../../types/dashboard.types'

const { t } = useI18n()
const { statusLabel, alertTypeLabel } = useAdminLabels()
const store = useDashboardStore()
const dismissedAlerts = ref<string[]>([])

const stats = computed(() => store.stats)
const loading = computed(() => store.loading)

const visibleAlerts = computed(() =>
  (stats.value?.systemAlerts ?? []).filter((alert) => !dismissedAlerts.value.includes(alert.type)),
)

const refreshProgress = computed(() => ((60 - store.refreshCountdown) / 60) * 100)

const metricCards = computed(() => {
  if (!stats.value) return []

  return [
    {
      key: 'events',
      icon: Activity,
      label: t('dashboardPage.metrics.events'),
      value: String(stats.value.medicalEvents.total),
      sub: t('dashboardPage.metrics.eventsToday', { count: stats.value.medicalEvents.today }),
      accent: 'text-cyan-400',
    },
    {
      key: 'clinics',
      icon: Building2,
      label: t('dashboardPage.metrics.clinics'),
      value: `${stats.value.clinics.active}/${stats.value.clinics.total}`,
      sub: t('dashboardPage.metrics.clinicsInactive', { count: stats.value.clinics.inactive }),
      accent: 'text-blue-400',
    },
    {
      key: 'sync',
      icon: RefreshCw,
      label: t('dashboardPage.metrics.sync'),
      value: `${stats.value.dmedSync.successRate.toFixed(1)}%`,
      sub: t('dashboardPage.metrics.syncSuccess', { count: stats.value.dmedSync.success }),
      accent: 'text-emerald-400',
    },
    {
      key: 'applications',
      icon: ClipboardList,
      label: t('dashboardPage.metrics.applications'),
      value: String(stats.value.clinicApplications.pending),
      sub: t('dashboardPage.metrics.applicationsHint'),
      accent: 'text-amber-400',
      badge: t('dashboardPage.metrics.applicationsBadge'),
    },
    {
      key: 'week',
      icon: CalendarDays,
      label: t('dashboardPage.metrics.week'),
      value: String(stats.value.medicalEvents.thisWeek),
      sub: t('dashboardPage.metrics.month', { count: stats.value.medicalEvents.thisMonth }),
      accent: 'text-violet-400',
    },
    {
      key: 'keys',
      icon: KeyRound,
      label: t('dashboardPage.metrics.keys'),
      value: String(stats.value.clinics.expiringKeysIn30Days),
      sub: t('dashboardPage.metrics.keysHint'),
      accent: 'text-rose-400',
      badge: t('dashboardPage.metrics.keysBadge'),
    },
    ...(stats.value.labEvents
      ? [
          {
            key: 'labEvents',
            icon: FlaskConical,
            label: t('dashboardPage.metrics.labEvents'),
            value: String(stats.value.labEvents.total),
            sub: t('dashboardPage.metrics.labEventsToday', { count: stats.value.labEvents.today }),
            accent: 'text-fuchsia-400',
          },
        ]
      : []),
  ]
})

const statusSegments = computed(() => {
  if (!stats.value) return []
  const data = stats.value.medicalEvents.byStatus
  return [
    { key: statusLabel('PENDING'), value: data.PENDING, color: '#F59E0B' },
    { key: statusLabel('NOTIFIED'), value: data.NOTIFIED, color: '#10B981' },
    { key: statusLabel('FAILED'), value: data.FAILED, color: '#EF4444' },
  ]
})

const clinicTypeSegments = computed(() => {
  if (!stats.value) return []
  const data = stats.value.clinics.byType
  return [
    { key: t('dashboardPage.clinicTypes.DAVLAT'), value: data.DAVLAT, color: '#3B82F6' },
    { key: t('dashboardPage.clinicTypes.XUSUSIY'), value: data.XUSUSIY, color: '#8B5CF6' },
    { key: t('dashboardPage.clinicTypes.TEZYOR_103'), value: data.TEZYOR_103, color: '#10B981' },
  ]
})

const urgencyBars = computed(() => {
  if (!stats.value) return []
  const data = stats.value.medicalEvents.byUrgency
  return [
    { key: '1h', value: data['1h'], color: '#EF4444', label: t('dashboardPage.urgency.1h') },
    { key: '2h', value: data['2h'], color: '#F97316', label: t('dashboardPage.urgency.2h') },
    { key: '4h', value: data['4h'], color: '#F59E0B', label: t('dashboardPage.urgency.4h') },
    { key: '8h', value: data['8h'], color: '#3B82F6', label: t('dashboardPage.urgency.8h') },
    { key: '24h', value: data['24h'], color: '#8B5CF6', label: t('dashboardPage.urgency.24h') },
  ]
})

const labEventsSegments = computed(() => {
  if (!stats.value?.labEvents) return []
  const data = stats.value.labEvents
  return [
    { key: t('dashboardPage.labEvents.normal'), value: data.normal, color: '#10B981' },
    { key: t('dashboardPage.labEvents.abnormal'), value: data.abnormal, color: '#F59E0B' },
    { key: t('dashboardPage.labEvents.critical'), value: data.critical, color: '#EF4444' },
  ]
})

const topClinics = computed(() => {
  if (!stats.value) return []
  const max = Math.max(...stats.value.medicalEvents.topClinics.map((item) => item.count), 1)
  return stats.value.medicalEvents.topClinics.map((item) => ({
    ...item,
    percent: percentOf(item.count, max),
  }))
})

const totalApplications = computed(() => {
  if (!stats.value) return 0
  return stats.value.clinicApplications.totalApproved + stats.value.clinicApplications.totalRejected
})

const userRoles = computed(() => {
  if (!stats.value) return []
  const total = stats.value.users.total || 1
  return [
    {
      key: 'admins',
      label: t('dashboardPage.users.admins'),
      value: stats.value.users.admins,
      color: 'bg-rose-500',
      percent: percentOf(stats.value.users.admins, total),
    },
    {
      key: 'operators',
      label: t('dashboardPage.users.operators'),
      value: stats.value.users.operators,
      color: 'bg-blue-500',
      percent: percentOf(stats.value.users.operators, total),
    },
    {
      key: 'doctors',
      label: t('dashboardPage.users.doctors'),
      value: stats.value.users.doctors,
      color: 'bg-emerald-500',
      percent: percentOf(stats.value.users.doctors, total),
    },
  ]
})

function dismissAlert(alert: SystemAlert): void {
  dismissedAlerts.value = [...dismissedAlerts.value, alert.type]
}

function alertClasses(severity: SystemAlert['severity']): string {
  if (severity === 'CRITICAL') {
    return 'border-red-500/30 bg-red-500/10 text-red-200'
  }
  return 'border-amber-500/30 bg-amber-500/10 text-amber-100'
}

onMounted(async () => {
  store.init()
  await store.fetchStats()
})

onUnmounted(() => {
  store.destroy()
})
</script>

<template>
  <div class="min-w-0 space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
          {{ t('dashboardPage.eyebrow') }}
        </p>
        <h2 class="mt-1 text-2xl font-black text-white">{{ t('dashboardPage.title') }}</h2>
      </div>

      <div class="flex items-center gap-4 rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-3">
        <div class="text-right">
          <p class="text-[10px] uppercase tracking-wider text-slate-500">{{ t('dashboardPage.updatedAt') }}</p>
          <p class="text-sm font-bold text-white">
            {{ stats ? formatDashboardTime(stats.generatedAt) : '—' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative h-11 w-11">
            <svg viewBox="0 0 36 36" class="h-11 w-11 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(148,163,184,0.2)" stroke-width="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#3B82F6"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="`${refreshProgress} 100`"
              />
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
              {{ store.refreshCountdown }}s
            </span>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-slate-500">{{ t('dashboardPage.refreshIn') }}</p>
            <button
              type="button"
              class="mt-0.5 inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
              :disabled="loading"
              @click="store.fetchStats()"
            >
              <RefreshCw class="h-3.5 w-3.5" :class="loading ? 'animate-spin' : ''" />
              {{ t('common.refresh') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <AdminAlerts v-if="store.error" :error="store.error" />

    <div v-if="visibleAlerts.length" class="space-y-3">
      <div
        v-for="alert in visibleAlerts"
        :key="alert.type"
        class="flex items-start justify-between gap-3 rounded-2xl border px-4 py-3"
        :class="alertClasses(alert.severity)"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p class="text-xs font-bold uppercase tracking-wider">{{ alertTypeLabel(alert.type) }}</p>
            <p class="mt-1 text-sm">{{ alert.message }}</p>
          </div>
        </div>
        <button type="button" class="rounded-lg p-1 hover:bg-white/10" @click="dismissAlert(alert)">
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <section v-if="stats">
      <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {{ t('dashboardPage.mainMetrics') }}
      </p>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <div
          v-for="card in metricCards"
          :key="card.key"
          class="min-w-0 rounded-2xl border border-slate-700/70 bg-[#111b2e] p-4 shadow-lg shadow-black/10"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-bold uppercase leading-snug tracking-wide text-slate-500">{{ card.label }}</p>
              <p class="mt-2 text-3xl font-black text-white">{{ card.value }}</p>
              <p class="mt-2 text-xs leading-relaxed text-slate-400">{{ card.sub }}</p>
            </div>
            <component :is="card.icon" class="h-5 w-5 shrink-0" :class="card.accent" />
          </div>
          <span
            v-if="card.badge"
            class="mt-3 inline-flex rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-300"
          >
            {{ card.badge }}
          </span>
        </div>
      </div>
    </section>

    <section v-if="stats">
      <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {{ t('dashboardPage.chartsTitle') }}
      </p>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="flex min-h-[300px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5">
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.last30Days') }}</h3>
          <div class="mt-4 flex flex-1 items-center">
            <DashboardLineChart class="w-full" :points="stats.medicalEvents.last30Days" />
          </div>
        </div>

        <div class="flex min-h-[240px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5">
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.byStatus') }}</h3>
          <div class="mt-4 flex flex-1 items-center justify-center">
            <DashboardDonutChart :segments="statusSegments" />
          </div>
        </div>

        <div class="flex min-h-[300px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5">
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.byUrgency') }}</h3>
          <div class="mt-4 flex flex-1 items-end">
            <DashboardBarChart class="w-full" :items="urgencyBars" />
          </div>
        </div>

        <div class="flex min-h-[240px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5">
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.clinicTypes') }}</h3>
          <div class="mt-4 flex flex-1 items-center justify-center">
            <DashboardDonutChart :segments="clinicTypeSegments" />
          </div>
        </div>

        <div
          v-if="stats.labEvents"
          class="flex min-h-[240px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5 lg:col-span-2"
        >
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.labEvents') }}</h3>
          <div class="mt-4 flex flex-1 items-center justify-center">
            <DashboardDonutChart :segments="labEventsSegments" />
          </div>
        </div>
      </div>
    </section>

    <section v-if="stats" class="rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5 sm:p-6">
      <h3 class="text-sm font-bold text-white">{{ t('dashboardPage.topClinics') }}</h3>
      <div class="mt-4 overflow-x-auto">
        <table class="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-slate-700/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <th class="px-4 py-3">#</th>
              <th class="px-4 py-3">{{ t('dashboardPage.table.clinic') }}</th>
              <th class="px-4 py-3">{{ t('dashboardPage.table.events') }}</th>
              <th class="px-4 py-3">{{ t('dashboardPage.table.share') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr v-for="(clinic, index) in topClinics" :key="clinic.clinicId" class="text-slate-200">
              <td class="px-4 py-4">
                <span
                  class="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                  :class="index === 0 ? 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-500/30' : 'bg-slate-800 text-slate-400'"
                >
                  {{ index + 1 }}
                </span>
              </td>
              <td class="px-4 py-4 font-semibold text-white">{{ clinic.clinicName }}</td>
              <td class="px-4 py-4 font-mono text-slate-300">{{ clinic.count }}</td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-2.5 flex-1 rounded-full bg-slate-800">
                    <div
                      class="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      :style="{ width: `${clinic.percent}%` }"
                    />
                  </div>
                  <span class="w-12 text-right text-sm font-bold text-slate-300">{{ clinic.percent }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="stats">
      <p class="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {{ t('dashboardPage.detailedStats') }}
      </p>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div class="flex min-h-[360px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5">
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.cards.applications') }}</h3>
          <div class="mt-5 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <DashboardDonutChart
              hide-legend
              :segments="[
                { key: t('dashboardPage.approved'), value: stats.clinicApplications.totalApproved, color: '#10B981' },
                { key: t('dashboardPage.rejected'), value: stats.clinicApplications.totalRejected, color: '#EF4444' },
              ]"
              :center-label="`${stats.clinicApplications.approvalRate}%`"
              :center-sub-label="t('dashboardPage.approvalRate')"
            />
            <div class="shrink-0 space-y-1 sm:max-w-[11rem]">
              <p class="text-sm font-semibold leading-snug text-white">{{ t('dashboardPage.approvalDegree') }}</p>
              <p class="text-xs leading-relaxed text-slate-400">
                {{ t('dashboardPage.totalApplications', { count: totalApplications }) }}
              </p>
            </div>
          </div>
          <div class="mt-auto space-y-3 border-t border-slate-800 pt-4 text-sm">
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ t('dashboardPage.approvedThisMonth') }}</span>
              <span class="shrink-0 font-bold text-emerald-400">{{ stats.clinicApplications.approvedThisMonth }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ t('dashboardPage.rejectedThisMonth') }}</span>
              <span class="shrink-0 font-bold text-rose-400">{{ stats.clinicApplications.rejectedThisMonth }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ t('dashboardPage.pending') }}</span>
              <span class="shrink-0 font-bold text-amber-400">{{ stats.clinicApplications.pending }}</span>
            </div>
          </div>
        </div>

        <div class="flex min-h-[360px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5">
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.cards.sync') }}</h3>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <div class="min-w-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-4 text-center">
              <p class="text-3xl font-black text-emerald-400">{{ stats.dmedSync.successToday }}</p>
              <p class="mt-1 text-[11px] leading-snug text-slate-400">{{ t('dashboardPage.successToday') }}</p>
            </div>
            <div class="min-w-0 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2 py-4 text-center">
              <p class="text-3xl font-black text-rose-400">{{ stats.dmedSync.failedToday }}</p>
              <p class="mt-1 text-[11px] leading-snug text-slate-400">{{ t('dashboardPage.failedToday') }}</p>
            </div>
          </div>
          <div class="mt-5 border-b border-slate-800 pb-4">
            <div class="flex items-start justify-between gap-4 text-sm text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ t('dashboardPage.overallSuccess') }}</span>
              <span class="shrink-0 font-bold text-emerald-400">{{ stats.dmedSync.successRate.toFixed(1) }}%</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-slate-800">
              <div
                class="h-2 rounded-full bg-emerald-500"
                :style="{ width: `${stats.dmedSync.successRate}%` }"
              />
            </div>
          </div>
          <div class="mt-auto space-y-3 pt-4 text-sm">
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ t('dashboardPage.totalSync') }}</span>
              <span class="shrink-0 font-bold text-white">{{ stats.dmedSync.total }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ t('dashboardPage.successful') }}</span>
              <span class="shrink-0 font-bold text-emerald-400">{{ stats.dmedSync.success }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ t('dashboardPage.failed') }}</span>
              <span class="shrink-0 font-bold text-rose-400">{{ stats.dmedSync.failed }}</span>
            </div>
          </div>
        </div>

        <div class="flex min-h-[360px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5 lg:col-span-2 xl:col-span-1">
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.cards.users') }}</h3>
          <div class="mt-6 text-center">
            <p class="text-5xl font-black text-white">{{ stats.users.total }}</p>
            <p class="mt-2 text-sm text-slate-400">{{ t('dashboardPage.totalUsers') }}</p>
          </div>
          <div class="mt-auto space-y-5 pt-6">
            <div v-for="role in userRoles" :key="role.key">
              <div class="mb-2 flex items-center justify-between gap-4 text-sm text-slate-300">
                <span class="min-w-0 flex-1 leading-snug">{{ role.label }}</span>
                <span class="shrink-0 font-bold text-white">{{ role.value }}</span>
              </div>
              <div class="h-2 rounded-full bg-slate-800">
                <div class="h-2 rounded-full" :class="role.color" :style="{ width: `${role.percent}%` }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading && !stats" class="flex items-center justify-center py-20 text-sm text-slate-400">
      <RefreshCw class="mr-2 h-4 w-4 animate-spin" />
      {{ t('common.loading') }}
    </div>

    <div
      v-else-if="!stats && !loading && !store.error"
      class="rounded-2xl border border-dashed border-slate-700/70 py-16 text-center text-sm text-slate-500"
    >
      {{ t('dashboardPage.noData') }}
    </div>
  </div>
</template>
