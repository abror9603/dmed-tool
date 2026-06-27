<script setup lang="ts">
import { computed, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { Check, ChevronDown, Languages } from 'lucide-vue-next'
import { STORAGE_KEYS } from '../../config/app'
import { setDocumentLanguage, SUPPORTED_LOCALES, type AppLocale } from '../../i18n'

const { locale, t } = useI18n()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const currentLocale = computed(() => {
  return SUPPORTED_LOCALES.find((item) => item.code === locale.value) ?? SUPPORTED_LOCALES[0]!
})

function setLocale(code: AppLocale): void {
  locale.value = code
  localStorage.setItem(STORAGE_KEYS.LOCALE, code)
  setDocumentLanguage(code)
  isOpen.value = false
}

function toggleDropdown(): void {
  isOpen.value = !isOpen.value
}

onClickOutside(rootRef, () => {
  isOpen.value = false
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      :aria-label="t('common.language')"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggleDropdown"
    >
      <Languages class="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
      <span>{{ currentLocale.label }}</span>
      <ChevronDown
        class="h-3.5 w-3.5 text-slate-400 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <ul
        v-if="isOpen"
        role="listbox"
        :aria-label="t('common.language')"
        class="absolute right-0 z-50 mt-1.5 min-w-[10.5rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
      >
        <li
          v-for="item in SUPPORTED_LOCALES"
          :key="item.code"
          role="option"
          :aria-selected="locale === item.code"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors"
            :class="locale === item.code
              ? 'bg-brand-primary/10 text-brand-primary font-semibold'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'"
            @click="setLocale(item.code)"
          >
            <span class="flex items-center gap-2">
              <span class="w-7 text-xs font-bold uppercase text-slate-400">{{ item.label }}</span>
              <span>{{ item.name }}</span>
            </span>
            <Check v-if="locale === item.code" class="h-4 w-4 shrink-0" />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
