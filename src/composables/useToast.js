// src/composables/useToast.js
import { inject } from 'vue'

const TOAST_KEY = Symbol('toast')

export function useToast() {
  const toastContainer = inject(TOAST_KEY)

  const showToast = (message, type = 'success', duration = 3000) => {
    if (toastContainer) {
      toastContainer.showToast(message, type, duration)
    } else {
      console.warn('Toast container not found. Make sure ToastContainer is properly set up in App.vue')
    }
  }

  const showSuccess = (message, duration = 3000) => {
    showToast(message, 'success', duration)
  }

  const showError = (message, duration = 4000) => {
    showToast(message, 'error', duration)
  }

  const showInfo = (message, duration = 3000) => {
    showToast(message, 'info', duration)
  }

  return {
    showToast,
    showSuccess,
    showError,
    showInfo
  }
}

// Provide function for App.vue
export function provideToast(toastContainerRef) {
  return {
    [TOAST_KEY]: toastContainerRef
  }
}