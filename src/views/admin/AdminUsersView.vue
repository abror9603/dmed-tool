<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Users, Trash2, Edit2, Shield } from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import AdminRefreshButton from '../../components/admin/AdminRefreshButton.vue'
import { useUsersStore } from '../../stores/users'
import type { User } from '../../services/users'

const { t } = useI18n()
const store = useUsersStore()

const users = computed(() => store.users)
const loading = computed(() => store.loading)

const editId = ref<number | null>(null)
const formLogin = ref('')
const formPassword = ref('')
const formFirstName = ref('')
const formLastName = ref('')
const formEmail = ref('')
const formAccountType = ref('ADMIN')

async function refresh(): Promise<void> {
  store.clearMessages()
  await store.fetchUsers()
}

function resetForm(): void {
  editId.value = null
  formLogin.value = ''
  formPassword.value = ''
  formFirstName.value = ''
  formLastName.value = ''
  formEmail.value = ''
  formAccountType.value = 'ADMIN'
}

function startEdit(user: User): void {
  editId.value = user.id
  formLogin.value = user.login
  formPassword.value = ''
  formFirstName.value = user.firstName ?? ''
  formLastName.value = user.lastName ?? ''
  formEmail.value = user.email ?? ''
  formAccountType.value = user.accountType ?? 'ADMIN'
}

async function saveUser(): Promise<void> {
  if (!formLogin.value.trim()) {
    alert(t('users.loginRequired'))
    return
  }
  if (editId.value === null && !formPassword.value) {
    alert(t('users.passwordRequired'))
    return
  }

  const payload = {
    login: formLogin.value.trim(),
    firstName: formFirstName.value || undefined,
    lastName: formLastName.value || undefined,
    email: formEmail.value || undefined,
    accountType: formAccountType.value || undefined,
    ...(formPassword.value ? { password: formPassword.value } : {}),
  }

  if (editId.value !== null) {
    await store.updateUser(editId.value, payload)
  } else {
    await store.createUser(payload)
  }
  resetForm()
}

async function removeUser(id: number): Promise<void> {
  if (!confirm(t('users.confirmDelete'))) return
  await store.deleteUser(id)
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <AdminRefreshButton :loading="loading" @refresh="refresh" />
    <AdminAlerts :error="store.error" :success="store.successMessage" />

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div class="lg:col-span-4">
        <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
          <h2 class="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-bold dark:border-slate-800">
            <Users class="h-4 w-4 text-brand-primary" />
            <span>{{ editId !== null ? t('users.editUser') : t('users.addUser') }}</span>
          </h2>

          <form class="space-y-3" @submit.prevent="saveUser">
            <input
              v-model="formLogin"
              type="text"
              required
              :placeholder="t('users.loginPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <input
              v-model="formPassword"
              type="password"
              :required="editId === null"
              :placeholder="editId !== null ? t('users.passwordOptional') : t('users.passwordPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <input
              v-model="formFirstName"
              type="text"
              :placeholder="t('users.firstName')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <input
              v-model="formLastName"
              type="text"
              :placeholder="t('users.lastName')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <input
              v-model="formEmail"
              type="email"
              :placeholder="t('users.email')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <select
              v-model="formAccountType"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>

            <div class="flex gap-2 pt-1">
              <button
                type="submit"
                class="flex-1 rounded-lg bg-brand-primary py-2 text-xs font-bold text-white hover:bg-brand-primary/95"
                :disabled="loading"
              >
                {{ editId !== null ? t('common.save') : t('common.add') }}
              </button>
              <button
                v-if="editId !== null"
                type="button"
                class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                @click="resetForm"
              >
                {{ t('common.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card sm:p-6 lg:col-span-8">
        <h2 class="flex items-center gap-2 border-b border-slate-200 pb-3 text-sm font-bold dark:border-slate-800">
          <Shield class="h-4.5 w-4.5 text-brand-primary" />
          <span>{{ t('users.listTitle') }}</span>
          <span class="ml-auto rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xxs text-slate-500 dark:bg-slate-800">
            {{ users.length }}
          </span>
        </h2>

        <div v-if="loading && users.length === 0" class="py-12 text-center text-xs text-slate-400">
          {{ t('common.loading') }}
        </div>
        <div v-else-if="users.length === 0" class="py-12 text-center text-xs text-slate-400">
          {{ t('users.empty') }}
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th class="px-2 py-3">ID</th>
                <th class="px-2 py-3">{{ t('users.login') }}</th>
                <th class="px-2 py-3">{{ t('users.fullName') }}</th>
                <th class="px-2 py-3">{{ t('users.email') }}</th>
                <th class="px-2 py-3">{{ t('users.accountType') }}</th>
                <th class="px-2 py-3 text-right">{{ t('clinics.table.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="user in users" :key="user.id" class="text-slate-700 dark:text-slate-300">
                <td class="px-2 py-3 font-mono text-[10px] text-slate-400">#{{ user.id }}</td>
                <td class="px-2 py-3 font-semibold">{{ user.login }}</td>
                <td class="px-2 py-3">{{ [user.firstName, user.lastName].filter(Boolean).join(' ') || '—' }}</td>
                <td class="px-2 py-3">{{ user.email || '—' }}</td>
                <td class="px-2 py-3">
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-800">
                    {{ user.accountType || '—' }}
                  </span>
                </td>
                <td class="px-2 py-3 text-right">
                  <div class="flex justify-end gap-1.5">
                    <button
                      type="button"
                      class="rounded bg-slate-100 p-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      :title="t('common.edit')"
                      @click="startEdit(user)"
                    >
                      <Edit2 class="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      class="rounded bg-red-500/10 p-1.5 text-red-500 hover:bg-red-500 hover:text-white"
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
      </div>
    </div>
  </div>
</template>
