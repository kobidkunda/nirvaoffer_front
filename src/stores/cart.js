// src/stores/cart.js
import { defineStore } from 'pinia'
import { cartAPI } from '@/api/endpoints'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: null,
    loading: false
  }),

  getters: {
    items: (state) => state.cart?.items || [],
    itemCount: (state) => state.cart?.total_items || 0,
    totalAmount: (state) => state.cart?.cart_total || 0,
    walletBalance: (state) => parseFloat(state.cart?.wallet_balance || 0),
    canCheckout: (state) => state.cart?.can_checkout || false,
    insufficientFunds: (state) => state.cart?.insufficient_funds || false,
    requiredAmount: (state) => state.cart?.required_amount || 0,
    isEmpty: (state) => !state.cart?.items?.length,
    formattedTotal: (state) => `₹${(state.cart?.cart_total || 0).toFixed(2)}`,
    formattedWalletBalance: (state) => `₹${(state.cart?.wallet_balance || 0)}`
  },

  actions: {
    async fetchCart() {
      this.loading = true
      try {
        const response = await cartAPI.getCart()
        this.cart = response.cart || null
      } catch (error) {
        console.error('Failed to fetch cart:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async addToCart(productId, quantity = 1) {
      try {
        await cartAPI.addToCart(productId, quantity)
        await this.fetchCart() // Refresh cart data
      } catch (error) {
        console.error('Failed to add to cart:', error)
        throw error
      }
    },

    async updateQuantity(cartItemId, quantity) {
      try {
        await cartAPI.updateCartItem(cartItemId, quantity)
        await this.fetchCart() // Refresh cart data
      } catch (error) {
        console.error('Failed to update cart item:', error)
        throw error
      }
    },

    async removeItem(cartItemId) {
      try {
        await cartAPI.removeCartItem(cartItemId)
        await this.fetchCart() // Refresh cart data
      } catch (error) {
        console.error('Failed to remove cart item:', error)
        throw error
      }
    },

    async clearCart() {
      try {
        await cartAPI.clearCart()
        this.items = []
        this.totalItems = 0
        this.totalAmount = 0
      } catch (error) {
        console.error('Failed to clear cart:', error)
        throw error
      }
    },

    async checkout(notes = null) {
      try {
        const response = await cartAPI.checkoutCart(notes)
        // Clear cart after successful checkout
        this.cart = null
        return response
      } catch (error) {
        console.error('Failed to checkout:', error)
        throw error
      }
    }
  }
})