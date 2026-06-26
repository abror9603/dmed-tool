<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Hospital,
  Phone,
  MapPin,
  Mail,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import AdminRefreshButton from '../../components/admin/AdminRefreshButton.vue'
import { useClinicsStore } from '../../stores/clinics'
import { clinicsService, type Clinic } from '../../services/clinics'
import { getErrorMessage } from '../../utils/errors'

const { t } = useI18n()
const clinicsStore = useClinicsStore()

const clinics = computed(() => clinicsStore.clinics)
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

const editId = ref<number | null>(null)
const formName = ref('')
const formAddress = ref('')
const formPhone = ref('')
const formEmail = ref('')

const checkKey = ref('')
const validationLoading = ref(false)
const validationResult = ref<Clinic | null>(null)
const validationError = ref('')
const copiedKey = ref<string | null>(null)
const statusFilter = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

const statusTabs = computed(() => [
  { value: 'ALL' as const, label: t('clinics.filterAll') },
  { value: 'ACTIVE' as const, label: t('clinics.filterActive') },
  { value: 'INACTIVE' as const, label: t('clinics.filterInactive') },
])

function copyKeyToClipboard(text: string, id: string): void {
  navigator.clipboard.writeText(text)
  copiedKey.value = id
  setTimeout(() => {
    copiedKey.value = null
  }, 2000)
}

async function fetchClinics(): Promise<void> {
  try {
    clinicsStore.clearMessages()
    await clinicsStore.fetchAllClinics(statusFilter.value)
  } catch {
    // handled in store
  }
}

async function setStatusFilter(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): Promise<void> {
  statusFilter.value = status
  await fetchClinics()
}

async function saveClinic(): Promise<void> {
  if (!formName.value || !formAddress.value || !formPhone.value || !formEmail.value) {
    alert(t('clinics.fillAllFields'))
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
    if (editId.value !== null) {
      await clinicsStore.updateClinic(editId.value, payload)
    } else {
      await clinicsStore.createClinic(payload)
    }
    resetForm()
  } catch {
    // handled in store
  }
}

function startEdit(clinic: Clinic): void {
  editId.value = clinic.id
  formName.value = clinic.name
  formAddress.value = clinic.address
  formPhone.value = clinic.phone || clinic.contactInfo || clinic.contact || ''
  formEmail.value = clinic.email
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

async function deleteClinic(id: number): Promise<void> {
  if (!confirm(t('clinics.confirmDelete'))) return

  try {
    clinicsStore.clearMessages()
    await clinicsStore.deleteClinic(id)
  } catch {
    // handled in store
  }
}

async function validateSecretKey(): Promise<void> {
  if (!checkKey.value) {
    alert(t('clinics.enterSecretKey'))
    return
  }

  validationLoading.value = true
  validationError.value = ''
  validationResult.value = null

  try {
    const data = await clinicsService.validateKey(checkKey.value)
    validationResult.value = data
  } catch (err) {
    validationError.value = getErrorMessage(err, t('clinics.validateKeyError'))
  } finally {
    validationLoading.value = false
  }
}

onMounted(() => {
  fetchClinics()
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <AdminRefreshButton :loading="loading" @refresh="fetchClinics" />

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        class="rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
        :class="
          statusFilter === tab.value
            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
            : 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
        "
        @click="setStatusFilter(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <AdminAlerts :error="error || null" :success="successMessage || null" />

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div class="space-y-6 lg:col-span-4">
        <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
          <h2 class="flex items-center space-x-2 border-b border-slate-200 pb-2 text-sm font-bold text-slate-800 dark:border-slate-800 dark:text-white">
            <Hospital class="h-4 w-4 text-brand-primary" />
            <span>{{ editId !== null ? t('clinics.editClinic') : t('clinics.addClinic') }}</span>
          </h2>

          <form class="space-y-3" @submit.prevent="saveClinic">
            <div>
              <label class="mb-1 block text-[10px] font-bold uppercase text-slate-400">{{ t('clinics.clinicName') }}</label>
              <div class="relative">
                <Hospital class="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  v-model="formName"
                  type="text"
                  required
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
                  :placeholder="t('clinics.emailPlaceholder')"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-brand-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
                />
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <button
                type="submit"
                class="flex-1 rounded-lg bg-brand-primary py-2 text-xs font-bold text-white transition-colors hover:bg-brand-primary/95 active:scale-95"
              >
                {{ editId !== null ? t('common.save') : t('common.add') }}
              </button>
              <button
                v-if="editId !== null"
                type="button"
                class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                @click="resetForm"
              >
                {{ t('common.cancel') }}
              </button>
            </div>
          </form>
        </div>

        <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
          <h2 class="flex items-center space-x-2 border-b border-slate-200 pb-2 text-sm font-bold text-slate-800 dark:border-slate-800 dark:text-white">
            <Key class="h-4 w-4 text-brand-primary" />
            <span>{{ t('clinics.secretKeyValidation') }}</span>
          </h2>

          <div class="space-y-3">
            <p class="text-[10px] leading-normal text-slate-500">{{ t('clinics.secretKeyHint') }}</p>
            <div class="flex gap-2">
              <input
                v-model="checkKey"
                type="text"
                :placeholder="t('clinics.secretKeyPlaceholder')"
                class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs focus:border-brand-primary focus:outline-none dark:border-slate-800 dark:bg-slate-900/60"
              />
              <button
                type="button"
                :disabled="validationLoading"
                class="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-900 dark:bg-slate-700"
                @click="validateSecretKey"
              >
                <RefreshCw v-if="validationLoading" class="h-3.5 w-3.5 animate-spin" />
                <span v-else>{{ t('clinics.check') }}</span>
              </button>
            </div>

            <div
              v-if="validationResult"
              class="animate-fade-in space-y-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <div class="flex items-center space-x-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 class="h-4 w-4" />
                <span>{{ t('clinics.keyValid') }}</span>
              </div>
              <div class="space-y-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                <div>{{ t('clinics.validationId') }}: {{ validationResult.id }}</div>
                <div>{{ t('clinics.validationName') }}: {{ validationResult.name }}</div>
                <div>{{ t('clinics.validationAddress') }}: {{ validationResult.address }}</div>
              </div>
            </div>

            <div
              v-if="validationError"
              class="animate-fade-in flex items-center space-x-1.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-600 dark:text-red-400"
            >
              <XCircle class="h-4 w-4" />
              <span>{{ validationError }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card sm:p-6 lg:col-span-8">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <h2 class="flex items-center space-x-2 text-sm font-bold text-slate-800 dark:text-white">
            <Hospital class="h-4.5 w-4.5 text-brand-primary" />
            <span>{{ t('clinics.registeredClinics') }}</span>
          </h2>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xxs font-semibold text-slate-500 dark:bg-slate-800">
            {{ t('clinics.count', { count: clinics.length }) }}
          </span>
        </div>

        <div v-if="loading && clinics.length === 0" class="flex flex-col items-center justify-center space-y-2 py-12 text-slate-400">
          <RefreshCw class="h-8 w-8 animate-spin text-brand-primary" />
          <p class="text-xs">{{ t('common.loading') }}</p>
        </div>

        <div
          v-else-if="clinics.length === 0"
          class="flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed border-slate-200 py-12 dark:border-slate-800"
        >
          <ShieldAlert class="h-8 w-8 text-slate-300 dark:text-slate-700" />
          <p class="text-xs text-slate-400">{{ t('clinics.emptyList') }}</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500">
                <th class="px-2 py-3">{{ t('clinics.table.id') }}</th>
                <th class="px-2 py-3">{{ t('clinics.table.clinic') }}</th>
                <th class="px-2 py-3">{{ t('clinics.table.contact') }}</th>
                <th class="px-2 py-3 text-center">{{ t('clinics.table.status') }}</th>
                <th class="px-2 py-3">{{ t('clinics.table.secretKey') }}</th>
                <th class="px-2 py-3 text-right">{{ t('clinics.table.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              <tr
                v-for="clinic in clinics"
                :key="clinic.id"
                class="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
              >
                <td class="px-2 py-3.5 font-mono text-[10px] text-slate-400">#{{ clinic.id }}</td>
                <td class="px-2 py-3.5">
                  <div class="font-bold text-slate-800 dark:text-slate-100">{{ clinic.name }}</div>
                  <div class="mt-0.5 flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400">
                    <MapPin class="h-3 w-3 shrink-0" />
                    <span>{{ clinic.address }}</span>
                  </div>
                </td>
                <td class="space-y-0.5 px-2 py-3.5">
                  <div class="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                    <Phone class="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{{ clinic.phone || clinic.contactInfo || clinic.contact || '-' }}</span>
                  </div>
                  <div class="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                    <Mail class="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{{ clinic.email }}</span>
                  </div>
                </td>
                <td class="px-2 py-3.5 text-center">
                  <button
                    type="button"
                    class="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    :class="
                      clinic.status === 'ACTIVE'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    "
                    @click="toggleStatus(clinic)"
                  >
                    {{ clinic.status || 'INACTIVE' }}
                  </button>
                </td>
                <td class="px-2 py-3.5">
                  <div v-if="clinic.secretKey" class="flex items-center space-x-1.5">
                    <code class="select-all rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-brand-primary dark:border-slate-700 dark:bg-slate-800">
                      {{ clinic.secretKey }}
                    </code>
                    <button
                      type="button"
                      class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-850 dark:hover:text-slate-200"
                      :title="t('clinics.copyKey')"
                      @click="copyKeyToClipboard(clinic.secretKey, clinic.id.toString())"
                    >
                      <Check v-if="copiedKey === clinic.id.toString()" class="h-3.5 w-3.5 text-emerald-500" />
                      <Copy v-else class="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div v-else class="text-[10px] italic text-slate-400">{{ t('clinics.keyCreatedOnActivate') }}</div>
                </td>
                <td class="px-2 py-3.5 text-right">
                  <div class="flex items-center justify-end space-x-1.5">
                    <button
                      type="button"
                      class="rounded bg-slate-100 p-1.5 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      :title="t('common.edit')"
                      @click="startEdit(clinic)"
                    >
                      <Edit2 class="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      class="rounded bg-red-500/10 p-1.5 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
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
      </div>
    </div>
  </div>
</template>
