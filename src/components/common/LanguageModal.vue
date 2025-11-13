<!-- src/components/common/LanguageModal.vue -->
<script setup>
import { motion, AnimatePresence } from 'motion-v'
import { useLanguageStore } from '@/stores/language'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  show: Boolean,
  isFirstVisit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select'])

const { changeLanguage, availableLanguages } = useLanguage()
const { t } = useLanguage()

const selectLanguage = (langCode) => {
  changeLanguage(langCode)
  localStorage.setItem('language_selected', 'true')
  emit('select', langCode)
  emit('close')
}
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="show"
      class="modal-overlay"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      @click.self="!isFirstVisit && emit('close')"
    >
      <motion.div
        class="modal-content"
        :initial="{ scale: 0.8, opacity: 0 }"
        :animate="{ scale: 1, opacity: 1 }"
        :exit="{ scale: 0.8, opacity: 0 }"
        :transition="{ type: 'spring', damping: 20 }"
      >
        <button v-if="!isFirstVisit" class="close-btn" @click="emit('close')">✕</button>
        
        <div class="header">
          <motion.div
            class="icon"
            :animate="{ rotate: [0, -10, 10, -10, 10, 0] }"
            :transition="{ duration: 1, repeat: Infinity, repeatDelay: 2 }"
          >
            🌐
          </motion.div>
          <h2>{{ t('languageSelect.title') }}</h2>
          <p>{{ t('languageSelect.subtitle') }}</p>
        </div>

        <div class="language-grid">
          <motion.button
            v-for="(lang, index) in availableLanguages"
            :key="lang.code"
            @click="selectLanguage(lang.code)"
            class="language-option"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: index * 0.1 }"
            :whileHover="{ scale: 1.05, backgroundColor: '#f0fdf4' }"
            :whileTap="{ scale: 0.95 }"
          >
            <span class="language-name">{{ lang.nativeName }}</span>
            <span class="language-code">{{ lang.name }}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  width: 100%;
  max-width: 450px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: inline-block;
}

.header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.header p {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

.language-grid {
  display: grid;
  gap: 12px;
}

.language-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.language-option:hover {
  border-color: #10b981;
}

.language-name {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.language-code {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}
</style>