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

// Shop APIs
export const shopAPI = {
  // Get slider data
  getSlider: () => apiClient('/json/slider'),

  // Get categories
  getCategories: (lang = 'en') =>
    apiClient('/categories', {
      params: { lang }
    }),

  // Get category by slug
  getCategory: (slug, lang = 'en') =>
    apiClient(`/categories/${slug}`, {
      params: { lang }
    }),

  // Get all products
  getProducts: (lang = 'en', categoryId, brand) => {
    const params = { lang }
    if (categoryId) params.category_id = categoryId
    if (brand) params.brand = brand
    return apiClient('/products', { params })
  },

  // Get product details
  getProduct: (id, lang = 'en') =>
    apiClient(`/products/${id}`, {
      params: { lang }
    })
}

// Cart APIs
export const cartAPI = {
  // Add product to cart
  addToCart: (productId, quantity) =>
    apiClient('/cart/add', {
      method: 'POST',
      body: { product_id: productId, quantity }
    }),

  // Get user's cart
  getCart: (lang = 'en') =>
    apiClient('/cart', {
      params: { lang }
    }),

  // Update cart item quantity
  updateCartItem: (cartItemId, quantity) =>
    apiClient(`/cart/update/${cartItemId}`, {
      method: 'PUT',
      body: { quantity }
    }),

  // Remove item from cart
  removeCartItem: (cartItemId) =>
    apiClient(`/cart/remove/${cartItemId}`, {
      method: 'DELETE'
    }),

  // Clear entire cart
  clearCart: () =>
    apiClient('/cart/clear', {
      method: 'DELETE'
    }),

  // Checkout cart
  checkoutCart: (notes = null) =>
    apiClient('/cart/checkout', {
      method: 'POST',
      body: notes ? { notes } : {}
    })
}

// Orders APIs
export const ordersAPI = {
  // Get user's orders
  getOrders: () =>
    apiClient('/redeem/orders'),

  // Get order details
  getOrder: (id) =>
    apiClient(`/redeem/orders/${id}`)
}

// Wallet APIs
export const walletAPI = {
  // Get wallet information and transactions
  getWallet: () =>
    apiClient('/wallet')
}
