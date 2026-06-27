<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { DocEndpoint } from '../../types/docs.types'
import DocsCodeBlock from './DocsCodeBlock.vue'
import DocsMethodBadge from './DocsMethodBadge.vue'

const props = defineProps<{
  endpoint: DocEndpoint
  baseUrl: string
}>()

const { t } = useI18n()
const requestCode = props.endpoint.requestExample(props.baseUrl)
</script>

<template>
  <article :id="endpoint.id" class="scroll-mt-20 border-b border-slate-200">
    <div class="grid grid-cols-1 xl:grid-cols-2">
      <div class="space-y-5 bg-white p-6 sm:p-8">
        <div class="flex items-start gap-3">
          <DocsMethodBadge :method="endpoint.method" />
          <h2 class="text-xl font-bold text-slate-900">{{ endpoint.title }}</h2>
        </div>

        <div class="rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
          {{ baseUrl }}{{ endpoint.path }}
        </div>

        <p class="text-sm leading-relaxed text-slate-600">{{ endpoint.description }}</p>

        <div v-if="endpoint.authorization" class="space-y-1">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">{{ t('docsPage.authorization') }}</p>
          <p class="text-sm font-medium text-slate-700">{{ endpoint.authorization }}</p>
        </div>

        <div v-if="endpoint.bodyType && endpoint.bodyType !== 'none'" class="space-y-3">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {{ endpoint.bodyType === 'query' ? t('docsPage.parameters') : `Body: ${endpoint.bodyType}` }}
          </p>
          <div v-if="endpoint.fields?.length" class="overflow-x-auto rounded border border-slate-200">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-3 py-2 font-semibold">{{ t('docsPage.field') }}</th>
                  <th class="px-3 py-2 font-semibold">{{ t('docsPage.type') }}</th>
                  <th class="px-3 py-2 font-semibold">{{ t('docsPage.required') }}</th>
                  <th class="px-3 py-2 font-semibold">{{ t('docsPage.description') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr v-for="field in endpoint.fields" :key="field.name">
                  <td class="px-3 py-2 font-mono text-brand-primary">{{ field.name }}</td>
                  <td class="px-3 py-2">{{ field.type }}</td>
                  <td class="px-3 py-2">
                    <span :class="field.required ? 'text-red-500' : 'text-slate-400'">
                      {{ field.required ? t('common.yes') : t('common.no') }}
                    </span>
                  </td>
                  <td class="px-3 py-2">
                    {{ field.description }}
                    <span v-if="field.example" class="mt-0.5 block font-mono text-xs text-slate-400">{{ field.example }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-800 bg-[#2b2b2b] xl:border-l xl:border-t-0">
        <div class="border-b border-slate-700 px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">{{ t('docsPage.exampleRequest') }}</p>
        </div>
        <DocsCodeBlock :code="requestCode" :copy-id="`${endpoint.id}-request`" />

        <div class="border-t border-slate-700 px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">{{ t('docsPage.exampleResponse') }}</p>
        </div>
        <DocsCodeBlock :code="endpoint.responseExample" :copy-id="`${endpoint.id}-response`" />
      </div>
    </div>
  </article>
</template>
