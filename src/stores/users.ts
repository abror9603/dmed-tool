import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '../i18n'
import { usersService, type UserPayload, type UsersQuery } from '../services/users'
import { DEFAULT_PAGE_SIZE } from '../utils/pagination'
import { getErrorMessage } from '../utils/errors'

const DEFAULT_FILTERS: UsersQuery = {
  page: 0,
  size: DEFAULT_PAGE_SIZE,
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<Awaited<ReturnType<typeof usersService.getAll>>['users']>([])
  const filters = ref<UsersQuery>({ ...DEFAULT_FILTERS })
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  function clearMessages(): void {
    error.value = null
    successMessage.value = null
  }

  async function fetchUsers(query?: Partial<UsersQuery>): Promise<void> {
    loading.value = true
    error.value = null
    try {
      if (query) {
        filters.value = { ...filters.value, ...query }
      }
      const result = await usersService.getAll(filters.value)
      users.value = result.users
      total.value = result.total
      filters.value.page = result.page
      filters.value.size = result.size
    } catch (err) {
      error.value = getErrorMessage(err, i18n.global.t('errors.usersLoad'))
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetFilters(): Promise<void> {
    filters.value = { ...DEFAULT_FILTERS }
    await fetchUsers()
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
    filters,
    total,
    loading,
    error,
    successMessage,
    clearMessages,
    fetchUsers,
    resetFilters,
    createUser,
    updateUser,
    deleteUser,
  }
})
