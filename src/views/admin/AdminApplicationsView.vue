<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ClipboardList,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Hospital,
} from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import AdminRefreshButton from '../../components/admin/AdminRefreshButton.vue'
import { useClinicApplicationsStore } from '../../stores/clinic-applications'
import type { ApplicationStatus } from '../../services/clinic-applications'

const { t } = useI18n()
const store = useClinicApplicationsStore()

const applications = computed(() => store.applications)
const loading = computed(() => store.loading)

const statusTabs = computed(() => [
  { value: 'ALL' as const, label: t('applications.filterAll') },
  { value: 'PENDING' as const, label: t('applications.filterPending') },
  { value: 'APPROVED' as const, label: t('applications.filterApproved') },
  { value: 'REJECTED' as const, label: t('applications.filterRejected') },
])

const formName = ref('')
const formAddress = ref('')
const formPhone = ref('')
const formEmail = ref('')
const formContact = ref('')

async function refresh(): Promise<void> {
  store.clearMessages()
  await store.fetchApplications()
}

async function setFilter(status: ApplicationStatus | 'ALL'): Promise<void> {
  store.clearMessages()
  await store.fetchApplications(status)
}

async function approve(id: number): Promise<void> {
  if (!confirm(t('applications.confirmApprove'))) return
  await store.approveApplication(id)
}

async function reject(id: number): Promise<void> {
  if (!confirm(t('applications.confirmReject'))) return
  await store.rejectApplication(id)
}

async function submitApplication(): Promise<void> {
  if (!formName.value || !formAddress.value || !formPhone.value || !formEmail.value) {
    alert(t('clinics.fillAllFields'))
    return
  }

  await store.submitApplication({
    name: formName.value,
    address: formAddress.value,
    phone: formPhone.value,
    email: formEmail.value,
    contactPerson: formContact.value || undefined,
  })

  formName.value = ''
  formAddress.value = ''
  formPhone.value = ''
  formEmail.value = ''
  formContact.value = ''
}

function statusClass(status: ApplicationStatus): string {
  if (status === 'PENDING') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
  }
  if (status === 'APPROVED') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  }
  return 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <AdminRefreshButton :loading="loading" @refresh="refresh" />
    <AdminAlerts :error="store.error" :success="store.successMessage" />

    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        class="rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
        :class="
          store.statusFilter === tab.value
            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
            : 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
        "
        @click="setFilter(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <div class="lg:col-span-4">
        <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card">
          <h2 class="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-bold dark:border-slate-800">
            <Hospital class="h-4 w-4 text-brand-primary" />
            <span>{{ t('applications.submitTitle') }}</span>
          </h2>
          <p class="text-[11px] text-slate-500">{{ t('applications.submitHint') }}</p>

          <form class="space-y-3" @submit.prevent="submitApplication">
            <input
              v-model="formName"
              type="text"
              required
              :placeholder="t('clinics.namePlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <input
              v-model="formAddress"
              type="text"
              required
              :placeholder="t('clinics.addressPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <input
              v-model="formPhone"
              type="text"
              required
              :placeholder="t('clinics.phonePlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <input
              v-model="formEmail"
              type="email"
              required
              :placeholder="t('clinics.emailPlaceholder')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <input
              v-model="formContact"
              type="text"
              :placeholder="t('applications.contactPerson')"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60"
            />
            <button
              type="submit"
              class="w-full rounded-lg bg-brand-primary py-2 text-xs font-bold text-white hover:bg-brand-primary/95"
              :disabled="loading"
            >
              {{ t('applications.submit') }}
            </button>
          </form>
        </div>
      </div>

      <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-brand-dark-card sm:p-6 lg:col-span-8">
        <h2 class="flex items-center gap-2 border-b border-slate-200 pb-3 text-sm font-bold dark:border-slate-800">
          <ClipboardList class="h-4.5 w-4.5 text-brand-primary" />
          <span>{{ t('applications.listTitle') }}</span>
          <span class="ml-auto rounded-full bg-slate-100 px-2 py-0.5 font-mono text-xxs text-slate-500 dark:bg-slate-800">
            {{ applications.length }}
          </span>
        </h2>

        <div v-if="loading && applications.length === 0" class="py-12 text-center text-xs text-slate-400">
          {{ t('common.loading') }}
        </div>
        <div v-else-if="applications.length === 0" class="py-12 text-center text-xs text-slate-400">
          {{ t('applications.empty') }}
        </div>

        <div v-else class="space-y-3">
          <article
            v-for="app in applications"
            :key="app.id"
            class="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-800 dark:text-white">{{ app.name }}</span>
                  <span
                    class="rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase"
                    :class="statusClass(app.status)"
                  >
                    {{ app.status }}
                  </span>
                </div>
                <div class="mt-2 space-y-1 text-[11px] text-slate-500">
                  <div class="flex items-center gap-1.5">
                    <MapPin class="h-3.5 w-3.5" />
                    <span>{{ app.address }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Phone class="h-3.5 w-3.5" />
                    <span>{{ app.phone || '—' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Mail class="h-3.5 w-3.5" />
                    <span>{{ app.email }}</span>
                  </div>
                  <div v-if="app.contactPerson || app.contact" class="flex items-center gap-1.5">
                    <User class="h-3.5 w-3.5" />
                    <span>{{ app.contactPerson || app.contact }}</span>
                  </div>
                </div>
              </div>

              <div v-if="app.status === 'PENDING'" class="flex gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                  :disabled="loading"
                  @click="approve(app.id)"
                >
                  <Check class="h-3.5 w-3.5" />
                  {{ t('applications.approve') }}
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/20 dark:text-red-400"
                  :disabled="loading"
                  @click="reject(app.id)"
                >
                  <X class="h-3.5 w-3.5" />
                  {{ t('applications.reject') }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>
