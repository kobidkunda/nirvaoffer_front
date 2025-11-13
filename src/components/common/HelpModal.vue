<!-- src/components/common/HelpModal.vue -->
<script setup>
import { motion, AnimatePresence } from 'motion-v'
import { useLanguage } from '@/composables/useLanguage'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close'])

const { t } = useLanguage()
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="show"
      class="modal-overlay"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      @click.self="emit('close')"
    >
      <motion.div
        class="modal-content"
        :initial="{ scale: 0.9, y: 20 }"
        :animate="{ scale: 1, y: 0 }"
        :exit="{ scale: 0.9, y: 20 }"
        :transition="{ type: 'spring', damping: 20 }"
      >
        <button class="close-btn" @click="emit('close')">✕</button>
        
        <div class="help-header">
          <h2>{{ t('help.title') }}</h2>
        </div>

        <div class="help-steps">
          <!-- Step 1 -->
          <motion.div
            class="step"
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.1 }"
          >
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>{{ t('help.step1Title') }}</h3>
              <p>{{ t('help.step1Description') }}</p>
            </div>
          </motion.div>

          <!-- Step 2 -->
          <motion.div
            class="step"
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.2 }"
          >
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>{{ t('help.step2Title') }}</h3>
              <p>{{ t('help.step2Description') }}</p>
            </div>
          </motion.div>

          <!-- Step 3 -->
          <motion.div
            class="step"
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.3 }"
          >
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>{{ t('help.step3Title') }}</h3>
              <p>{{ t('help.step3Description') }}</p>
            </div>
          </motion.div>
        </div>

        <BaseButton @click="emit('close')" variant="primary">
          {{ t('help.gotIt') }}
        </BaseButton>
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
  padding: 32px;
  width: 100%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
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

.help-header {
  text-align: center;
  margin-bottom: 32px;
}

.help-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.help-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.step-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.step-content p {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}
</style>
