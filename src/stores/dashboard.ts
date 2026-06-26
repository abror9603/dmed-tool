import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { i18n } from '../i18n'
import { dashboardService } from '../services/dashboard'
import type { DashboardStats } from '../types/dashboard.types'
import { getErrorMessage } from '../utils/errors'

const REFRESH_INTERVAL_SEC = 60

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const refreshCountdown = ref(REFRESH_INTERVAL_SEC)
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const isReady = computed(() => stats.value !== null)

  function clearTimer(): void {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  function startCountdown(): void {
    clearTimer()
    refreshCountdown.value = REFRESH_INTERVAL_SEC
    countdownTimer = setInterval(() => {
      if (refreshCountdown.value <= 1) {
        void fetchStats({ silent: true })
        refreshCountdown.value = REFRESH_INTERVAL_SEC
        return
      }
      refreshCountdown.value -= 1
    }, 1000)
  }

  async function fetchStats(options: { silent?: boolean } = {}): Promise<void> {
    if (!options.silent) {
      loading.value = true
    }
    error.value = null

    try {
      stats.value = await dashboardService.getStats()
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('dashboardPage.loadError'))
      throw err
    } finally {
      if (!options.silent) {
        loading.value = false
      }
    }
  }

  function init(): void {
    startCountdown()
  }

  function destroy(): void {
    clearTimer()
  }

  return {
    stats,
    loading,
    error,
    refreshCountdown,
    isReady,
    fetchStats,
    init,
    destroy,
  }
})
