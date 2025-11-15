<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { motion } from 'motion-v'

// IMPORTS REMOVED:
// 'useAuthStore', 'useWalletStore', and 'useLanguage' are
// auto-imported by 'unplugin-auto-import' (see vite.config.js)
import { shopAPI } from '@/api/endpoints'
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

// Import Common Components
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

// --- Initialize Stores, Router, and Composables ---
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore() // This now works globally
const walletStore = useWalletStore() // This now works globally
const cartStore = useCartStore()
const { t, locale } = useLanguage() // This now works globally
const toast = useToast()

// --- Page State ---
const loadingCategory = ref(true)
const category = ref(null)
const error = ref('')

// --- Cart State ---
const addingToCart = ref(null)

// --- Modal State ---
const showHelpModal = ref(false)
const showLanguageModal = ref(false)

// --- Computed Properties ---
const walletBalance = computed(() => walletStore.balance)
const formattedBalance = computed(() => walletStore.formattedBalance)

// --- Data Fetching ---
const fetchCategory = async () => {
  loadingCategory.value = true
  error.value = ''
  try {
    const response = await shopAPI.getCategory(route.params.slug, locale.value)
    category.value = response.category || response
  } catch (err) {
    console.error('Failed to fetch category:', err)
    // Check if error response contains category data (API returns 404 but includes data)
    if (err.response?.data?.category) {
      category.value = err.response.data.category
      error.value = '' // Clear error since we have data
    } else {
      error.value = err.message || t('errors.network')
    }
  } finally {
    loadingCategory.value = false
  }
}

// Fetch category on mount and when language changes
onMounted(fetchCategory)
watch(locale, fetchCategory)

// --- Methods ---
const addToCart = async (productId, event) => {
  event.stopPropagation() // Prevent card click
  addingToCart.value = productId

  try {
    await cartStore.addToCart(productId, 1)
    toast.showSuccess(t('cart.addedToCart'))
  } catch (error) {
    console.error('Failed to add to cart:', error)
    toast.showError(t('cart.addToCartError'))
  } finally {
    addingToCart.value = null
  }
}
const goBack = () => router.back()
</script>

<template>
  <div class="category-details-page">
    <GlobalHeader
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />

    <div class="content">
      <div class="back-button-container">
        <BaseButton @click="goBack" variant="secondary" size="small">
          ← {{ t('common.back') }}
        </BaseButton>
      </div>

      <div
        v-if="error"
        class="error-message"
      >
        {{ error }}
      </div>

      <div v-if="loadingCategory" class="loading">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>

      <div v-else-if="category" class="category-content">
        <div class="category-header">
          <div class="category-image">
            <img :src="(category.images?.large || category.images?.original || '')" :alt="category.name" />
          </div>
          <div class="category-info">
            <h1 class="category-name">{{ category.name }}</h1>
            <p class="category-description">{{ category.description }}</p>
            <p class="category-count">{{ category.products_count }} {{ t('categoryDetails.products') }}</p>
          </div>
        </div>

        <div class="wallet-card card">
          <span class="wallet-label">{{ t('redeem.yourBalance') }}</span>
          <h2 class="wallet-balance">{{ formattedBalance }}</h2>
        </div>

        <div class="products-section">
          <h2 class="section-title">{{ t('categoryDetails.products') }}</h2>
          <div class="product-grid">
            <div
              v-for="product in category.products || []"
              :key="product.id"
              class="card product-card"
              @click="router.push('/product/' + product.id)"
            >
              <div class="product-image">
                <img :src="product.images[0]?.medium" :alt="product.name" />
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.brand }} - {{ product.name }}</h3>
                <p class="product-variant">{{ product.variant_name }}</p>
                <p class="product-description">{{ product.short_description }}</p>
                <div class="product-footer">
                  <span class="product-cost">₹{{ product.redemption_cost }}</span>
                  <div class="product-actions">
                    <BaseButton
                      @click="addToCart(product.id, $event)"
                      :loading="addingToCart === product.id"
                      size="small"
                      variant="secondary"
                      :disabled="product.stock_quantity === 0"
                    >
                      {{ product.stock_quantity === 0 ? t('productDetails.outOfStock') : t('productDetails.addToCart') }}
                    </BaseButton>
                    <span :class="{ 'out-of-stock': product.stock_quantity === 0 }">
                      {{ product.stock_quantity === 0 ? t('productDetails.outOfStock') : '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!(category.products || []).length" class="no-products">
              <p>{{ t('categoryDetails.noProducts') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-category">
        <p>{{ t('errors.categoryNotFound') }}</p>
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
  </div>
</template>

<style scoped>
.category-details-page {
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

.category-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-header {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  text-align: center;
}

.category-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-name {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.category-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.category-count {
  font-size: 14px;
  color: #374151;
  margin: 0;
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

.products-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  aspect-ratio: 5/4;
  border-radius: 12px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.product-variant {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.product-description {
  font-size: 13px;
  color: #374151;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-cost {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.out-of-stock {
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
}

.no-products, .no-category {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
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

.error-message {
  background: #fee2e2;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>