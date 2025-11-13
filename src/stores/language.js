// src/stores/language.js
import { defineStore } from 'pinia'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: 'en',
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
    ]
  }),

  getters: {
    currentLanguageName: (state) => {
      const lang = state.availableLanguages.find(l => l.code === state.currentLanguage)
      return lang?.nativeName || 'English'
    }
  },

  actions: {
    setLanguage(langCode) {
      this.currentLanguage = langCode
      localStorage.setItem('user_language', langCode)
      document.documentElement.lang = langCode
    },

    detectBrowserLanguage() {
      const browserLang = navigator.language.split('-')[0]
      const supported = this.availableLanguages.find(l => l.code === browserLang)
      
      if (supported) {
        this.setLanguage(browserLang)
      }
    }
  },

  persist: {
    key: 'nirva_language',
    paths: ['currentLanguage']
  }
})
