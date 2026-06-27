<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Hospital,
  Phone,
  MapPin,
  Mail,
  Trash2,
  Edit2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import AdminRefreshButton from '../../components/admin/AdminRefreshButton.vue'
import AdminPagination from '../../components/admin/AdminPagination.vue'
import MaskedSecretKeyButton from '../../components/ui/MaskedSecretKeyButton.vue'
import { useClinicsStore } from '../../stores/clinics'
import { clinicsService } from '../../services/clinics'
import type { Clinic } from '../../types/clinic.types'
import { useAdminLabels } from '../../composables/useAdminLabels'
import { useConfirmDialog } from '../../composables/useConfirmDialog'
import { getErrorMessage } from '../../utils/errors'
import { DEFAULT_PAGE_SIZE, rowNumber } from '../../utils/pagination'
import { copySecretKey } from '../../utils/secret-key'

const { t } = useI18n()
const { statusLabel } = useAdminLabels()
const { confirm, alert: showAlert } = useConfirmDialog()
const clinicsStore = useClinicsStore()

const clinics = computed(() => clinicsStore.clinics)
const total = computed(() => clinicsStore.total)
const currentPage = computed(() => clinicsStore.query.page ?? 0)
const pageSize = computed(() => clinicsStore.query.size ?? DEFAULT_PAGE_SIZE)
const loading = computed(() => clinicsStore.loading)
const error = computed({
  get: () => clinicsStore.error || '',
  set: (val) => {
    clinicsStore.error = val
  },
})
const successMessage = computed({
  get: () => clinicsStore.successMessage || '',
  set: (val) => {
    clinicsStore.successMessage = val
  },
})

const editId = ref<number | string | null>(null)
const editLoading = ref(false)
const formName = ref('')
const formAddress = ref('')
const formPhone = ref('')
const formEmail = ref('')
const copiedKey = ref<string | null>(null)

const statusFilter = computed({
  get: () => clinicsStore.statusFilter,
  set: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => {
    clinicsStore.statusFilter = value
  },
})

const statusTabs = computed(() => [
  { value: 'ALL' as const, label: t('clinics.filterAll') },
  { value: 'ACTIVE' as const, label: t('clinics.filterActive') },
  { value: 'INACTIVE' as const, label: t('clinics.filterInactive') },
])

function copyKeyToClipboard(text: string, id: string): void {
  void copySecretKey(text).then(() => {
    copiedKey.value = id
    setTimeout(() => {
      copiedKey.value = null
    }, 2000)
  })
}

function fillEditForm(clinic: Clinic): void {
  editId.value = clinic.id
  formName.value = clinic.name
  formAddress.value = clinic.address
  formPhone.value = clinic.phone || clinic.contactInfo || clinic.contact || ''
  formEmail.value = clinic.email
}

async function fetchClinics(page?: number): Promise<void> {
  try {
    clinicsStore.clearMessages()
    await clinicsStore.fetchAllClinics(statusFilter.value, page)
  } catch {
    // handled in store
  }
}

async function goToPage(page: number): Promise<void> {
  await fetchClinics(page)
}

async function setStatusFilter(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): Promise<void> {
  statusFilter.value = status
  await fetchClinics(0)
}

async function saveClinic(): Promise<void> {
  if (editId.value === null) return

  if (!formName.value || !formAddress.value || !formPhone.value || !formEmail.value) {
    await showAlert(t('clinics.fillAllFields'))
    return
  }

  clinicsStore.clearMessages()

  const payload = {
    name: formName.value,
    address: formAddress.value,
    phone: formPhone.value,
    email: formEmail.value,
  }

  try {
    await clinicsStore.updateClinic(editId.value, payload)
    resetForm()
  } catch {
    // handled in store
  }
}

async function startEdit(clinic: Clinic): Promise<void> {
  clinicsStore.clearMessages()
  editLoading.value = true

  try {
    const fresh = await clinicsService.getById(clinic.id)
    fillEditForm(fresh)
  } catch (err) {
    clinicsStore.error = getErrorMessage(err, t('errors.clinicsLoad'))
    fillEditForm(clinic)
  } finally {
    editLoading.value = false
  }
}

function resetForm(): void {
  editId.value = null
  formName.value = ''
  formAddress.value = ''
  formPhone.value = ''
  formEmail.value = ''
}

async function toggleStatus(clinic: Clinic): Promise<void> {
  try {
    clinicsStore.clearMessages()
    await clinicsStore.toggleClinicStatus(clinic.id)
  } catch {
    // handled in store
  }
}

async function deleteClinic(id: number | string): Promise<void> {
  const ok = await confirm({
    title: t('common.delete'),
    message: t('clinics.confirmDelete'),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })
  if (!ok) return

  if (editId.value === id) {
    resetForm()
  }

  try {
    clinicsStore.clearMessages()
    await clinicsStore.deleteClinic(id)
  } catch {
    // handled in store
  }
}

onMounted(() => {
  fetchClinics()
})
</script>

<template>
  <div class="w-full space-y-4">
    <AdminRefreshButton :loading="loading" @refresh="fetchClinics" />

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        class="rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
        :class="
          statusFilter === tab.value
            ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
            : 'border-slate-700 text-slate-400 hover:bg-slate-800/60'
        "
        @click="setStatusFilter(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <AdminAlerts :error="error || null" :success="successMessage || null" />

    <p class="text-xs text-slate-500">
      {{ t('clinics.listHint') }}
    </p>

    <div
      v-if="editId !== null"
      class="space-y-4 rounded-xl border border-cyan-500/30 bg-[#111b2e] p-4"
    >
      <h2 class="flex items-center space-x-2 border-b border-slate-700/80 pb-2 text-sm font-bold text-white">
        <Hospital class="h-4 w-4 text-brand-primary" />
        <span>{{ t('clinics.editClinic') }}</span>
        <span v-if="editLoading" class="ml-auto text-xxs font-normal text-slate-400">{{ t('common.loading') }}</span>
      </h2>

      <form class="grid grid-cols-1 gap-3 sm:grid-cols-2" @submit.prevent="saveClinic">
        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase text-slate-400">{{ t('clinics.clinicName') }}</label>
          <div class="relative">
            <Hospital class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              v-model="formName"
              type="text"
              required
              :disabled="editLoading"
              :placeholder="t('clinics.namePlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-brand-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase text-slate-400">{{ t('clinics.clinicAddress') }}</label>
          <div class="relative">
            <MapPin class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              v-model="formAddress"
              type="text"
              required
              :disabled="editLoading"
              :placeholder="t('clinics.addressPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-brand-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase text-slate-400">{{ t('clinics.phone') }}</label>
          <div class="relative">
            <Phone class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              v-model="formPhone"
              type="text"
              required
              :disabled="editLoading"
              :placeholder="t('clinics.phonePlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-brand-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-[10px] font-bold uppercase text-slate-400">{{ t('clinics.email') }}</label>
          <div class="relative">
            <Mail class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              v-model="formEmail"
              type="email"
              required
              :disabled="editLoading"
              :placeholder="t('clinics.emailPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-brand-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
        </div>

        <div class="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            class="rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-primary/95 active:scale-95 disabled:opacity-60"
            :disabled="editLoading || loading"
          >
            {{ t('common.save') }}
          </button>
          <button
            type="button"
            class="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            @click="resetForm"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </form>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-700/70 bg-[#111b2e]">
      <div class="flex items-center justify-between border-b border-slate-700/80 px-4 py-3">
        <h2 class="flex items-center gap-2 text-sm font-bold text-white">
          <Hospital class="h-4 w-4 text-cyan-400" />
          <span>{{ t('clinics.registeredClinics') }}</span>
        </h2>
        <span class="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
          {{ t('clinics.count', { count: total }) }}
        </span>
      </div>

      <div v-if="loading && clinics.length === 0" class="flex flex-col items-center justify-center space-y-2 py-10 text-slate-400">
        <RefreshCw class="h-7 w-7 animate-spin text-cyan-400" />
        <p class="text-xs">{{ t('common.loading') }}</p>
      </div>

      <div
        v-else-if="clinics.length === 0"
        class="flex flex-col items-center justify-center space-y-2 py-10"
      >
        <ShieldAlert class="h-7 w-7 text-slate-600" />
        <p class="text-xs text-slate-500">{{ t('clinics.emptyList') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col class="w-14" />
            <col class="w-[26%]" />
            <col class="w-[22%]" />
            <col class="w-24" />
            <col />
            <col class="w-[72px]" />
          </colgroup>
          <thead>
            <tr class="border-b border-slate-700/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th class="px-3 py-2 text-left">{{ t('clinics.table.id') }}</th>
              <th class="px-3 py-2 text-left">{{ t('clinics.table.clinic') }}</th>
              <th class="px-3 py-2 text-left">{{ t('clinics.table.contact') }}</th>
              <th class="px-3 py-2 text-center">{{ t('clinics.table.status') }}</th>
              <th class="px-3 py-2 text-left">{{ t('clinics.table.secretKey') }}</th>
              <th class="px-3 py-2 text-right">{{ t('clinics.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80 text-slate-300">
            <tr
              v-for="(clinic, index) in clinics"
              :key="clinic.id"
              class="transition-colors hover:bg-slate-800/40"
            >
              <td class="px-3 py-2 text-[11px] font-semibold tabular-nums text-slate-400">
                {{ rowNumber(currentPage, pageSize, index) }}
              </td>
              <td class="px-3 py-2">
                <div class="truncate font-semibold text-white" :title="clinic.name">{{ clinic.name }}</div>
                <div class="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin class="h-3 w-3 shrink-0" />
                  <span class="truncate" :title="clinic.address">{{ clinic.address }}</span>
                </div>
              </td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-1 truncate text-slate-300">
                  <Phone class="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span class="truncate">{{ clinic.phone || clinic.contactInfo || clinic.contact || '—' }}</span>
                </div>
                <div class="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
                  <Mail class="h-3.5 w-3.5 shrink-0" />
                  <span class="truncate" :title="clinic.email">{{ clinic.email }}</span>
                </div>
              </td>
              <td class="px-3 py-2 text-center">
                <button
                  type="button"
                  class="rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all active:scale-95"
                  :class="
                    clinic.status === 'ACTIVE'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-600 bg-slate-800 text-slate-400'
                  "
                  @click="toggleStatus(clinic)"
                >
                  {{ statusLabel(clinic.status || 'INACTIVE') }}
                </button>
              </td>
              <td class="px-3 py-2">
                <div v-if="clinic.secretKey">
                  <MaskedSecretKeyButton
                    :secret-key="clinic.secretKey"
                    :copied="copiedKey === clinic.id.toString()"
                    :title="t('clinics.copyKey')"
                    @copy="copyKeyToClipboard(clinic.secretKey, clinic.id.toString())"
                  />
                </div>
                <div v-else class="text-[11px] italic text-slate-500">{{ t('clinics.keyCreatedOnActivate') }}</div>
              </td>
              <td class="px-3 py-2 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-cyan-300"
                    :class="editId === clinic.id ? 'bg-cyan-500/10 text-cyan-300' : ''"
                    :title="t('common.edit')"
                    @click="startEdit(clinic)"
                  >
                    <Edit2 class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="rounded p-1.5 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                    :title="t('common.delete')"
                    @click="deleteClinic(clinic.id)"
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
