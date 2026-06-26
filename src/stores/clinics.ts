import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '../i18n'
import { clinicsService, type ClinicPayload } from '../services/clinics'
import { getErrorMessage } from '../utils/errors'

export const useClinicsStore = defineStore('clinics', () => {
  const clinics = ref<Awaited<ReturnType<typeof clinicsService.getAll>>>([])
  const statusFilter = ref<'ACTIVE' | 'INACTIVE' | 'ALL'>('ALL')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const clearMessages = () => {
    error.value = null
    successMessage.value = null
  }

  const fetchAllClinics = async (status?: 'ACTIVE' | 'INACTIVE' | 'ALL') => {
    if (status) {
      statusFilter.value = status
    }

    loading.value = true
    error.value = null
    try {
      const data =
        statusFilter.value === 'ACTIVE' || statusFilter.value === 'INACTIVE'
          ? await clinicsService.getByStatus(statusFilter.value)
          : await clinicsService.getAll()
      clinics.value = Array.isArray(data) ? data : []
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
