import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { WorkflowStep } from '../types/landing.types'

export function useLandingContent() {
  const { t, tm } = useI18n()

  const heroCtas = computed(() => ({
    primary: {
      label: t('common.getStarted'),
      href: '#clinic-registration',
      variant: 'primary' as const,
    },
    secondary: {
      label: t('common.docs'),
      href: '/docs/intro',
      variant: 'secondary' as const,
    },
  }))

  const workflowSteps = computed(() => tm('landing.workflowSteps') as WorkflowStep[])

  return {
    heroCtas,
    workflowSteps,
    t,
  }
}
