[Use BaseButton.vue code from above]
<!-- src/components/common/BaseButton.vue -->
<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, outline
  },
  size: {
    type: String,
    default: 'medium' // small, medium, large
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button 
    class="base-button"
    :class="[`btn-${variant}`, `btn-${size}`, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="loader"></span>
    <slot v-else />
  </button>
</template>

<style scoped>
.base-button {
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-outline {
  background: transparent;
  border: 2px solid #10b981;
  color: #10b981;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-large {
  padding: 18px 36px;
  font-size: 18px;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
