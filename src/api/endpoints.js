// src/api/endpoints.js
import { apiClient } from './client'

// Authentication APIs
export const authAPI = {
  // Request OTP
  requestOTP: (phoneNumber) => 
    apiClient('/otp/request', {
      method: 'POST',
      body: { phone_number: phoneNumber }
    }),
  
  // Login with OTP
  loginWithOTP: (phoneNumber, otpCode) =>
    apiClient('/otp/login', {
      method: 'POST',
      body: { phone_number: phoneNumber, otp_code: otpCode }
    })
}

// Code Validation & Reward APIs
export const rewardAPI = {
  // Validate scanned code (PUBLIC - no auth)
  validateCode: (scannedCode) =>
    apiClient('/validate-code-pub', {
      method: 'POST',
      body: { scanned_code: scannedCode }
    }),

  // Claim reward (AUTH REQUIRED)
  claimReward: (codeToken) =>
    apiClient('/claim-reward', {
      method: 'POST',
      body: { code_token: codeToken }
    }),

  // Get gift slider data (PUBLIC)
  getGiftSlider: () => apiClient('/json/gift-slider')
}

// Profile APIs
export const profileAPI = {
  // Get current user profile
  getProfile: () => apiClient('/profile/me'),
  
  // Update shipping address
  updateAddress: (address) =>
    apiClient('/profile/address', {
      method: 'POST',
      body: address
    })
}

// Redemption APIs
export const redemptionAPI = {
  // List products available for redemption
  getProducts: (lang = 'en') =>
    apiClient('/redeem/products', {
      params: { lang }
    }),
  
  // Place redemption order
  placeOrder: (productId, quantity) =>
    apiClient('/redeem/order', {
      method: 'POST',
      body: { product_id: productId, quantity }
    })
}
