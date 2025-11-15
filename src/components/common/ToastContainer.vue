<script setup>
import { ref } from 'vue'
import Toast from './Toast.vue'

const toasts = ref([])

const showToast = (message, type = 'success', duration = 3000) => {
  const id = Date.now()
  toasts.value.push({
    id,
    message,
    type,
    duration
  })

  // Auto remove after duration + animation time
  setTimeout(() => {
    removeToast(id)
  }, duration + 300)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose showToast function for global use
defineExpose({
  showToast
})
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list" tag="div">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast-container > div {
  pointer-events: auto;
}

/* Toast list animations */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-move {
  transition: transform 0.3s ease;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style>