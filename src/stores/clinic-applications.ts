import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '../i18n'
import {
  clinicApplicationsService,
  type ApplicationStatus,
  type ClinicApplicationPayload,
} from '../services/clinic-applications'
import { getErrorMessage } from '../utils/errors'

export const useClinicApplicationsStore = defineStore('clinicApplications', () => {
  const applications = ref<Awaited<ReturnType<typeof clinicApplicationsService.getAll>>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const statusFilter = ref<ApplicationStatus | 'ALL'>('ALL')

  function clearMessages(): void {
    error.value = null
    successMessage.value = null
  }

  async function fetchApplications(status?: ApplicationStatus | 'ALL'): Promise<void> {
    loading.value = true
    error.value = null

    const filter = status ?? statusFilter.value
    if (status) {
      statusFilter.value = status
    }

    try {
      const data = await clinicApplicationsService.getAll(
        filter === 'ALL' ? undefined : filter,
      )
      applications.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.applicationsLoad'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitApplication(payload: ClinicApplicationPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await clinicApplicationsService.apply(payload)
      successMessage.value = i18n.global.t('errors.applicationSubmitted')
      await fetchApplications()
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.applicationSubmit'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function approveApplication(id: number | string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await clinicApplicationsService.approve(id)
      successMessage.value = i18n.global.t('errors.applicationApproved')
      await fetchApplications()
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.applicationApprove'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function rejectApplication(id: number | string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await clinicApplicationsService.reject(id)
      successMessage.value = i18n.global.t('errors.applicationRejected')
      await fetchApplications()
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.applicationReject'))
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    applications,
    loading,
    error,
    successMessage,
    statusFilter,
    clearMessages,
    fetchApplications,
    submitApplication,
    approveApplication,
    rejectApplication,
  }
})
