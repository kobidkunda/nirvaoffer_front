<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { motion, AnimatePresence } from 'motion-v'

// IMPORTS REMOVED:
// 'useAuthStore', 'useWalletStore', and 'useLanguage' are
// auto-imported by 'unplugin-auto-import' (see vite.config.js)
import { useCartStore } from '@/stores/cart'

// Import Common Components
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

// --- Initialize Stores, Router, and Composables ---
const router = useRouter()
const authStore = useAuthStore() // This now works globally
const walletStore = useWalletStore() // This now works globally
const cartStore = useCartStore()
const { t } = useLanguage() // This now works globally

// --- Page State ---
const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const showCheckoutModal = ref(false)
const showAddressModal = ref(false)
const checkoutNotes = ref('')
const checkingOut = ref(false)
const addressError = ref('')

// --- Computed Properties ---
const canCheckout = computed(() => cartStore.canCheckout)
const insufficientFunds = computed(() => cartStore.insufficientFunds)
const requiredAmount = computed(() => cartStore.requiredAmount)

// Address form state, pre-filled if user data exists
const address = ref({
  name: authStore.user?.name || '',
  line1: authStore.user?.shipping_address?.line1 || '',
  city: authStore.user?.shipping_address?.city || '',
  state: authStore.user?.shipping_address?.state || '',
  pincode: authStore.user?.shipping_address?.pincode || ''
})

// --- Lifecycle ---
onMounted(async () => {
  await cartStore.fetchCart()
})

// --- Methods ---
const updateQuantity = async (cartItemId, newQuantity) => {
  if (newQuantity < 1) return
  try {
    await cartStore.updateQuantity(cartItemId, newQuantity)
  } catch (error) {
    console.error('Failed to update quantity:', error)
  }
}

const removeItem = async (cartItemId) => {
  try {
    await cartStore.removeItem(cartItemId)
  } catch (error) {
    console.error('Failed to remove item:', error)
  }
}

const clearCart = async () => {
  try {
    await cartStore.clearCart()
  } catch (error) {
    console.error('Failed to clear cart:', error)
  }
}

const initiateCheckout = () => {
  if (!canCheckout.value) return
  showCheckoutModal.value = true
}

const confirmCheckout = async () => {
  checkingOut.value = true
  try {
    const response = await cartStore.checkout(checkoutNotes.value || null)
    // Update wallet balance
    walletStore.syncWallet({
      balance: response.remaining_wallet_balance,
      lucky_draw_tickets: walletStore.ticketCount
    })
    showCheckoutModal.value = false
    checkoutNotes.value = ''

    // Navigate to order success page with order data
    router.push({
      name: 'order-success',
      params: { orderId: response.order.order_id },
      query: {
        orderNumber: response.order.order_number,
        totalAmount: response.order.total_amount,
        status: response.order.status,
        itemsCount: response.order.items_count,
        createdAt: response.order.created_at,
        remainingBalance: response.remaining_wallet_balance
      }
    })
  } catch (error) {
    console.error('Checkout failed:', error)

    // Handle specific error messages
    if (error.message?.includes('shipping address')) {
      showCheckoutModal.value = false
      showAddressModal.value = true
    } else if (error.message?.includes('Cart is empty')) {
      // Cart became empty, refresh cart
      await cartStore.fetchCart()
    } else if (error.message?.includes('Insufficient wallet balance')) {
      // Refresh cart to get updated balance
      await cartStore.fetchCart()
    }
    // Other errors are handled by the global error handler
  } finally {
    checkingOut.value = false
  }
}

const handleAddressSubmit = async () => {
  checkingOut.value = true
  addressError.value = ''
  try {
    // Update address and name
    const result = await authStore.updateAddress({
      name: address.value.name,
      line1: address.value.line1,
      city: address.value.city,
      state: address.value.state,
      pincode: address.value.pincode
    })

    if (result.success) {
      showAddressModal.value = false
      // Retry checkout after address is saved
      await confirmCheckout()
    } else {
      addressError.value = result.error || t('errors.unknown')
    }
  } catch (error) {
    console.error('Failed to update address:', error)
    addressError.value = error.message || t('errors.unknown')
  } finally {
    checkingOut.value = false
  }
}

const goBack = () => router.back()
</script>

<template>
  <div class="cart-page">
    <GlobalHeader
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />

    <div class="content">
      <motion.div
        class="back-button-container"
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
      >
        <BaseButton @click="goBack" variant="secondary" size="small">
          ← {{ t('common.back') }}
        </BaseButton>
      </motion.div>

      <motion.h1
        class="page-title"
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
      >
        {{ t('cart.cart') }}
      </motion.h1>

      <div v-if="cartStore.loading" class="loading">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>

      <div v-else-if="cartStore.isEmpty" class="empty-cart">
        <motion.div
          class="empty-cart-content"
          :initial="{ opacity: 0, scale: 0.9 }"
          :animate="{ opacity: 1, scale: 1 }"
        >
          <div class="empty-cart-icon">🛒</div>
          <h2>{{ t('cart.empty') }}</h2>
          <p>{{ t('cart.addItems') }}</p>
          <BaseButton @click="router.push('/redeem')" variant="primary">
            {{ t('cart.continueShopping') }}
          </BaseButton>
        </motion.div>
      </div>

      <div v-else class="cart-content">
        <motion.div
          class="cart-items"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 }"
        >
          <div class="cart-header">
            <h2>{{ t('cart.items') }} ({{ cartStore.itemCount }})</h2>
            <BaseButton @click="clearCart" variant="danger" size="small">
              {{ t('cart.clearCart') }}
            </BaseButton>
          </div>

          <div class="items-list">
            <motion.div
              v-for="(item, index) in cartStore.items"
              :key="item.cart_item_id"
              class="cart-item card"
              :initial="{ opacity: 0, x: -20 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ delay: 0.3 + index * 0.1 }"
            >
              <div class="item-image">
                <img :src="item.images[0]?.medium" :alt="item.product_name" />
              </div>
              <div class="item-details">
                <h3 class="item-name">{{ item.brand }} - {{ item.product_name }}</h3>
                <p v-if="item.variant_name" class="item-variant">{{ item.variant_name }}</p>
                <p class="item-price">₹{{ item.price_per_item }} each</p>
                <p v-if="!item.is_available" class="availability-message">{{ item.availability_message }}</p>
              </div>
              <div class="item-actions">
                <div class="quantity-controls">
                  <BaseButton @click="updateQuantity(item.cart_item_id, item.quantity - 1)" size="small" variant="secondary">-</BaseButton>
                  <span class="quantity">{{ item.quantity }}</span>
                  <BaseButton @click="updateQuantity(item.cart_item_id, item.quantity + 1)" size="small" variant="secondary">+</BaseButton>
                </div>
                <p class="item-total">₹{{ item.subtotal.toFixed(2) }}</p>
                <BaseButton @click="removeItem(item.cart_item_id)" variant="danger" size="small">
                  Remove
                </BaseButton>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          class="cart-summary card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4 }"
        >
          <h3>{{ t('cart.summary') }}</h3>
          <div class="summary-row">
            <span>{{ t('cart.totalItems') }}:</span>
            <span>{{ cartStore.itemCount }}</span>
          </div>
          <div class="summary-row total-row">
            <span>{{ t('cart.totalAmount') }}:</span>
            <span>{{ cartStore.formattedTotal }}</span>
          </div>
          <div class="summary-row">
            <span>{{ t('cart.walletBalance') }}:</span>
            <span>{{ cartStore.formattedWalletBalance }}</span>
          </div>
          <div v-if="insufficientFunds" class="summary-row insufficient">
            <span>{{ t('cart.amountNeeded') }}:</span>
            <span>₹{{ requiredAmount.toFixed(2) }}</span>
          </div>
          <div v-else class="summary-row">
            <span>{{ t('cart.remainingBalance') }}:</span>
            <span>₹{{ (cartStore.walletBalance - cartStore.totalAmount).toFixed(2) }}</span>
          </div>

          <div v-if="!canCheckout" class="checkout-warning">
            <p>⚠️ {{ t('cart.insufficientFunds') }}</p>
          </div>

          <BaseButton
            @click="initiateCheckout"
            :disabled="!canCheckout"
            size="large"
            class="checkout-button"
          >
            {{ t('cart.checkout') }}
          </BaseButton>
        </motion.div>
      </div>
    </div>

    <HelpModal
      :show="showHelpModal"
      @close="showHelpModal = false"
    />
    <LanguageModal
      :show="showLanguageModal"
      @close="showLanguageModal = false"
    />

    <AnimatePresence>
      <motion.div
        v-if="showAddressModal"
        class="modal-overlay"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        @click.self="showAddressModal = false"
      >
        <motion.div
          class="modal-content"
          :initial="{ scale: 0.9, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :exit="{ scale: 0.9, opacity: 0 }"
        >
          <h2>{{ t('cart.addressRequired') }}</h2>
          <p>{{ t('cart.addressRequiredDesc') }}</p>
          <form @submit.prevent="handleAddressSubmit" class="address-form">
            <BaseInput
              v-model="address.name"
              :label="t('cart.fullName')"
              :placeholder="t('cart.fullNamePlaceholder')"
              required
            />
            <BaseInput
              v-model="address.line1"
              :label="t('cart.addressLine1')"
              :placeholder="t('cart.addressLine1Placeholder')"
              required
            />
            <BaseInput
              v-model="address.city"
              :label="t('cart.city')"
              :placeholder="t('cart.cityPlaceholder')"
              required
            />
            <BaseInput
              v-model="address.state"
              :label="t('cart.state')"
              :placeholder="t('cart.statePlaceholder')"
              required
            />
            <BaseInput
              v-model="address.pincode"
              :label="t('cart.pincode')"
              :placeholder="t('cart.pincodePlaceholder')"
              type="tel"
              maxlength="6"
              required
            />
            <div v-if="addressError" class="error-message">
              {{ addressError }}
            </div>
            <BaseButton
              type="submit"
              :loading="checkingOut"
            >
              {{ t('cart.saveAddress') }}
            </BaseButton>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    <AnimatePresence>
      <motion.div
        v-if="showCheckoutModal"
        class="modal-overlay"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        @click.self="showCheckoutModal = false"
      >
        <motion.div
          class="modal-content"
          :initial="{ scale: 0.9, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :exit="{ scale: 0.9, opacity: 0 }"
        >
          <h2>{{ t('cart.confirmCheckout') }}</h2>
          <div class="checkout-summary">
            <p><strong>{{ t('cart.totalItems') }}:</strong> {{ cartStore.itemCount }}</p>
            <p><strong>{{ t('cart.totalAmount') }}:</strong> {{ cartStore.formattedTotal }}</p>
            <p><strong>{{ t('cart.remainingBalance') }}:</strong> ₹{{ (cartStore.walletBalance - cartStore.totalAmount).toFixed(2) }}</p>
          </div>

          <div class="checkout-form">
            <BaseInput
              v-model="checkoutNotes"
              :label="t('cart.deliveryNotes')"
              :placeholder="t('cart.deliveryNotesPlaceholder')"
              type="textarea"
              rows="3"
            />
          </div>

          <div class="modal-actions">
            <BaseButton
              @click="showCheckoutModal = false"
              variant="secondary"
              :disabled="checkingOut"
            >
              {{ t('common.cancel') }}
            </BaseButton>
            <BaseButton
              @click="confirmCheckout"
              :loading="checkingOut"
            >
              {{ t('cart.confirmOrder') }}
            </BaseButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.back-button-container {
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
  text-align: center;
}

.wallet-card {
  padding: 20px 24px;
  text-align: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  margin-bottom: 20px;
}

.wallet-label {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.9;
}

.wallet-balance {
  font-size: 40px;
  font-weight: 800;
  margin: 4px 0 0 0;
}

.loading, .empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-cart-content {
  text-align: center;
}

.empty-cart-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cart-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.item-variant {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.item-price {
  font-size: 14px;
  color: #374151;
  margin: 0;
}

.availability-message {
  font-size: 12px;
  color: #ef4444;
  margin: 4px 0 0 0;
  font-weight: 500;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity {
  font-size: 16px;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.item-total {
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
  margin: 0;
}

.cart-summary {
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-summary h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.total-row {
  font-size: 16px;
  font-weight: 600;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
  margin-top: 8px;
}

.insufficient {
  color: #ef4444;
}

.checkout-warning {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  margin: 16px 0;
  font-size: 14px;
  text-align: center;
}

.checkout-button {
  width: 100%;
  margin-top: 16px;
}

.checkout-summary {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.checkout-summary p {
  margin: 8px 0;
}

.checkout-form {
  margin-bottom: 24px;
}

.address-form {
  text-align: left;
}

.address-form .base-button {
  margin-top: 8px;
}

.address-form .error-message {
  margin-top: 0;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.modal-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }

  .cart-item {
    flex-direction: column;
    text-align: center;
  }

  .item-actions {
    align-items: center;
  }
}
</style>