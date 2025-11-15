// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'

// Import locale messages
import en from './locales/en.json'
import hi from './locales/hi.json'
import bn from './locales/bn.json'

console.log('Starting app initialization...')

// Create i18n instance
const savedLanguage = localStorage.getItem('user_language')
const i18n = createI18n({
  legacy: false,
  locale: savedLanguage || 'en', // Initialize with saved language
  fallbackLocale: 'en',
  messages: { en, hi, bn },
  globalInjection: true
})

console.log('i18n initialized')

// Create Pinia instance with persistence
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

console.log('Pinia initialized')

// Create app
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

// Add global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
  console.error('Component:', instance)
}

// Mount app
app.mount('#app')

console.log('Vue app mounted successfully!')
