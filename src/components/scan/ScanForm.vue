<script setup>
import { ref, computed } from 'vue'
import { motion } from 'motion-v'
import { useLanguage } from '@/composables/useLanguage'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const { t } = useLanguage()

const props = defineProps({
  scannedCode: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  loginButtonText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['scan-qr', 'validate-code', 'login-click', 'update:scannedCode'])

const honeypot = ref('')

const isValidCode = computed(() => props.scannedCode.length === 12)
</script>

<template>
  <motion.div
    class="form-container"
    :initial="{ opacity: 0, scale: 0.95 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="{ duration: 0.6, delay: 0.4 }"
  >
    <div class="form-glow"></div>

    <motion.button
      class="scan-qr-button"
      @click="$emit('scan-qr')"
      :whileHover="{ scale: 1.02, backgroundColor: '#f0fdf4' }"
      :whileTap="{ scale: 0.98 }"
    >
      <span class="scan-icon">📷</span>
      <strong>{{ t('scan.scanButton') }}</strong>
    </motion.button>

    <div class="divider or-divider">
      <span>{{ t('scan.orEnterCode') }}</span>
    </div>

    <input v-model="honeypot" type="text" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off" />

    <div class="input-wrapper">
      <BaseInput
        :model-value="scannedCode"
        @update:model-value="$emit('update:scannedCode', $event)"
        type="text"
        :placeholder="t('scan.placeholder')"
        maxlength="12"
        :error="error"
        style="text-transform: uppercase"
      />
    </div>

    <motion.div
      :whileHover="{ scale: 1.02 }"
      :whileTap="{ scale: 0.98 }"
    >
      <BaseButton
        @click="$emit('validate-code')"
        :loading="loading"
        :disabled="!isValidCode"
        class="check-button"
      >
        <span v-if="!loading" class="button-content">
          <span class="button-icon">🎯</span>
          {{ t('scan.submit') }}
          <span class="button-shine"></span>
        </span>
      </BaseButton>
    </motion.div>

    <div class="divider">
      <span>{{ t('scan.loginPrompt') }}</span>
    </div>

    <motion.button
      class="login-link"
      @click="$emit('login-click')"
      :whileHover="{ scale: 1.02, backgroundColor: '#f0fdf4' }"
      :whileTap="{ scale: 0.98 }"
    >
      <span class="login-icon">👤</span>
      <strong>{{ loginButtonText || t('scan.loginButton') }}</strong>
    </motion.button>
  </motion.div>
</template>

<style scoped>
.form-container {
  position: relative;
  background: rgba(255, 255, 255, 0.98);
  padding: 32px 28px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 40px rgba(255, 215, 0, 0.3);
  border: 3px solid rgba(255, 215, 0, 0.5);
}

.form-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #ffd700);
  background-size: 400% 400%;
  border-radius: 24px;
  z-index: -1;
  opacity: 0.6;
  animation: glow-rotate 4s linear infinite;
  filter: blur(8px);
}

@keyframes glow-rotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.scan-qr-button {
  width: 100%;
  padding: 14px;
  background: white;
  border: 3px solid #10b981;
  border-radius: 12px;
  color: #10b981;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
}

.scan-qr-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.scan-icon {
  font-size: 20px;
}

.divider.or-divider {
  margin: 20px 0;
}

.input-wrapper {
  margin-bottom: 18px;
}

.check-button {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  font-size: 18px;
  font-weight: 800;
  padding: 16px 32px;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.button-icon {
  font-size: 22px;
  animation: bounce-icon 1s infinite;
}

@keyframes bounce-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: button-shine 2s infinite;
}

@keyframes button-shine {
  to { left: 200%; }
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
}

.divider span {
  position: relative;
  background: white;
  padding: 0 14px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.login-link {
  width: 100%;
  padding: 14px;
  background: white;
  border: 3px solid #10b981;
  border-radius: 12px;
  color: #10b981;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.login-icon {
  font-size: 18px;
}

@media (max-width: 640px) {
  .form-container {
    padding: 28px 24px;
  }

  .check-button {
    font-size: 16px;
    padding: 14px 28px;
  }
}
</style>