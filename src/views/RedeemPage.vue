<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
// IMPORTS REMOVED:
// 'useAuthStore', 'useWalletStore', and 'useLanguage' are
// auto-imported by 'unplugin-auto-import' (see vite.config.js)
import { redemptionAPI } from '@/api/endpoints'
import { motion, AnimatePresence } from 'motion-v'

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
const { t, locale } = useLanguage() // This now works globally

// --- Page State ---
const loadingProducts = ref(true)
const placingOrder = ref(false)
const products = ref([])
const error = ref('')
const successMessage = ref('')

// --- Modal State ---
const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const selectedProduct = ref(null)
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
const fetchProducts = async () => {
  loadingProducts.value = true
  error.value = ''
  try {
    // Fetch products using the currently selected language
    const response = await redemptionAPI.getProducts(locale.value)
    products.value = response.products || []
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = err.message || t('errors.network')
  } finally {
    loadingProducts.value = false
  }
}

// Fetch user profile (to get address) and products on mount
onMounted(async () => {
  // Ensure we have the latest user profile, including address
  if (authStore.isLoggedIn) {
    await authStore.fetchProfile()
    // Update address form again after fetching profile
    address.value = {
      line1: authStore.user?.shipping_address?.line1 || '',
      city: authStore.user?.shipping_address?.city || '',
      state: authStore.user?.shipping_address?.state || '',
      pincode: authStore.user?.shipping_address?.pincode || ''
    }
  }
  await fetchProducts()
})

// Refetch products if the user changes the language
watch(locale, fetchProducts)

// --- Methods ---
const handleRedeemClick = (product) => {
  error.value = ''
  successMessage.value = ''
  
  // 1. Check if user has an address
  if (!userAddress.value || !userAddress.value.line1) {
    showAddressModal.value = true
    return
  }

  // 2. Check if user has enough balance
  if (walletBalance.value < product.redemption_cost) {
    error.value = t('redeem.insufficientBalance')
    return
  }
  
  // 3. Show confirmation modal
  selectedProduct.value = product
  showConfirmModal.value = true
}

const confirmRedemption = async () => {
  if (!selectedProduct.value) return

  placingOrder.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const response = await redemptionAPI.placeOrder(selectedProduct.value.id, 1)
    
    // Update wallet balance from API response
    walletStore.syncWallet({
      balance: response.new_wallet_balance,
      lucky_draw_tickets: walletStore.ticketCount // Preserve existing ticket count
    })
    
    successMessage.value = t('redeem.orderSuccess')
    showConfirmModal.value = false
    selectedProduct.value = null
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

const goToDashboard = () => router.push('/dashboard')
</script>

<template>
  <div class="redeem-page">
    <GlobalHeader 
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />
    
    <div class="content">
      <motion.h1
        class="page-title"
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
      >
        {{ t('redeem.title') }}
      </motion.h1>

      <motion.div 
        class="card wallet-card"
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ delay: 0.1 }"
      >
        <span class="wallet-label">{{ t('redeem.yourBalance') }}</span>
        <h2 class="wallet-balance">{{ formattedBalance }}</h2>
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

      <div v-if="loadingProducts" class="loading">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>
      
      <div v-else class="product-list">
        <motion.div
          v-for="(product, index) in products"
          :key="product.id"
          class="card product-card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 + index * 0.05 }"
        >
          <div class="product-info">
            <div class="product-icon">🎁</div>
            <div class="product-details">
              <h3 class="product-name">{{ product.brand }} - {{ product.name }}</h3>
              <p class="product-variant">{{ product.variant_name }}</p>
              <p class="product-description">{{ product.short_description }}</p>
            </div>
          </div>
          <div class="product-action">
            <span class="product-cost">
              {{ t('redeem.redeemFor') }} <strong>₹{{ product.redemption_cost }}</strong>
            </span>
            <BaseButton
              @click="handleRedeemClick(product)"
              :disabled="walletBalance < product.redemption_cost || product.stock_quantity === 0"
              size="small"
            >
              {{ product.stock_quantity === 0 ? 'Out of Stock' : 'Redeem' }}
            </BaseButton>
          </div>
        </motion.div>
        
        <div v-if="!products.length" class="no-products">
          <p>There are currently no products available for redemption.</p>
        </div>
      </div>
      
      <BaseButton 
        @click="goToDashboard"
        variant="secondary"
        class="back-button"
      >
        ← Back to Dashboard
      </BaseButton>
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
          <p v-if="selectedProduct">
            Are you sure you want to redeem 
            <strong>{{ selectedProduct.name }} ({{ selectedProduct.variant_name }})</strong>
            for <strong>₹{{ selectedProduct.redemption_cost }}</strong>?
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
          <p>Please enter your shipping address to redeem gifts.</p>
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
.redeem-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

.loading {
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

.content {
  flex: 1;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
  text-align: center;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
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

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.product-icon {
  font-size: 36px;
  background: #f0fdf4;
  border-radius: 12px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.product-variant {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.product-description {
  font-size: 14px;
  color: #374151;
  margin-top: 8px;
  line-height: 1.5;
}

.product-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
}

.product-cost {
  font-size: 15px;
  color: #6b7280;
}

.product-cost strong {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.product-action .base-button {
  width: auto;
  min-width: 100px;
}

.no-products {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.back-button {
  margin-top: 24px;
}

/* Error & Success Messages */
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

/* Modals */
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