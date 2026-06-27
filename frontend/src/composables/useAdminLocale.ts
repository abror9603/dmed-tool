/**
 * Forces Uzbek locale inside the admin shell regardless of the public-site language.
 * Product requirement: admin operators always see Uzbek labels.
 */
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setDocumentLanguage, type AppLocale } from '../i18n'
import { STORAGE_KEYS } from '../config/app'

const ADMIN_LOCALE: AppLocale = 'uz'

export function useAdminLocale(): void {
  const route = useRoute()
  const { locale } = useI18n()

  function applyUzbekLocale(): void {
    locale.value = ADMIN_LOCALE
    setDocumentLanguage(ADMIN_LOCALE)
    localStorage.setItem(STORAGE_KEYS.LOCALE, ADMIN_LOCALE)
  }

  onMounted(applyUzbekLocale)

  watch(
    () => route.path,
    (path) => {
      if (path.startsWith('/admin')) {
        applyUzbekLocale()
      }
    },
  )
}
