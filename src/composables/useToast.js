// src/composables/useToast.js
let toastContainer = null

export function setToastContainer(container) {
  toastContainer = container
}

export function useToast() {
  const showToast = (message, type = 'success', duration = 3000) => {
    if (toastContainer && toastContainer.showToast) {
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