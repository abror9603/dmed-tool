<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClipboardList, Check, X, Phone, User, Calendar, Key } from 'lucide-vue-next'
import AdminAlerts from '../../components/admin/AdminAlerts.vue'
import AdminRefreshButton from '../../components/admin/AdminRefreshButton.vue'
import AdminPagination from '../../components/admin/AdminPagination.vue'
import { useAdminLabels } from '../../composables/useAdminLabels'
import { useConfirmDialog } from '../../composables/useConfirmDialog'
import { useClinicApplicationsStore } from '../../stores/clinic-applications'
import {
  formatApplicationDate,
  getApplicationClinicName,
  getApplicationContactName,
  isLabApplication,
  type ApplicationStatus,
} from '../../services/clinic-applications'
import { DEFAULT_PAGE_SIZE, rowNumber } from '../../utils/pagination'

const { t } = useI18n()
const { statusLabel, applicationTypeLabel } = useAdminLabels()
const { confirm } = useConfirmDialog()
const store = useClinicApplicationsStore()

const applications = computed(() => store.applications)
const total = computed(() => store.total)
const currentPage = computed(() => store.query.page ?? 0)
const pageSize = computed(() => store.query.size ?? DEFAULT_PAGE_SIZE)
const loading = computed(() => store.loading)

const statusTabs = computed(() => [
  { value: 'ALL' as const, label: t('applications.filterAll') },
  { value: 'PENDING' as const, label: t('applications.filterPending') },
  { value: 'APPROVED' as const, label: t('applications.filterApproved') },
  { value: 'REJECTED' as const, label: t('applications.filterRejected') },
])

async function refresh(): Promise<void> {
  store.clearMessages()
  await store.fetchApplications()
}

async function setFilter(status: ApplicationStatus | 'ALL'): Promise<void> {
  store.clearMessages()
  await store.fetchApplications(status, 0)
}

async function goToPage(page: number): Promise<void> {
  store.clearMessages()
  await store.fetchApplications(undefined, page)
}

async function approve(id: string | number): Promise<void> {
  const application = applications.value.find((app) => String(app.id) === String(id))
  const isLab = application ? isLabApplication(application) : false
  const ok = await confirm({
    title: t('applications.approve'),
    message: isLab ? t('applications.confirmApproveLab') : t('applications.confirmApprove'),
    confirmLabel: t('applications.approve'),
    variant: 'success',
  })
  if (!ok) return
  await store.approveApplication(id)
}

async function reject(id: string | number): Promise<void> {
  const ok = await confirm({
    title: t('applications.reject'),
    message: t('applications.confirmReject'),
    confirmLabel: t('applications.reject'),
    variant: 'danger',
  })
  if (!ok) return
  await store.rejectApplication(id)
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
  <div class="w-full space-y-4">
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
            ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
            : 'border-slate-700 text-slate-400 hover:bg-slate-800/60'
        "
        @click="setFilter(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-700/70 bg-[#111b2e]">
      <div class="flex items-center gap-2 border-b border-slate-700/80 px-4 py-3">
        <ClipboardList class="h-4 w-4 text-cyan-400" />
        <h2 class="text-sm font-bold text-white">{{ t('applications.listTitle') }}</h2>
        <span class="ml-auto rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-400">
          {{ total }}
        </span>
      </div>

      <div v-if="loading && applications.length === 0" class="py-10 text-center text-xs text-slate-500">
        {{ t('common.loading') }}
      </div>
      <div v-else-if="applications.length === 0" class="py-10 text-center text-xs text-slate-500">
        {{ t('applications.empty') }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col class="w-16" />
            <col class="w-[18%]" />
            <col class="w-28" />
            <col class="w-[14%]" />
            <col class="w-[12%]" />
            <col class="w-[12%]" />
            <col class="w-28" />
            <col class="w-32" />
            <col class="w-28" />
          </colgroup>
          <thead>
            <tr class="border-b border-slate-700/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th class="px-3 py-2 text-left">{{ t('applications.table.id') }}</th>
              <th class="px-3 py-2 text-left">{{ t('applications.table.clinic') }}</th>
              <th class="px-3 py-2 text-left">{{ t('applications.table.type') }}</th>
              <th class="px-3 py-2 text-left">{{ t('applications.table.contact') }}</th>
              <th class="px-3 py-2 text-left">{{ t('applications.table.login') }}</th>
              <th class="px-3 py-2 text-left">{{ t('applications.table.phones') }}</th>
              <th class="px-3 py-2 text-left">{{ t('applications.table.status') }}</th>
              <th class="px-3 py-2 text-left">{{ t('applications.table.createdAt') }}</th>
              <th class="px-3 py-2 text-right">{{ t('clinics.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80 text-slate-300">
            <tr
              v-for="(app, index) in applications"
              :key="String(app.id)"
              class="hover:bg-slate-800/40"
            >
              <td class="px-3 py-2 text-[11px] font-semibold tabular-nums text-slate-400">
                {{ rowNumber(currentPage, pageSize, index) }}
              </td>
              <td class="px-3 py-2">
                <span class="line-clamp-2 font-semibold text-white" :title="getApplicationClinicName(app)">
                  {{ getApplicationClinicName(app) }}
                </span>
              </td>
              <td class="px-3 py-2">
                <span class="inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                  {{ applicationTypeLabel(app.applicationType) }}
                </span>
                <div
                  v-if="app.clinicType && !isLabApplication(app)"
                  class="mt-1 truncate text-[10px] text-slate-500"
                >
                  {{ t(`registration.clinicTypes.${app.clinicType}`) }}
                </div>
              </td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-1 truncate">
                  <User class="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span class="truncate" :title="getApplicationContactName(app)">{{ getApplicationContactName(app) }}</span>
                </div>
              </td>
              <td class="px-3 py-2 truncate font-mono text-[12px]" :title="app.login || ''">{{ app.login || '—' }}</td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-1 truncate">
                  <Phone class="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span class="truncate">{{ app.phoneNumber1 || '—' }}</span>
                </div>
                <div v-if="app.phoneNumber2" class="mt-0.5 truncate text-[11px] text-slate-500">{{ app.phoneNumber2 }}</div>
              </td>
              <td class="px-3 py-2">
                <span
                  class="inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold"
                  :class="statusClass(app.status)"
                >
                  {{ statusLabel(app.status) }}
                </span>
              </td>
              <td class="px-3 py-2">
                <div class="flex items-center gap-1 text-[11px] text-slate-500">
                  <Calendar class="h-3.5 w-3.5 shrink-0" />
                  <span class="whitespace-nowrap">{{ formatApplicationDate(app.createdAt) }}</span>
                </div>
              </td>
              <td class="px-3 py-2 text-right">
                <div v-if="app.status === 'PENDING'" class="flex justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                    :disabled="loading"
                    :title="t('applications.approve')"
                    @click="approve(app.id)"
                  >
                    <Check class="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                    :disabled="loading"
                    :title="t('applications.reject')"
                    @click="reject(app.id)"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
                <div v-else-if="app.secretKey" class="flex items-center justify-end gap-1 text-[11px] text-slate-500">
                  <Key class="h-3.5 w-3.5 shrink-0" />
                  <code class="max-w-full truncate">{{ app.secretKey }}</code>
                </div>
                <span v-else class="text-slate-600">—</span>
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
