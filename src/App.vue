<!-- src/App.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { RouterView } from 'vue-router'
import LanguageModal from '@/components/common/LanguageModal.vue'

const languageStore = useLanguageStore()
const showLanguageModal = ref(false)

onMounted(() => {
  // Check if user has selected language before
  const hasSelectedLanguage = localStorage.getItem('language_selected')
  
  if (!hasSelectedLanguage) {
    // First visit - show language selection modal
    showLanguageModal.value = true
  } else {
    // Returning user - load saved language
    const savedLanguage = localStorage.getItem('user_language')
    if (savedLanguage) {
      languageStore.setLanguage(savedLanguage)
    } else {
      // Fallback to browser language detection
      languageStore.detectBrowserLanguage()
    }
  }
})

const handleLanguageSelect = () => {
  showLanguageModal.value = false
}
</script>

<template>
  <div id="app">
    <!-- First Visit Language Selection -->
    <LanguageModal 
      :show="showLanguageModal"
      :is-first-visit="true"
      @select="handleLanguageSelect"
      @close="handleLanguageSelect"
    />

    <!-- Main App Content -->
    <RouterView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
