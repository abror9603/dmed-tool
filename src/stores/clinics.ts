/**
 * Clinics store — admin clinic list with status filter and pagination.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '../i18n'
import { clinicsService, type ClinicsQuery } from '../services/clinics'
import type { ClinicPayload } from '../types/clinic.types'
import { DEFAULT_PAGE_SIZE } from '../utils/pagination'
import { getErrorMessage } from '../utils/errors'

const DEFAULT_QUERY: ClinicsQuery = {
  page: 0,
  size: DEFAULT_PAGE_SIZE,
}

export const useClinicsStore = defineStore('clinics', () => {
  const clinics = ref<Awaited<ReturnType<typeof clinicsService.getPage>>['items']>([])
  const statusFilter = ref<'ACTIVE' | 'INACTIVE' | 'ALL'>('ALL')
  const query = ref<ClinicsQuery>({ ...DEFAULT_QUERY })
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const clearMessages = () => {
    error.value = null
    successMessage.value = null
  }

  const fetchAllClinics = async (
    status?: 'ACTIVE' | 'INACTIVE' | 'ALL',
    page?: number,
  ) => {
    if (status) {
      statusFilter.value = status
    }
    if (page !== undefined) {
      query.value.page = page
    }

    loading.value = true
    error.value = null
    try {
      const result =
        statusFilter.value === 'ACTIVE' || statusFilter.value === 'INACTIVE'
          ? await clinicsService.getPageByStatus(statusFilter.value, query.value)
          : await clinicsService.getPage(query.value)
      clinics.value = result.items
      total.value = result.total
      query.value.page = result.page
      query.value.size = result.size
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.clinicsLoad'))
      throw err
    } finally {
      loading.value = false
    }
  }

  const createClinic = async (payload: ClinicPayload) => {
    loading.value = true
    error.value = null
    try {
      await clinicsService.create(payload)
      successMessage.value = i18n.global.t('errors.clinicCreated')
      await fetchAllClinics(statusFilter.value)
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.clinicCreate'))
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateClinic = async (id: number | string, payload: ClinicPayload) => {
    loading.value = true
    error.value = null
    try {
      await clinicsService.update(id, payload)
      successMessage.value = i18n.global.t('errors.clinicUpdated')
      await fetchAllClinics(statusFilter.value)
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.clinicUpdate'))
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleClinicStatus = async (id: number | string) => {
    loading.value = true
    error.value = null
    try {
      await clinicsService.toggleStatus(id)
      successMessage.value = i18n.global.t('errors.statusUpdated')
      await fetchAllClinics(statusFilter.value)
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.clinicStatus'))
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteClinic = async (id: number | string) => {
    loading.value = true
    error.value = null
    try {
      await clinicsService.delete(id)
      successMessage.value = i18n.global.t('errors.clinicDeleted')
      await fetchAllClinics(statusFilter.value)
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.clinicDelete'))
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    clinics,
    statusFilter,
    query,
    total,
    loading,
    error,
    successMessage,
    clearMessages,
    fetchAllClinics,
    createClinic,
    updateClinic,
    toggleClinicStatus,
    deleteClinic,
  }
})
