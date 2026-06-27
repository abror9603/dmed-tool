/**
 * Laboratories store — admin lab list with status filter, pagination, and CRUD.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '../i18n'
import { labsService, type LabsQuery } from '../services/labs'
import type { LabPayload } from '../types/lab.types'
import { DEFAULT_PAGE_SIZE } from '../utils/pagination'
import { getErrorMessage } from '../utils/errors'

const DEFAULT_QUERY: LabsQuery = {
  page: 0,
  size: DEFAULT_PAGE_SIZE,
}

export const useLabsStore = defineStore('labs', () => {
  const labs = ref<Awaited<ReturnType<typeof labsService.getPage>>['items']>([])
  const statusFilter = ref<'ACTIVE' | 'INACTIVE' | 'ALL'>('ALL')
  const query = ref<LabsQuery>({ ...DEFAULT_QUERY })
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  function clearMessages(): void {
    error.value = null
    successMessage.value = null
  }

  async function fetchAllLabs(status?: 'ACTIVE' | 'INACTIVE' | 'ALL', page?: number): Promise<void> {
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
          ? await labsService.getPageByStatus(statusFilter.value, query.value)
          : await labsService.getPage(query.value)
      labs.value = result.items
      total.value = result.total
      query.value.page = result.page
      query.value.size = result.size
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.labsLoad'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateLab(id: number | string, payload: LabPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await labsService.update(id, payload)
      successMessage.value = i18n.global.t('errors.labUpdated')
      await fetchAllLabs(statusFilter.value)
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.labUpdate'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleLabStatus(id: number | string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await labsService.toggleStatus(id)
      successMessage.value = i18n.global.t('errors.statusUpdated')
      await fetchAllLabs(statusFilter.value)
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.labStatus'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function regenerateLabKey(id: number | string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await labsService.regenerateKey(id)
      successMessage.value = i18n.global.t('errors.labKeyRegenerated')
      await fetchAllLabs(statusFilter.value)
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.labKeyRegenerate'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteLab(id: number | string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await labsService.delete(id)
      successMessage.value = i18n.global.t('errors.labDeleted')
      await fetchAllLabs(statusFilter.value)
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.labDelete'))
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    labs,
    statusFilter,
    query,
    total,
    loading,
    error,
    successMessage,
    clearMessages,
    fetchAllLabs,
    updateLab,
    toggleLabStatus,
    regenerateLabKey,
    deleteLab,
  }
})
