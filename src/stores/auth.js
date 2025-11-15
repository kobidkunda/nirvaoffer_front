// src/stores/auth.js
import { defineStore } from 'pinia'
import { authAPI, profileAPI } from '@/api/endpoints'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    isAuthenticated: false,
    otpRequestPending: false,
    returnUrl: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    userName: (state) => state.user?.name || '',
    phoneNumber: (state) => state.user?.phone_number || ''
  },

  actions: {
    async requestOTP(phoneNumber) {
      try {
        this.otpRequestPending = true
        const response = await authAPI.requestOTP(phoneNumber)
        return { success: true, message: response.message }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.otpRequestPending = false
      }
    },

    async loginWithOTP(phoneNumber, otpCode) {
      try {
        const response = await authAPI.loginWithOTP(phoneNumber, otpCode)
        this.token = response.token
        localStorage.setItem('auth_token', response.token)
        await this.fetchProfile()
        this.isAuthenticated = true
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    async fetchProfile() {
      try {
        const profile = await profileAPI.getProfile()
        this.user = profile
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    },

    async updateAddress(address) {
      try {
        const response = await profileAPI.updateAddress(address)
        this.user.shipping_address = {
          line1: address.line1,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        }
        // Update name if provided
        if (address.name) {
          this.user.name = address.name
        }
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('auth_token')
    }
  },

  persist: {
    key: 'nirva_auth',
    paths: ['token', 'user', 'isAuthenticated']
  }
})
