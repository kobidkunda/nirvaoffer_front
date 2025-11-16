// src/composables/useAuth.js
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const login = async (phoneNumber, otpCode) => {
    const result = await authStore.loginWithOTP(phoneNumber, otpCode)
    
    if (result.success) {
      const returnUrl = authStore.returnUrl || '/dashboard'
      authStore.returnUrl = null
      router.push(returnUrl)
    }
    
    return result
  }

  const logout = () => {
    authStore.logout()
    router.push('/')
  }

  return {
    isLoggedIn: computed(() => authStore.isLoggedIn),
    user: computed(() => authStore.user),
    login,
    logout,
    requestOTP: authStore.requestOTP,
    updateUser: authStore.updateUser
  }
}
