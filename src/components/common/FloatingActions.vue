<!-- src/components/common/FloatingActions.vue -->
<template>
  <div class="floating-actions">
    <!-- Language Button -->
    <motion.button
      @click="$emit('openLanguage')"
      class="fab language-fab"
      :whileHover="{ scale: 1.1, rotate: 5 }"
      :whileTap="{ scale: 0.95 }"
      aria-label="Change Language"
    >
      <span class="icon">🌐</span>
    </motion.button>

    <!-- Help Button -->
    <motion.button
      @click="$emit('openHelp')"
      class="fab help-fab"
      :animate="{
        scale: [1, 1.1, 1],
        rotate: [0, -10, 10, 0]
      }"
      :transition="{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3
      }"
      :whileHover="{ scale: 1.15 }"
      :whileTap="{ scale: 0.95 }"
      aria-label="Help"
    >
      <span class="icon">❓</span>
      <span class="ping"></span>
    </motion.button>
  </div>
</template>

<script setup>
import { motion } from 'motion-v'

defineEmits(['openHelp', 'openLanguage'])
</script>

<style scoped>
.floating-actions {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2500;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  position: relative;
}

.language-fab {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.help-fab {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.icon {
  font-size: 20px;
}

.ping {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  animation: ping 2s infinite;
}

@keyframes ping {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .floating-actions {
    bottom: 16px;
    right: 16px;
  }

  .fab {
    width: 48px;
    height: 48px;
  }

  .icon {
    font-size: 18px;
  }
}
</style>