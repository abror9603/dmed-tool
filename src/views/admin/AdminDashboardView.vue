<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle, RefreshCw, X } from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import DashboardBarChart from '../../components/admin/dashboard/DashboardBarChart.vue'
import DashboardDonutChart from '../../components/admin/dashboard/DashboardDonutChart.vue'
import DashboardLineChart from '../../components/admin/dashboard/DashboardLineChart.vue'
import { formatDashboardTime } from '../../composables/useDashboardCharts'
import { useAdminLabels } from '../../composables/useAdminLabels'
import { useDashboardMetrics } from '../../composables/useDashboardMetrics'

const { t } = useI18n()
const { statusLabel, alertTypeLabel } = useAdminLabels()

const {
  store,
  stats,
  loading,
  refreshProgress,
  visibleAlerts,
  metricCards,
  statusSegments,
  statusTotal,
  statusNotifiedRate,
  clinicTypeBars,
  chartSecondarySpan,
  urgencyBars,
  labEventsBars,
  topClinics,
  totalApplications,
  applicationSegments,
  userRoles,
  dismissAlert,
  alertClasses,
} = useDashboardMetrics()

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
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
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
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-6">
        <div class="flex min-h-[320px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5 lg:col-span-6">
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.last30Days') }}</h3>
          <div class="mt-3 flex flex-1 items-stretch">
            <DashboardLineChart class="w-full" :points="stats.medicalEvents.last30Days" />
          </div>
        </div>

        <div
          class="flex min-h-[360px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5"
          :class="chartSecondarySpan"
        >
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.byStatus') }}</h3>
          <div class="mt-5 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <DashboardDonutChart
              hide-legend
              :segments="statusSegments"
              :center-label="`${statusNotifiedRate}%`"
              :center-sub-label="t('dashboardPage.statusRateLabel')"
            />
            <div class="shrink-0 space-y-1 sm:max-w-[11rem]">
              <p class="text-sm font-semibold leading-snug text-white">{{ t('dashboardPage.statusDegree') }}</p>
              <p class="text-xs leading-relaxed text-slate-400">
                {{ t('dashboardPage.totalStatusEvents', { count: statusTotal }) }}
              </p>
            </div>
          </div>
          <div class="mt-auto space-y-3 border-t border-slate-800 pt-4 text-sm">
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ statusLabel('PENDING') }}</span>
              <span class="shrink-0 font-bold text-amber-400">{{ stats.medicalEvents.byStatus.PENDING }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ statusLabel('NOTIFIED') }}</span>
              <span class="shrink-0 font-bold text-emerald-400">{{ stats.medicalEvents.byStatus.NOTIFIED }}</span>
            </div>
            <div class="flex items-start justify-between gap-4 text-slate-300">
              <span class="min-w-0 flex-1 leading-snug">{{ statusLabel('FAILED') }}</span>
              <span class="shrink-0 font-bold text-rose-400">{{ stats.medicalEvents.byStatus.FAILED }}</span>
            </div>
          </div>
        </div>

        <div
          class="flex min-h-[260px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5"
          :class="chartSecondarySpan"
        >
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.byUrgency') }}</h3>
          <div class="mt-3 flex flex-1 items-stretch">
            <DashboardBarChart class="w-full" :items="urgencyBars" />
          </div>
        </div>

        <div
          class="flex min-h-[260px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5"
          :class="chartSecondarySpan"
        >
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.clinicTypes') }}</h3>
          <div class="mt-3 flex flex-1 items-stretch">
            <DashboardBarChart class="w-full" compact :items="clinicTypeBars" />
          </div>
        </div>

        <div
          v-if="stats.labEvents"
          class="flex min-h-[260px] min-w-0 flex-col rounded-2xl border border-slate-700/70 bg-[#111b2e] p-5 lg:col-span-3"
        >
          <h3 class="text-sm font-bold leading-snug text-white">{{ t('dashboardPage.charts.labEvents') }}</h3>
          <div class="mt-3 flex flex-1 items-stretch">
            <DashboardBarChart class="w-full" compact :items="labEventsBars" />
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
              :segments="applicationSegments"
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
