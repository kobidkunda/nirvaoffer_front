<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
// IMPORTS REMOVED:
// 'useAuthStore', 'useWalletStore', and 'useLanguage' are
// auto-imported by 'unplugin-auto-import' (see vite.config.js)
import { shopAPI } from '@/api/endpoints'
import { useCartStore } from '@/stores/cart'
import { motion, AnimatePresence } from 'motion-v'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

// Import Common Components
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import FloatingActions from '@/components/common/FloatingActions.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

// --- Initialize Stores, Router, and Composables ---
const router = useRouter()
const authStore = useAuthStore() // This now works globally
const walletStore = useWalletStore() // This now works globally
const cartStore = useCartStore()
const { t, locale } = useLanguage() // This now works globally

// --- Page State ---
const loadingSlider = ref(true)
const loadingCategories = ref(true)
const loadingProducts = ref(true)
const placingOrder = ref(false)
const slider = ref([])
const categories = ref([])
const products = ref([])
const error = ref('')
const successMessage = ref('')

// --- Cart State ---
const addingToCart = ref(null)

// --- Modal State ---
const showHelpModal = ref(false)
const showLanguageModal = ref(false)

// --- Computed Properties ---
const walletBalance = computed(() => walletStore.balance)
const formattedBalance = computed(() => walletStore.formattedBalance)

// --- Data Fetching ---
const fetchSlider = async () => {
  loadingSlider.value = true
  try {
    const response = await shopAPI.getSlider()
    slider.value = response.slides || []
  } catch (err) {
    console.error('Failed to fetch slider:', err)
  } finally {
    loadingSlider.value = false
  }
}

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await shopAPI.getCategories(locale.value)
    categories.value = response.categories || []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  } finally {
    loadingCategories.value = false
  }
}

const fetchProducts = async () => {
  loadingProducts.value = true
  error.value = ''
  try {
    // Fetch products using the currently selected language
    const response = await shopAPI.getProducts(locale.value)
    products.value = (response.products || []).slice(0, 20) // Limit to 20
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = err.message || t('errors.network')
  } finally {
    loadingProducts.value = false
  }
}

// Fetch data on mount
onMounted(async () => {
  await Promise.all([fetchSlider(), fetchCategories(), fetchProducts()])
})

// Refetch categories and products if the user changes the language
watch(locale, async () => {
  await Promise.all([fetchCategories(), fetchProducts()])
})

// --- Methods ---
const addToCart = async (productId, event) => {
  event.stopPropagation() // Prevent card click
  addingToCart.value = productId
  try {
    await cartStore.addToCart(productId, 1)
  } catch (error) {
    console.error('Failed to add to cart:', error)
  } finally {
    addingToCart.value = null
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
      <!-- Slider -->
      <motion.div
        v-if="!loadingSlider"
        class="slider-section"
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
      >
        <Swiper
          :slides-per-view="1"
          :autoplay="{ delay: 3000 }"
          :loop="true"
          :pagination="{ clickable: true }"
          class="slider-swiper"
        >
          <SwiperSlide v-for="slide in slider" :key="slide.id">
            <div class="slide" :style="{ backgroundImage: `url(${slide.images.desktop})` }">
              <div class="slide-content">
                <h2>{{ slide.title }}</h2>
                <p>{{ slide.description }}</p>
                <a v-if="slide.link" :href="slide.link.url" :target="slide.link.targetBlank ? '_blank' : '_self'" class="slide-cta">
                  {{ slide.link.ctaText }}
                </a>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </motion.div>

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

      <!-- Categories Carousel -->
      <motion.div
        v-if="!loadingCategories"
        class="categories-section"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.2 }"
      >
        <h2 class="section-title">{{ t('common.categories') }}</h2>
        <Swiper
          :slides-per-view="4"
          :space-between="16"
          :loop="false"
          :breakpoints="{
            320: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 }
          }"
          class="categories-swiper"
        >
          <SwiperSlide v-for="category in categories" :key="category.id">
            <div class="category-card" @click="router.push('/category/' + category.slug)">
              <img :src="category.images.thumb.replace('https://offer-api.nirva-naturals.com', '')" :alt="category.name" class="category-image" />
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-count">{{ category.products_count }} products</p>
            </div>
          </SwiperSlide>
        </Swiper>
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
      
      <div v-else class="product-grid">
        <motion.div
          v-for="(product, index) in products"
          :key="product.id"
          class="card product-card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 + index * 0.05 }"
          @click="router.push('/product/' + product.id)"
        >
          <div class="product-image">
            <img :src="product.images[0]?.medium.replace('https://offer-api.nirva-naturals.com', '')" :alt="product.name" />
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
                  {{ product.stock_quantity === 0 ? '' : `${t('productDetails.stock')}: ${product.stock_quantity}` }}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div v-if="!products.length" class="no-products">
          <p>{{ t('redeem.title') }}</p>
        </div>
      </div>
      
      <BaseButton 
        @click="goToDashboard"
        variant="secondary"
        class="back-button"
      >
        ← {{ t('dashboard.welcome') }}
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

    <FloatingActions
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />

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
  max-width: 1200px;
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

/* Slider Styles */
.slider-section {
  margin-bottom: 30px;
}

.slider-swiper {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.slide {
  position: relative;
  height: 300px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-content {
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 12px;
  max-width: 400px;
}

.slide h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.slide p {
  font-size: 16px;
  margin: 0 0 16px 0;
}

.slide-cta {
  display: inline-block;
  background: #10b981;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}

.slide-cta:hover {
  background: #059669;
}

/* Categories Styles */
.categories-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.categories-swiper {
  border-radius: 12px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-2px);
}

.category-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 8px;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.category-count {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}
</style>