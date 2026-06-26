<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Settings } from 'lucide-vue-next'
import DocsContent from '../components/docs/DocsContent.vue'
import DocsSidebar from '../components/docs/DocsSidebar.vue'
import LanguageSwitcher from '../components/layout/LanguageSwitcher.vue'
import { useDocsContent } from '../composables/useDocsContent'
import { docsSectionIds, type DocsSectionId } from '../data/docs.sections'
import { DEFAULT_API_URL, STORAGE_KEYS } from '../config/app'
import { getApiUrl } from '../services/http'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const apiUrl = ref(getApiUrl())
const showSettings = ref(false)
const draftApiUrl = ref(apiUrl.value)

const displayApiUrl = computed(() => apiUrl.value)
const { sections, intro } = useDocsContent(displayApiUrl.value)

const mobileSection = computed({
  get: () => {
    const section = route.params.section as string
    return docsSectionIds.includes(section as DocsSectionId) ? section : 'intro'
  },
  set: (value: string) => {
    router.push(`/docs/${value}`)
  },
})

const mobileSections = computed(() => [
  { id: 'intro', title: intro.value.title },
  ...sections.value.map((section) => ({
    id: section.id,
    title: section.title,
  })),
])

function saveApiUrl(): void {
  localStorage.setItem(STORAGE_KEYS.API_URL, draftApiUrl.value.trim())
  apiUrl.value = draftApiUrl.value.trim()
  showSettings.value = false
}

function resetApiUrl(): void {
  draftApiUrl.value = DEFAULT_API_URL
  saveApiUrl()
}
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900">
    <header class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-primary"
      >
        <ArrowLeft class="h-4 w-4" />
        <span>{{ t('common.backHome') }}</span>
      </RouterLink>

      <div class="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          @click="showSettings = !showSettings"
        >
          <Settings class="h-3.5 w-3.5" />
          {{ t('common.apiUrl') }}
        </button>
      </div>
    </header>

    <div v-if="showSettings" class="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
      <div class="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row">
        <input
          v-model="draftApiUrl"
          type="text"
          class="flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-brand-primary"
          :placeholder="t('docsPage.apiUrlPlaceholder')"
        />
        <button type="button" class="rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white" @click="saveApiUrl">
          {{ t('common.save') }}
        </button>
        <button type="button" class="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600" @click="resetApiUrl">
          {{ t('common.reset') }}
        </button>
      </div>
      <p class="mx-auto mt-2 max-w-3xl text-[10px] text-slate-500">{{ t('docsPage.ngrokHint') }}</p>
    </div>

    <div class="border-b border-slate-200 bg-[#f7f7f7] px-4 py-3 lg:hidden">
      <label class="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{{ t('common.section') }}</label>
      <select
        v-model="mobileSection"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary"
      >
        <option v-for="section in mobileSections" :key="section.id" :value="section.id">
          {{ section.title }}
        </option>
      </select>
    </div>

    <div class="mx-auto flex min-h-[calc(100vh-57px)] max-w-[1600px]">
      <div class="hidden w-[280px] shrink-0 lg:block">
        <div class="sticky top-[57px] h-[calc(100vh-57px)] overflow-hidden">
          <DocsSidebar :base-url="displayApiUrl" />
        </div>
      </div>

      <main class="min-w-0 flex-1 overflow-x-hidden">
        <DocsContent :base-url="displayApiUrl" />
      </main>
    </div>
  </div>
</template>
