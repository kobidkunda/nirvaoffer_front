<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { motion, AnimatePresence } from 'motion-v'

// IMPORTS REMOVED:
// 'useAuthStore', 'useWalletStore', and 'useLanguage' are
// auto-imported by 'unplugin-auto-import' (see vite.config.js)
import { ordersAPI } from '@/api/endpoints'

// Import Common Components
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import FloatingActions from '@/components/common/FloatingActions.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

// --- Initialize Stores, Router, and Composables ---
const route = useRoute()
const router = useRouter()
const { t } = useLanguage() // This now works globally

// --- Page State ---
const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const loading = ref(true)
const order = ref(null)
const error = ref('')

// --- Computed Properties ---
const orderId = computed(() => route.params.id)

// --- Methods ---
const fetchOrderDetails = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await ordersAPI.getOrder(orderId.value)
    order.value = response
  } catch (err) {
    console.error('Failed to fetch order details:', err)
    error.value = err.message || 'Failed to load order details'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status) => {
  const colors = {
    'pending': '#f59e0b',
    'processing': '#3b82f6',
    'shipped': '#8b5cf6',
    'delivered': '#10b981',
    'cancelled': '#ef4444'
  }
  return colors[status] || '#6b7280'
}

const goBack = () => router.back()

// --- Lifecycle ---
onMounted(() => {
  fetchOrderDetails()
})
</script>

<template>
  <div class="order-details-page">
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
          ← {{ t('orderDetails.back') }}
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

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>

      <div v-else-if="order" class="order-details">
        <motion.div
          class="order-header card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
        >
          <div class="order-title">
            <h1>Order #{{ order.id }}</h1>
            <span
              class="status-badge"
              :style="{ backgroundColor: getStatusColor(order.status) }"
            >
              {{ order.status }}
            </span>
          </div>
          <div class="order-meta">
            <p><strong>{{ t('orderDetails.orderDate') }}:</strong> {{ formatDate(order.order_date) }}</p>
          </div>
        </motion.div>

        <motion.div
          class="order-items card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.1 }"
        >
          <h2>{{ t('orderDetails.items') }}</h2>
          <div class="items-list">
            <div
              v-for="item in order.items"
              :key="item.product_id"
              class="order-item"
            >
              <div class="item-image">
                <img :src="item.image_url" :alt="item.product_name" />
              </div>
              <div class="item-details">
                <h3 class="item-name">{{ item.product_name }}</h3>
                <p v-if="item.variant_name" class="item-variant">{{ item.variant_name }}</p>
                <p class="item-price">₹{{ item.cost_per_item }} × {{ item.quantity }}</p>
              </div>
              <div class="item-total">
                <p class="total-amount">₹{{ (item.cost_per_item * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          class="order-summary card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 }"
        >
          <h2>{{ t('orderDetails.summary') }}</h2>
          <div class="summary-row total-row">
            <span>{{ t('orderDetails.total') }}:</span>
            <span>₹{{ order.total_cost }}</span>
          </div>
        </motion.div>

        <motion.div
          v-if="order.shipping_address"
          class="shipping-address card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.3 }"
        >
          <h2>{{ t('orderDetails.address') }}</h2>
          <div class="address-details">
            <p>{{ order.shipping_address.line1 }}</p>
            <p>{{ order.shipping_address.city }}, {{ order.shipping_address.state }} {{ order.shipping_address.pincode }}</p>
          </div>
        </motion.div>

        <motion.div
          v-if="order.notes"
          class="order-notes card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4 }"
        >
          <h2>{{ t('orderDetails.notes') }}</h2>
          <p>{{ order.notes }}</p>
        </motion.div>
      </div>

      <div v-else class="no-order">
        <p>{{ t('orderDetails.orderNotFound') }}</p>
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

    <FloatingActions
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />
  </div>
</template>

<style scoped>
.order-details-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.back-button-container {
  margin-bottom: 20px;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  text-align: center;
}

.order-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.order-title h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.order-meta {
  text-align: left;
}

.order-meta p {
  margin: 8px 0;
  font-size: 16px;
  color: #374151;
}

.order-items h2,
.order-summary h2,
.shipping-address h2,
.order-notes h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
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
  margin: 0 0 8px 0;
}

.item-price {
  font-size: 14px;
  color: #374151;
  margin: 0;
}

.item-total {
  text-align: right;
}

.total-amount {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
  margin: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 16px;
  color: #374151;
}

.total-row {
  font-size: 18px;
  font-weight: 600;
  border-top: 2px solid #e5e7eb;
  padding-top: 12px;
  margin-top: 12px;
}

.address-details p {
  margin: 4px 0;
  font-size: 16px;
  color: #374151;
}

.order-notes p {
  font-size: 16px;
  color: #374151;
  line-height: 1.6;
}

.loading, .no-order {
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
</style>