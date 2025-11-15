<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success' // success, error, info
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'info':
      return 'ℹ'
    default:
      return '✓'
  }
})

const toastClass = computed(() => {
  return `toast toast-${props.type}`
})

// Auto close after duration
if (props.duration > 0) {
  setTimeout(() => {
    emit('close')
  }, props.duration)
}
</script>

<template>
  <div :class="toastClass">
    <span class="toast-icon">{{ icon }}</span>
    <span class="toast-message">{{ message }}</span>
    <button class="toast-close" @click="$emit('close')">
      ×
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  font-weight: 500;
  font-size: 14px;
  min-width: 300px;
  max-width: 500px;
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.toast-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.toast-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.toast-icon {
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>