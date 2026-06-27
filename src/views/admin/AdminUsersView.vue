<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Users, Trash2, Search, Edit2 } from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import AdminRefreshButton from '../../components/admin/AdminRefreshButton.vue'
import AdminPagination from '../../components/admin/AdminPagination.vue'
import AppSelect from '../../components/ui/AppSelect.vue'
import { useUsersStore } from '../../stores/users'
import { useAdminLabels } from '../../composables/useAdminLabels'
import { useConfirmDialog } from '../../composables/useConfirmDialog'
import type { AccountType, User } from '../../services/users'
import { DEFAULT_PAGE_SIZE, rowNumber } from '../../utils/pagination'

const { t } = useI18n()
const { accountTypeLabel } = useAdminLabels()
const { confirm, alert: showAlert } = useConfirmDialog()
const store = useUsersStore()

const users = computed(() => store.users)
const loading = computed(() => store.loading)
const total = computed(() => store.total)
const currentPage = computed(() => store.filters.page ?? 0)
const pageSize = computed(() => store.filters.size ?? DEFAULT_PAGE_SIZE)

const editId = ref<number | string | null>(null)
const formLogin = ref('')
const formPassword = ref('')
const formFirstName = ref('')
const formLastName = ref('')
const formEmail = ref('')
const formAccountType = ref('' as '' | AccountType)
const formPhoneNumber = ref('')
const formGenderType = ref('')

const draftFilters = reactive({
  accountType: '' as '' | AccountType,
  firstName: '',
  lastName: '',
  genderType: '',
  phoneNumber: '',
})

const accountTypeOptions = computed(() => [
  { value: '' as const, label: t('users.filterAll') },
  { value: 'ADMIN' as const, label: accountTypeLabel('ADMIN') },
  { value: 'DOCTOR' as const, label: accountTypeLabel('DOCTOR') },
  { value: 'OPERATOR' as const, label: accountTypeLabel('OPERATOR') },
])

const editAccountTypeOptions = computed(() => [
  { value: '' as const, label: '—' },
  { value: 'ADMIN' as const, label: accountTypeLabel('ADMIN') },
  { value: 'DOCTOR' as const, label: accountTypeLabel('DOCTOR') },
  { value: 'OPERATOR' as const, label: accountTypeLabel('OPERATOR') },
])

function syncDraftFromStore(): void {
  draftFilters.accountType = (store.filters.accountType ?? '') as '' | AccountType
  draftFilters.firstName = store.filters.firstName ?? ''
  draftFilters.lastName = store.filters.lastName ?? ''
  draftFilters.genderType = store.filters.genderType ?? ''
  draftFilters.phoneNumber = store.filters.phoneNumber ?? ''
}

function resetEditForm(): void {
  editId.value = null
  formLogin.value = ''
  formPassword.value = ''
  formFirstName.value = ''
  formLastName.value = ''
  formEmail.value = ''
  formAccountType.value = ''
  formPhoneNumber.value = ''
  formGenderType.value = ''
}

function startEdit(user: User): void {
  editId.value = user.id
  formLogin.value = user.login
  formPassword.value = ''
  formFirstName.value = user.firstName ?? ''
  formLastName.value = user.lastName ?? ''
  formEmail.value = user.email ?? ''
  formAccountType.value = (user.accountType as AccountType | undefined) ?? ''
  formPhoneNumber.value = user.phoneNumber ?? ''
  formGenderType.value = user.genderType ?? ''
}

async function saveUser(): Promise<void> {
  if (!editId.value || !formLogin.value.trim()) {
    await showAlert(t('users.fillRequired'))
    return
  }

  store.clearMessages()

  const payload = {
    login: formLogin.value.trim(),
    firstName: formFirstName.value.trim() || undefined,
    lastName: formLastName.value.trim() || undefined,
    email: formEmail.value.trim() || undefined,
    accountType: formAccountType.value || undefined,
    phoneNumber: formPhoneNumber.value.trim() || undefined,
    genderType: formGenderType.value.trim() || undefined,
    ...(formPassword.value ? { password: formPassword.value } : {}),
  }

  try {
    await store.updateUser(editId.value, payload)
    resetEditForm()
  } catch {
    // handled in store
  }
}

async function refresh(): Promise<void> {
  store.clearMessages()
  await store.fetchUsers()
}

async function applyFilters(): Promise<void> {
  store.clearMessages()
  await store.fetchUsers({
    accountType: draftFilters.accountType || undefined,
    firstName: draftFilters.firstName || undefined,
    lastName: draftFilters.lastName || undefined,
    genderType: draftFilters.genderType || undefined,
    phoneNumber: draftFilters.phoneNumber || undefined,
    page: 0,
  })
}

async function resetFilters(): Promise<void> {
  store.clearMessages()
  draftFilters.accountType = ''
  draftFilters.firstName = ''
  draftFilters.lastName = ''
  draftFilters.genderType = ''
  draftFilters.phoneNumber = ''
  await store.resetFilters()
}

async function goToPage(page: number): Promise<void> {
  if (page < 0 || page === currentPage.value) return
  store.clearMessages()
  await store.fetchUsers({ page })
}

async function removeUser(id: number | string): Promise<void> {
  const ok = await confirm({
    title: t('common.delete'),
    message: t('users.confirmDelete'),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })
  if (!ok) return
  if (editId.value === id) {
    resetEditForm()
  }
  try {
    await store.deleteUser(id)
  } catch {
    // handled in store
  }
}

onMounted(() => {
  syncDraftFromStore()
  refresh()
})
</script>

<template>
  <div class="w-full space-y-4">
    <AdminRefreshButton :loading="loading" @refresh="refresh" />
    <AdminAlerts :error="store.error" :success="store.successMessage" />

    <p class="text-xs text-slate-500">
      {{ t('users.listHint') }}
    </p>

    <form
      class="grid grid-cols-1 gap-3 rounded-xl border border-slate-700/70 bg-[#111b2e] p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"
      @submit.prevent="applyFilters"
    >
      <label class="space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.accountType') }}</span>
        <AppSelect v-model="draftFilters.accountType">
          <option v-for="opt in accountTypeOptions" :key="opt.value || 'all'" :value="opt.value">
            {{ opt.label }}
          </option>
        </AppSelect>
      </label>

      <label class="space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.firstName') }}</span>
        <input
          v-model="draftFilters.firstName"
          type="text"
          class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
        />
      </label>

      <label class="space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.lastName') }}</span>
        <input
          v-model="draftFilters.lastName"
          type="text"
          class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
        />
      </label>

      <label class="space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.genderType') }}</span>
        <input
          v-model="draftFilters.genderType"
          type="text"
          class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
        />
      </label>

      <label class="space-y-1">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.phoneNumber') }}</span>
        <input
          v-model="draftFilters.phoneNumber"
          type="text"
          class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
        />
      </label>

      <div class="flex items-end gap-2 sm:col-span-2 lg:col-span-1 xl:col-span-1">
        <button
          type="submit"
          class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-xs font-bold text-white hover:bg-brand-primary/90"
        >
          <Search class="h-3.5 w-3.5" />
          {{ t('users.search') }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          @click="resetFilters"
        >
          {{ t('common.reset') }}
        </button>
      </div>
    </form>

    <div
      v-if="editId !== null"
      class="space-y-4 rounded-xl border border-cyan-500/30 bg-[#111b2e] p-4"
    >
      <h2 class="flex items-center gap-2 border-b border-slate-700/80 pb-3 text-sm font-bold text-white">
        <Edit2 class="h-4.5 w-4.5 text-brand-primary" />
        <span>{{ t('users.editUser') }}</span>
      </h2>

      <form class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="saveUser">
        <label class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.login') }} *</span>
          <input
            v-model="formLogin"
            type="text"
            required
            :placeholder="t('users.loginPlaceholder')"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </label>

        <label class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.passwordOptional') }}</span>
          <input
            v-model="formPassword"
            type="password"
            :placeholder="t('users.passwordPlaceholder')"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </label>

        <label class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.accountType') }}</span>
          <AppSelect v-model="formAccountType">
            <option v-for="opt in editAccountTypeOptions" :key="opt.value || 'none'" :value="opt.value">
              {{ opt.label }}
            </option>
          </AppSelect>
        </label>

        <label class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.firstName') }}</span>
          <input
            v-model="formFirstName"
            type="text"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </label>

        <label class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.lastName') }}</span>
          <input
            v-model="formLastName"
            type="text"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </label>

        <label class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.email') }}</span>
          <input
            v-model="formEmail"
            type="email"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </label>

        <label class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.phoneNumber') }}</span>
          <input
            v-model="formPhoneNumber"
            type="text"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </label>

        <label class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ t('users.genderType') }}</span>
          <input
            v-model="formGenderType"
            type="text"
            class="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
          />
        </label>

        <div class="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            class="rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary/90 disabled:opacity-50"
            :disabled="loading"
          >
            {{ t('common.save') }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            @click="resetEditForm"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-700/70 bg-[#111b2e]">
      <div class="flex items-center gap-2 border-b border-slate-700/80 px-4 py-3">
        <Users class="h-4 w-4 text-cyan-400" />
        <h2 class="text-sm font-bold text-white">{{ t('users.listTitle') }}</h2>
        <span class="ml-auto rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
          {{ total }}
        </span>
      </div>

      <div v-if="loading && users.length === 0" class="py-10 text-center text-xs text-slate-500">
        {{ t('common.loading') }}
      </div>
      <div v-else-if="users.length === 0" class="py-10 text-center text-xs text-slate-500">
        {{ t('users.empty') }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col class="w-14" />
            <col class="w-[14%]" />
            <col class="w-[18%]" />
            <col class="w-[12%]" />
            <col class="w-20" />
            <col class="w-[18%]" />
            <col class="w-28" />
            <col class="w-[72px]" />
          </colgroup>
          <thead>
            <tr class="border-b border-slate-700/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th class="px-3 py-2 text-left">{{ t('clinics.table.id') }}</th>
              <th class="px-3 py-2 text-left">{{ t('users.login') }}</th>
              <th class="px-3 py-2 text-left">{{ t('users.fullName') }}</th>
              <th class="px-3 py-2 text-left">{{ t('users.phoneNumber') }}</th>
              <th class="px-3 py-2 text-left">{{ t('users.genderType') }}</th>
              <th class="px-3 py-2 text-left">{{ t('users.email') }}</th>
              <th class="px-3 py-2 text-left">{{ t('users.accountType') }}</th>
              <th class="px-3 py-2 text-right">{{ t('clinics.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80 text-slate-300">
            <tr v-for="(user, index) in users" :key="user.id" class="hover:bg-slate-800/40">
              <td class="px-3 py-2 text-[11px] font-semibold tabular-nums text-slate-400">
                {{ rowNumber(currentPage, pageSize, index) }}
              </td>
              <td class="px-3 py-2 truncate font-semibold text-white" :title="user.login">{{ user.login }}</td>
              <td class="px-3 py-2 truncate" :title="[user.firstName, user.lastName].filter(Boolean).join(' ')">
                {{ [user.firstName, user.lastName].filter(Boolean).join(' ') || '—' }}
              </td>
              <td class="px-3 py-2 truncate">{{ user.phoneNumber || '—' }}</td>
              <td class="px-3 py-2">{{ user.genderType || '—' }}</td>
              <td class="px-3 py-2 truncate" :title="user.email || ''">{{ user.email || '—' }}</td>
              <td class="px-3 py-2">
                <span
                  v-if="user.accountType"
                  class="inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300"
                >
                  {{ accountTypeLabel(user.accountType) }}
                </span>
                <span v-else class="text-slate-600">—</span>
              </td>
              <td class="px-3 py-2 text-right">
                <div class="inline-flex gap-1">
                  <button
                    type="button"
                    class="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                    :class="editId === user.id ? 'bg-cyan-500/10 text-cyan-300' : ''"
                    :title="t('common.edit')"
                    @click="startEdit(user)"
                  >
                    <Edit2 class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="rounded p-1.5 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    :title="t('common.delete')"
                    @click="removeUser(user.id)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AdminPagination
        :page="currentPage"
        :total="total"
        :page-size="pageSize"
        :loading="loading"
        @change="goToPage"
      />
    </div>
  </div>
</template>
