<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDocsContent } from '../../composables/useDocsContent'
import { docsSectionIds, type DocsSectionId } from '../../data/docs.sections'
import DocsEndpointBlock from './DocsEndpointBlock.vue'

const props = defineProps<{
  baseUrl: string
}>()

const { locale } = useI18n()
const route = useRoute()
const { sections, intro } = useDocsContent(props.baseUrl)

const currentSection = computed(() => {
  const section = route.params.section as string
  return docsSectionIds.includes(section as DocsSectionId) ? section : 'intro'
})

const activeSection = computed(() => sections.value.find((section) => section.id === currentSection.value))

onMounted(() => scrollToHash(route.hash))

watch(() => route.hash, scrollToHash)
watch(locale, () => {
  // re-render on locale change via computed sections
})

function scrollToHash(hash: string): void {
  if (!hash) return
  requestAnimationFrame(() => {
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <div v-if="currentSection === 'intro'" class="bg-white p-6 sm:p-10">
    <h1 class="text-3xl font-bold text-slate-900">{{ intro.title }}</h1>
    <div class="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-slate-600">
      <p v-for="(paragraph, index) in intro.paragraphs" :key="index">{{ paragraph }}</p>
    </div>
    <div class="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p class="text-xs font-bold uppercase tracking-wider text-slate-400">{{ $t('docsPage.baseUrl') }}</p>
      <p class="mt-1 font-mono text-sm text-slate-800">{{ baseUrl }}</p>
    </div>
  </div>

  <div v-else-if="activeSection">
    <DocsEndpointBlock
      v-for="endpoint in activeSection.endpoints"
      :key="endpoint.id"
      :endpoint="endpoint"
      :base-url="baseUrl"
    />
  </div>
</template>
