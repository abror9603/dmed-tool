<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ChevronDown, ChevronRight, Folder } from 'lucide-vue-next'
import { useDocsContent } from '../../composables/useDocsContent'
import { docsSectionIds, type DocsSectionId } from '../../data/docs.sections'

const props = defineProps<{
  baseUrl: string
}>()

const { t } = useI18n()
const route = useRoute()
const { sections } = useDocsContent(props.baseUrl)

const currentSection = computed(() => {
  const section = route.params.section as string
  return docsSectionIds.includes(section as DocsSectionId) ? section : 'intro'
})

function isSectionActive(sectionId: string): boolean {
  return currentSection.value === sectionId
}

function isEndpointActive(endpointId: string): boolean {
  return route.hash === `#${endpointId}`
}
</script>

<template>
  <aside class="flex h-full w-full flex-col border-r border-slate-200 bg-[#f7f7f7]">
    <div class="border-b border-slate-200 px-5 py-5">
      <RouterLink to="/" class="text-lg font-bold uppercase tracking-wide text-slate-800 hover:text-brand-primary">
        {{ t('docsPage.apiTitle') }}
      </RouterLink>
      <p class="mt-1 text-xs text-slate-500">{{ t('docsPage.apiSubtitle') }}</p>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <RouterLink
        to="/docs/intro"
        class="mb-1 flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="isSectionActive('intro') ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'"
      >
        {{ t('docsPage.intro') }}
      </RouterLink>

      <div v-for="section in sections" :key="section.id" class="mt-1">
        <RouterLink
          :to="`/docs/${section.id}`"
          class="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold transition-colors"
          :class="isSectionActive(section.id) ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-700 hover:bg-white/70'"
        >
          <ChevronDown v-if="isSectionActive(section.id)" class="h-4 w-4 shrink-0 text-slate-400" />
          <ChevronRight v-else class="h-4 w-4 shrink-0 text-slate-400" />
          <Folder class="h-4 w-4 shrink-0 text-orange-500" :stroke-width="1.75" />
          <span class="truncate">{{ section.title }}</span>
        </RouterLink>

        <div v-if="isSectionActive(section.id)" class="ml-7 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
          <RouterLink
            v-for="endpoint in section.endpoints"
            :key="endpoint.id"
            :to="{ path: `/docs/${section.id}`, hash: `#${endpoint.id}` }"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors"
            :class="isEndpointActive(endpoint.id) ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-white hover:text-slate-900'"
          >
            <span
              class="inline-flex min-w-[44px] items-center justify-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
              :class="{
                'bg-emerald-500 text-white': endpoint.method === 'GET',
                'bg-orange-500 text-white': endpoint.method === 'POST',
                'bg-blue-500 text-white': endpoint.method === 'PUT',
                'bg-violet-500 text-white': endpoint.method === 'PATCH',
                'bg-red-500 text-white': endpoint.method === 'DELETE',
              }"
            >
              {{ endpoint.method }}
            </span>
            <span class="truncate">{{ endpoint.title }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </aside>
</template>
