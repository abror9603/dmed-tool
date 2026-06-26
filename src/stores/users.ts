import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '../i18n'
import { usersService, type UserPayload } from '../services/users'
import { getErrorMessage } from '../utils/errors'

export const useUsersStore = defineStore('users', () => {
  const users = ref<Awaited<ReturnType<typeof usersService.getAll>>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  function clearMessages(): void {
    error.value = null
    successMessage.value = null
  }

  async function fetchUsers(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await usersService.getAll()
      users.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.usersLoad'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload: UserPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await usersService.create(payload)
      successMessage.value = i18n.global.t('errors.userCreated')
      await fetchUsers()
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.userCreate'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number | string, payload: UserPayload): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await usersService.update(id, payload)
      successMessage.value = i18n.global.t('errors.userUpdated')
      await fetchUsers()
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.userUpdate'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number | string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await usersService.delete(id)
      successMessage.value = i18n.global.t('errors.userDeleted')
      await fetchUsers()
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.userDelete'))
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    successMessage,
    clearMessages,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
})
