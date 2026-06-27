import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '../i18n'
import {
  clinicApplicationsService,
  isLabApplication,
  type ApplicationStatus,
  type ApplicationApplyPayload,
  type ApplicationsQuery,
  type ApproveApplicationResult,
} from '../services/clinic-applications'
import { useClinicsStore } from './clinics'
import { DEFAULT_PAGE_SIZE } from '../utils/pagination'
import { getErrorMessage } from '../utils/errors'

const DEFAULT_QUERY: ApplicationsQuery = {
  page: 0,
  size: DEFAULT_PAGE_SIZE,
}

export const useClinicApplicationsStore = defineStore('clinicApplications', () => {
  const applications = ref<Awaited<ReturnType<typeof clinicApplicationsService.getPage>>['items']>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const statusFilter = ref<ApplicationStatus | 'ALL'>('ALL')
  const query = ref<ApplicationsQuery>({ ...DEFAULT_QUERY })
  const total = ref(0)

  function clearMessages(): void {
    error.value = null
    successMessage.value = null
  }

  async function fetchApplications(
    status?: ApplicationStatus | 'ALL',
    page?: number,
  ): Promise<void> {
    loading.value = true
    error.value = null

    const filter = status ?? statusFilter.value
    if (status) {
      statusFilter.value = status
    }
    if (page !== undefined) {
      query.value.page = page
    }

    try {
      const result = await clinicApplicationsService.getPage(
        filter === 'ALL' ? undefined : filter,
        query.value,
      )
      applications.value = result.items
      total.value = result.total
      query.value.page = result.page
      query.value.size = result.size
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.applicationsLoad'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitApplication(payload: ApplicationApplyPayload): Promise<void> {
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

  async function approveApplication(id: number | string): Promise<ApproveApplicationResult> {
    loading.value = true
    error.value = null
    try {
      const application = applications.value.find((app) => String(app.id) === String(id))
      if (!application) {
        throw new Error(i18n.global.t('errors.applicationNotFound'))
      }
      const result = await clinicApplicationsService.approveApplication(id, application)
      successMessage.value = isLabApplication(application)
        ? i18n.global.t('errors.applicationApprovedLab')
        : i18n.global.t('errors.applicationApproved')
      await fetchApplications()
      if (!isLabApplication(application)) {
        await useClinicsStore().fetchAllClinics()
      }
      return result
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
    query,
    total,
    clearMessages,
    fetchApplications,
    submitApplication,
    approveApplication,
    rejectApplication,
  }
})
