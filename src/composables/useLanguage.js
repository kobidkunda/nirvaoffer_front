// src/composables/useLanguage.js
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'

export function useLanguage() {
  const { locale, t } = useI18n()
  const languageStore = useLanguageStore()

  const changeLanguage = (langCode) => {
    locale.value = langCode
    languageStore.setLanguage(langCode)
  }

  return {
    t,
    locale,
    changeLanguage,
    currentLanguage: languageStore.currentLanguage,
    availableLanguages: languageStore.availableLanguages
  }
}
