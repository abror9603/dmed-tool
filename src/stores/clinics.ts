import { defineStore } from 'pinia'
import { ref } from 'vue'
import { clinicsService, type Clinic, type ClinicPayload } from '../services/clinics'

export const useClinicsStore = defineStore('clinics', () => {
  const clinics = ref<Clinic[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const clearMessages = () => {
    error.value = null
    successMessage.value = null
  }

  const fetchAllClinics = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await clinicsService.getAll()
      clinics.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Klinikalarni yuklashda xatolik."
      throw err
    } finally {
      loading.value = false
    }
  }

  const createClinic = async (payload: ClinicPayload) => {
    loading.value = true
    error.value = null
    try {
      const newClinic = await clinicsService.create(payload)
      successMessage.value = "Yangi klinika muvaffaqiyatli qo'shildi!"
      await fetchAllClinics()
      return newClinic
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Klinika yaratishda xatolik."
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateClinic = async (id: number | string, payload: ClinicPayload) => {
    loading.value = true
    error.value = null
    try {
      const updated = await clinicsService.update(id, payload)
      successMessage.value = "Klinika ma'lumotlari muvaffaqiyatli yangilandi!"
      await fetchAllClinics()
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Klinika tahrirlashda xatolik."
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleClinicStatus = async (id: number | string) => {
    loading.value = true
    error.value = null
    try {
      const updated = await clinicsService.toggleStatus(id)
      successMessage.value = "Klinika statusi muvaffaqiyatli yangilandi!"
      await fetchAllClinics()
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Statusni o'zgartirishda xatolik."
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
      successMessage.value = "Klinika muvaffaqiyatli o'chirildi!"
      await fetchAllClinics()
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Klinikani o'chirishda xatolik."
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    clinics,
    loading,
    error,
    successMessage,
    clearMessages,
    fetchAllClinics,
    createClinic,
    updateClinic,
    toggleClinicStatus,
    deleteClinic
  }
})
