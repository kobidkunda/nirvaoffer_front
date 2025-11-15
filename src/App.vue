<!-- src/App.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { RouterView } from 'vue-router'
import LanguageModal from '@/components/common/LanguageModal.vue'

const { changeLanguage } = useLanguage()
const showLanguageModal = ref(false)

onMounted(() => {
  // Check if user has selected language before
  const hasSelectedLanguage = localStorage.getItem('language_selected')

  if (!hasSelectedLanguage) {
    // First visit - show language selection modal
    showLanguageModal.value = true
  }
  // Note: i18n is already initialized with saved language in main.js
  // No need to call changeLanguage here to avoid conflicts
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
