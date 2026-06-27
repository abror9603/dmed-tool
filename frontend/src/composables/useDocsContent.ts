/**
 * Docs page content — builds API reference sections from i18n keys and the configured base URL.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { createDocsSections, docsIntroKeys } from '../data/docs.sections'
import type { DocIntro } from '../types/docs.types'

export function useDocsContent(baseUrl: string) {
  const { t } = useI18n()

  const sections = computed(() => createDocsSections(baseUrl, t))

  const intro = computed<DocIntro>(() => ({
    title: t(docsIntroKeys.title),
    paragraphs: docsIntroKeys.paragraphs.map((key) => t(key)),
  }))

  const sectionTitle = (sectionId: string): string => {
    const key = `docsPage.sections.${sectionId}` as const
    return t(key)
  }

  return {
    sections,
    intro,
    sectionTitle,
  }
}
