import { createI18n } from 'vue-i18n'
import uz from './locales/uz'
import ru from './locales/ru'
import en from './locales/en'
import { STORAGE_KEYS } from '../config/app'

export type AppLocale = 'uz' | 'ru' | 'en'

export const SUPPORTED_LOCALES: { code: AppLocale; label: string; name: string }[] = [
  { code: 'uz', label: 'UZ', name: "O'zbekcha" },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'en', label: 'EN', name: 'English' },
]

function getInitialLocale(): AppLocale {
  const saved = localStorage.getItem(STORAGE_KEYS.LOCALE)
  if (saved === 'uz' || saved === 'ru' || saved === 'en') {
    return saved
  }
  return 'uz'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'uz',
  messages: { uz, ru, en },
})

export function setDocumentLanguage(locale: AppLocale): void {
  document.documentElement.lang = locale
}

setDocumentLanguage(getInitialLocale())

export default i18n
