/**
 * Derived dashboard metrics — transforms raw API stats into chart-ready segments and cards.
 *
 * Keeps AdminDashboardView focused on layout; all percentage/bar math lives here.
 */
import { computed, ref, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Activity,
  Building2,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  KeyRound,
  RefreshCw,
} from 'lucide-vue-next'
import { percentOf } from './useDashboardCharts'
import { useAdminLabels } from './useAdminLabels'
import { useDashboardStore } from '../stores/dashboard'
import type { SystemAlert } from '../types/dashboard.types'

export interface DashboardMetricCard {
  key: string
  icon: Component
  label: string
  value: string
  sub: string
  accent: string
  badge?: string
  /** Opens the entity stats modal when the card is clicked. */
  modalKey?: 'clinics' | 'labs'
}

export interface DashboardBarItem {
  key: string
  value: number
  color: string
  label: string
}

export interface DashboardDonutSegment {
  key: string
  value: number
  color: string
}

export interface DashboardUserRole {
  key: string
  label: string
  value: number
  color: string
  percent: number
}

export interface TopClinicRow {
  clinicId: string
  clinicName: string
  count: number
  percent: number
}

export function useDashboardMetrics() {
  const { t } = useI18n()
  const { statusLabel } = useAdminLabels()
  const store = useDashboardStore()
  const dismissedAlerts = ref<string[]>([])

  const stats = computed(() => store.stats)
  const loading = computed(() => store.loading)
  const refreshProgress = computed(() => ((60 - store.refreshCountdown) / 60) * 100)

  const visibleAlerts = computed(() =>
    (stats.value?.systemAlerts ?? []).filter((alert) => !dismissedAlerts.value.includes(alert.type)),
  )

  const metricCards = computed((): DashboardMetricCard[] => {
    if (!stats.value) return []

    const cards: DashboardMetricCard[] = [
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
        modalKey: 'clinics',
      },
    ]

    if (stats.value.labs) {
      cards.push({
        key: 'labs',
        icon: FlaskConical,
        label: t('dashboardPage.metrics.labs'),
        value: `${stats.value.labs.active}/${stats.value.labs.total}`,
        sub: t('dashboardPage.metrics.labsInactive', { count: stats.value.labs.inactive }),
        accent: 'text-teal-400',
        modalKey: 'labs',
      })
    }

    cards.push(
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
    )

    return cards
  })

  const statusSegments = computed((): DashboardDonutSegment[] => {
    if (!stats.value) return []
    const data = stats.value.medicalEvents.byStatus
    return [
      { key: statusLabel('PENDING'), value: data.PENDING, color: '#F59E0B' },
      { key: statusLabel('NOTIFIED'), value: data.NOTIFIED, color: '#10B981' },
      { key: statusLabel('FAILED'), value: data.FAILED, color: '#EF4444' },
    ]
  })

  const statusTotal = computed(() => {
    if (!stats.value) return 0
    const data = stats.value.medicalEvents.byStatus
    return data.PENDING + data.NOTIFIED + data.FAILED
  })

  const statusNotifiedRate = computed(() => {
    if (!stats.value || statusTotal.value === 0) return 0
    return Math.round((stats.value.medicalEvents.byStatus.NOTIFIED / statusTotal.value) * 1000) / 10
  })

  const clinicTypeBars = computed((): DashboardBarItem[] => {
    if (!stats.value) return []
    const data = stats.value.clinics.byType
    return [
      { key: 'DAVLAT', value: data.DAVLAT, color: '#3B82F6', label: t('dashboardPage.clinicTypes.DAVLAT') },
      { key: 'XUSUSIY', value: data.XUSUSIY, color: '#8B5CF6', label: t('dashboardPage.clinicTypes.XUSUSIY') },
      { key: 'TEZYOR_103', value: data.TEZYOR_103, color: '#10B981', label: t('dashboardPage.clinicTypes.TEZYOR_103') },
    ]
  })

  const chartSecondarySpan = computed(() => (stats.value?.labEvents ? 'lg:col-span-3' : 'lg:col-span-2'))

  const urgencyBars = computed((): DashboardBarItem[] => {
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

  const labEventsBars = computed((): DashboardBarItem[] => {
    if (!stats.value?.labEvents) return []
    const data = stats.value.labEvents
    return [
      { key: 'normal', value: data.normal, color: '#10B981', label: t('dashboardPage.labEvents.normal') },
      { key: 'abnormal', value: data.abnormal, color: '#F59E0B', label: t('dashboardPage.labEvents.abnormal') },
      { key: 'critical', value: data.critical, color: '#EF4444', label: t('dashboardPage.labEvents.critical') },
    ]
  })

  const topClinics = computed((): TopClinicRow[] => {
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

  const applicationSegments = computed((): DashboardDonutSegment[] => {
    if (!stats.value) return []
    return [
      { key: t('dashboardPage.approved'), value: stats.value.clinicApplications.totalApproved, color: '#10B981' },
      { key: t('dashboardPage.rejected'), value: stats.value.clinicApplications.totalRejected, color: '#EF4444' },
    ]
  })

  const userRoles = computed((): DashboardUserRole[] => {
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

  return {
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
  }
}
