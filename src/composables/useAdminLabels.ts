import { useI18n } from 'vue-i18n'

export function useAdminLabels() {
  const { t, te } = useI18n()

  function statusLabel(status: string): string {
    const key = `statuses.${status}`
    return te(key) ? t(key) : status
  }

  function accountTypeLabel(type: string): string {
    const key = `accountTypes.${type}`
    return te(key) ? t(key) : type
  }

  function alertTypeLabel(type: string): string {
    const key = `systemAlertTypes.${type}`
    return te(key) ? t(key) : type
  }

  return {
    statusLabel,
    accountTypeLabel,
    alertTypeLabel,
  }
}
