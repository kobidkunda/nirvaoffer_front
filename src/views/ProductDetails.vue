<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { motion, AnimatePresence } from 'motion-v'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

// IMPORTS REMOVED:
// 'useAuthStore', 'useWalletStore', and 'useLanguage' are
// auto-imported by 'unplugin-auto-import' (see vite.config.js)
import { shopAPI, redemptionAPI } from '@/api/endpoints'
import { useCartStore } from '@/stores/cart'

// Import Common Components
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

// --- Initialize Stores, Router, and Composables ---
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore() // This now works globally
const walletStore = useWalletStore() // This now works globally
const cartStore = useCartStore()
const { t, locale } = useLanguage() // This now works globally

// --- Page State ---
const loadingProduct = ref(true)
const placingOrder = ref(false)
const addingToCart = ref(false)
const product = ref(null)
const error = ref('')
const successMessage = ref('')

// --- Modal State ---
const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const showConfirmModal = ref(false)
const showAddressModal = ref(false)
const addressError = ref('')

// Address form state, pre-filled if user data exists
const address = ref({
  line1: authStore.user?.shipping_address?.line1 || '',
  city: authStore.user?.shipping_address?.city || '',
  state: authStore.user?.shipping_address?.state || '',
  pincode: authStore.user?.shipping_address?.pincode || ''
})

// --- Computed Properties ---
const walletBalance = computed(() => walletStore.balance)
const formattedBalance = computed(() => walletStore.formattedBalance)
const userAddress = computed(() => authStore.user?.shipping_address)

// --- Data Fetching ---
const fetchProduct = async () => {
  loadingProduct.value = true
  error.value = ''
  try {
    const response = await shopAPI.getProduct(route.params.id, locale.value)
    product.value = response.product
  } catch (err) {
    console.error('Failed to fetch product:', err)
    error.value = err.message || t('errors.network')
  } finally {
    loadingProduct.value = false
  }
}

// Fetch product on mount and when language changes
onMounted(fetchProduct)
watch(locale, fetchProduct)

// --- Methods ---
const handleRedeemClick = () => {
  error.value = ''
  successMessage.value = ''

  // 1. Check if user has an address
  if (!userAddress.value || !userAddress.value.line1) {
    showAddressModal.value = true
    return
  }

  // 2. Check if user has enough balance
  if (walletBalance.value < product.value.redemption_cost) {
    error.value = t('redeem.insufficientBalance')
    return
  }

  // 3. Show confirmation modal
  showConfirmModal.value = true
}

const confirmRedemption = async () => {
  if (!product.value) return

  placingOrder.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response = await redemptionAPI.placeOrder(product.value.id, 1)

    // Update wallet balance from API response
    walletStore.syncWallet({
      balance: response.new_wallet_balance,
      lucky_draw_tickets: walletStore.ticketCount // Preserve existing ticket count
    })

    successMessage.value = t('redeem.orderSuccess')
    showConfirmModal.value = false
  } catch (err) {
    console.error('Failed to place order:', err)
    error.value = err.message || t('errors.unknown')
  } finally {
    placingOrder.value = false
  }
}

const handleAddressSubmit = async () => {
  placingOrder.value = true
  addressError.value = ''
  try {
    // Use the authStore action to update the address
    const result = await authStore.updateAddress(address.value)

    if (result.success) {
      showAddressModal.value = false
    } else {
      addressError.value = result.error || t('errors.unknown')
    }
  } catch (err) {
    console.error('Failed to update address:', err)
    addressError.value = err.message || t('errors.unknown')
  } finally {
    placingOrder.value = false
  }
}

const addToCart = async () => {
  if (!product.value) return
  addingToCart.value = true
  try {
    await cartStore.addToCart(product.value.id, 1)
    successMessage.value = t('cart.addedToCart')
  } catch (error) {
    console.error('Failed to add to cart:', error)
    error.value = error.message || t('errors.unknown')
  } finally {
    addingToCart.value = false
  }
}

const goBack = () => router.back()
</script>

<template>
  <div class="product-details-page">
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

      <AnimatePresence>
        <motion.div
          v-if="error"
          class="error-message"
          :initial="{ opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
        >
          {{ error }}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          v-if="successMessage"
          class="success-message"
          :initial="{ opacity: 0, y: -10 }"
          :animate="{ opacity: 1, y: 0 }"
        >
          🎉 {{ successMessage }}
        </motion.div>
      </AnimatePresence>

      <div v-if="loadingProduct" class="loading">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>

      <div v-else-if="product" class="product-details">
        <motion.div
          class="product-header"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
        >
          <div class="product-images">
            <Swiper
              :slides-per-view="1"
              :autoplay="{ delay: 3000 }"
              :loop="product.images.length > 1"
              :pagination="{ clickable: true }"
              class="product-swiper"
            >
              <SwiperSlide v-for="image in product.images" :key="image.thumb">
                <img
                  :src="image.large"
                  :alt="product.name"
                  class="product-image"
                />
              </SwiperSlide>
            </Swiper>
          </div>
          <div class="product-info">
            <h1 class="product-name">{{ product.brand }} - {{ product.name }}</h1>
            <p v-if="product.variant_name" class="product-variant">{{ product.variant_name }}</p>
            <p v-if="product.category" class="product-category">Category: {{ product.category.name }}</p>
            <p class="product-description">{{ product.short_description || t('productDetails.description') }}</p>
            <div class="product-pricing">
              <span class="mrp">{{ t('productDetails.mrp') }}: ₹{{ product.mrp }}</span>
              <span class="redemption-cost">{{ t('redeem.redeemFor') }} ₹{{ product.redemption_cost }}</span>
              <span v-if="product.cashback_percentage" class="cashback">Cashback: {{ product.cashback_percentage }}%</span>
            </div>
            <div class="stock-info">
              <span :class="{ 'out-of-stock': product.stock_quantity === 0 }">
                {{ product.stock_quantity === 0 ? t('productDetails.outOfStock') : `${t('productDetails.stock')}: ${product.stock_quantity}` }}
              </span>
            </div>
            <div v-if="product.video_url" class="video-section">
              <h3>Product Video</h3>
              <video controls :src="product.video_url" class="product-video"></video>
            </div>
          </div>
        </motion.div>

        <motion.div
          class="wallet-card card"
          :initial="{ opacity: 0, scale: 0.9 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ delay: 0.1 }"
        >
          <span class="wallet-label">{{ t('redeem.yourBalance') }}</span>
          <h2 class="wallet-balance">{{ formattedBalance }}</h2>
        </motion.div>

        <motion.div
          class="action-section"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 }"
        >
          <div class="action-buttons">
            <BaseButton
              @click="addToCart"
              :loading="addingToCart"
              variant="secondary"
              :disabled="product.stock_quantity === 0"
            >
              {{ product.stock_quantity === 0 ? t('productDetails.outOfStock') : t('productDetails.addToCart') }}
            </BaseButton>
            <BaseButton
              @click="handleRedeemClick"
              :disabled="walletBalance < product.redemption_cost || product.stock_quantity === 0"
              size="large"
            >
              {{ product.stock_quantity === 0 ? 'Out of Stock' : t('redeem.redeemNow') }}
            </BaseButton>
          </div>
        </motion.div>
      </div>

      <div v-else class="no-product">
        <p>{{ t('errors.productNotFound') }}</p>
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
        v-if="showConfirmModal"
        class="modal-overlay"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        @click.self="showConfirmModal = false"
      >
        <motion.div
          class="modal-content"
          :initial="{ scale: 0.9, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :exit="{ scale: 0.9, opacity: 0 }"
        >
          <h2>{{ t('redeem.confirmRedemption') }}</h2>
          <p v-if="product">
            Are you sure you want to redeem
            <strong>{{ product.name }} ({{ product.variant_name }})</strong>
            for <strong>₹{{ product.redemption_cost }}</strong>?
          </p>
          <div class="modal-actions">
            <BaseButton
              @click="showConfirmModal = false"
              variant="secondary"
              :disabled="placingOrder"
            >
              {{ t('common.cancel') }}
            </BaseButton>
            <BaseButton
              @click="confirmRedemption"
              :loading="placingOrder"
            >
              {{ t('redeem.placeOrder') }}
            </BaseButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

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
          <h2>{{ t('redeem.address') }}</h2>
          <p>{{ t('redeem.address') }}</p>
          <form @submit.prevent="handleAddressSubmit" class="address-form">
            <BaseInput
              v-model="address.line1"
              label="Address Line 1"
              placeholder="House No, Street Name"
              required
            />
            <BaseInput
              v-model="address.city"
              label="City"
              placeholder="Your City"
              required
            />
            <BaseInput
              v-model="address.state"
              label="State"
              placeholder="Your State"
              required
            />
            <BaseInput
              v-model="address.pincode"
              label="Pincode"
              placeholder="6-digit Pincode"
              type="tel"
              maxlength="6"
              required
            />
            <div v-if="addressError" class="error-message">
              {{ addressError }}
            </div>
            <BaseButton
              type="submit"
              :loading="placingOrder"
            >
              {{ t('common.save') }}
            </BaseButton>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.product-details-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.back-button-container {
  margin-bottom: 20px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-header {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-images {
  width: 100%;
  margin-bottom: 20px;
}

.product-swiper {
  border-radius: 12px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.product-variant {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.product-description {
  font-size: 16px;
  color: #374151;
  line-height: 1.5;
  margin: 0;
}

.product-category {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0;
}

.product-pricing {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mrp {
  font-size: 16px;
  color: #6b7280;
  text-decoration: line-through;
}

.redemption-cost {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
}

.cashback {
  font-size: 16px;
  color: #059669;
  font-weight: 600;
}

.stock-info {
  font-size: 16px;
  font-weight: 600;
}

.out-of-stock {
  color: #ef4444;
}

.video-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.video-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.product-video {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
}

.wallet-card {
  padding: 20px 24px;
  text-align: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
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

.action-section {
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.loading, .no-product {
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

.error-message {
  background: #fee2e2;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
}

.success-message {
  background: #dcfce7;
  color: #166534;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
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

.modal-content p {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
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
</style>