<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

// --- Initialize Stores, Router, and Composables ---
const router = useRouter()
const { t } = useLanguage() // This now works globally

// --- Page State ---
const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const loading = ref(true)
const orders = ref([])
const error = ref('')

// --- Methods ---
const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await ordersAPI.getOrders()
    orders.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch orders:', err)
    error.value = err.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

const viewOrderDetails = (orderId) => {
  router.push(`/order/${orderId}`)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
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

// --- Lifecycle ---
onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="orders-page">
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
        {{ t('orders.title') }}
      </motion.h1>

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
        <p>{{ t('orders.loading') }}</p>
      </div>

      <div v-else-if="orders.length === 0" class="empty-orders">
        <motion.div
          class="empty-content"
          :initial="{ opacity: 0, scale: 0.9 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ delay: 0.2 }"
        >
          <div class="icon">📦</div>
          <h2>{{ t('orders.empty') }}</h2>
          <p>{{ t('orders.emptyDesc') }}</p>
        </motion.div>
      </div>

      <div v-else class="orders-list">
        <motion.div
          v-for="(order, index) in orders"
          :key="order.order_id"
          class="order-card card"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.1 + index * 0.05 }"
          @click="viewOrderDetails(order.order_id)"
        >
          <div class="order-header">
            <div class="order-info">
              <h3 class="order-number">{{ t('orders.orderNumber') }}{{ order.order_number }}</h3>
              <p class="order-date">{{ formatDate(order.order_date) }}</p>
            </div>
            <div class="order-status">
              <span
                class="status-badge"
                :style="{ backgroundColor: getStatusColor(order.status) }"
              >
                {{ order.status }}
              </span>
            </div>
          </div>

          <div class="order-items-count">
            <p>{{ order.items_count }} item{{ order.items_count > 1 ? 's' : '' }}</p>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">{{ t('cart.total') }}:</span>
              <span class="total-amount">₹{{ order.total_cost }}</span>
            </div>
            <div class="view-details">
              <span>{{ t('orders.viewDetails') }}</span>
            </div>
          </div>
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

    <FloatingActions
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />
  </div>
</template>

<style scoped>
.orders-page {
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
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 40px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.order-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.order-date {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.order-items-count {
  margin-bottom: 16px;
}

.order-items-count p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.total-label {
  font-size: 12px;
  color: #6b7280;
}

.total-amount {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.view-details {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
}

.empty-orders {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-content {
  text-align: center;
}

.empty-content .icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-content h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.empty-content p {
  font-size: 16px;
  color: #6b7280;
  margin: 8px 0;
  line-height: 1.5;
}

.error-message {
  background: #fee2e2;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
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

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>