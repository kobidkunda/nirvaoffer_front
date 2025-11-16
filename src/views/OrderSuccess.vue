<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { motion, AnimatePresence } from 'motion-v'
import { useWalletStore } from '@/stores/wallet'
import { useLanguage } from '@/composables/useLanguage'

// Import Common Components
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const { t } = useLanguage()

const showHelpModal = ref(false)
const showLanguageModal = ref(false)

// Get order data from route params (passed from cart checkout)
const orderData = ref({
  order_id: route.params.orderId,
  order_number: route.query.orderNumber || '',
  total_amount: route.query.totalAmount || '0.00',
  status: route.query.status || 'pending',
  items_count: route.query.itemsCount || 1,
  created_at: route.query.createdAt || new Date().toISOString(),
  remaining_balance: route.query.remainingBalance || '0.00'
})

// Animation states
const showConfetti = ref(false)
const showOrderDetails = ref(false)
const showButtons = ref(false)

onMounted(() => {
  // Start animations sequentially
  setTimeout(() => showConfetti.value = true, 500)
  setTimeout(() => showOrderDetails.value = true, 1500)
  setTimeout(() => showButtons.value = true, 2500)

  // Update wallet balance if provided
  if (orderData.value.remaining_balance) {
    walletStore.syncWallet({
      balance: parseFloat(orderData.value.remaining_balance)
    })
  }
})

const continueShopping = () => {
  router.push('/redeem')
}

const viewOrders = () => {
  router.push('/orders')
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
</script>

<template>
  <div class="order-success-page">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="floating-elements">
        <div class="confetti-piece confetti-1">🎉</div>
        <div class="confetti-piece confetti-2">🎊</div>
        <div class="confetti-piece confetti-3">✨</div>
        <div class="confetti-piece confetti-4">🎁</div>
        <div class="confetti-piece confetti-5">🏆</div>
        <div class="confetti-piece confetti-6">💫</div>
        <div class="confetti-piece confetti-7">🌟</div>
        <div class="confetti-piece confetti-8">🎈</div>
      </div>
    </div>

    <GlobalHeader
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />

    <div class="content">
      <!-- Success Animation -->
      <motion.div
        class="success-animation"
        :initial="{ scale: 0, opacity: 0 }"
        :animate="{ scale: 1, opacity: 1 }"
        :transition="{ duration: 0.8, ease: 'easeOut' }"
      >
        <motion.div
          class="success-icon"
          :animate="{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }"
          :transition="{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }"
        >
          ✅
        </motion.div>

        <motion.h1
          class="success-title"
          :initial="{ y: 30, opacity: 0 }"
          :animate="{ y: 0, opacity: 1 }"
          :transition="{ delay: 0.3, duration: 0.6 }"
        >
          {{ t('orderSuccess.title') }}
        </motion.h1>

        <motion.p
          class="success-subtitle"
          :initial="{ y: 20, opacity: 0 }"
          :animate="{ y: 0, opacity: 1 }"
          :transition="{ delay: 0.5, duration: 0.6 }"
        >
          {{ t('orderSuccess.subtitle') }}
        </motion.p>
      </motion.div>

      <!-- Order Details Card -->
      <AnimatePresence>
        <motion.div
          v-if="showOrderDetails"
          class="order-card card"
          :initial="{ y: 50, opacity: 0 }"
          :animate="{ y: 0, opacity: 1 }"
          :transition="{ duration: 0.6, ease: 'easeOut' }"
        >
          <div class="card-header">
            <h2>{{ t('orderSuccess.orderDetails') }}</h2>
          </div>

          <div class="order-info">
            <motion.div
              class="info-row"
              :initial="{ x: -20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :transition="{ delay: 0.2 }"
            >
              <span class="label">{{ t('orderSuccess.orderNumber') }}:</span>
              <span class="value highlight">{{ orderData.order_number }}</span>
            </motion.div>

            <motion.div
              class="info-row"
              :initial="{ x: -20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :transition="{ delay: 0.3 }"
            >
              <span class="label">{{ t('orderSuccess.orderId') }}:</span>
              <span class="value">{{ orderData.order_id }}</span>
            </motion.div>

            <motion.div
              class="info-row"
              :initial="{ x: -20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :transition="{ delay: 0.4 }"
            >
              <span class="label">{{ t('orderSuccess.totalAmount') }}:</span>
              <span class="value price">₹{{ orderData.total_amount }}</span>
            </motion.div>

            <motion.div
              class="info-row"
              :initial="{ x: -20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :transition="{ delay: 0.5 }"
            >
              <span class="label">{{ t('orderSuccess.itemsCount') }}:</span>
              <span class="value">{{ orderData.items_count }}</span>
            </motion.div>

            <motion.div
              class="info-row"
              :initial="{ x: -20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :transition="{ delay: 0.6 }"
            >
              <span class="label">{{ t('orderSuccess.remainingBalance') }}:</span>
              <span class="value balance">₹{{ orderData.remaining_balance }}</span>
            </motion.div>

            <motion.div
              class="info-row"
              :initial="{ x: -20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :transition="{ delay: 0.7 }"
            >
              <span class="label">{{ t('orderSuccess.orderDate') }}:</span>
              <span class="value">{{ formatDate(orderData.created_at) }}</span>
            </motion.div>

            <motion.div
              class="info-row"
              :initial="{ x: -20, opacity: 0 }"
              :animate="{ x: 0, opacity: 1 }"
              :transition="{ delay: 0.8 }"
            >
              <span class="label">{{ t('orderSuccess.status') }}:</span>
              <span class="status-badge" :class="orderData.status">
                {{ orderData.status }}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <!-- Thank You Message -->
      <motion.div
        v-if="showOrderDetails"
        class="thank-you-section"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 1, duration: 0.6 }"
      >
        <p class="thank-you-text">{{ t('orderSuccess.thankYou') }}</p>
        <div class="delivery-info">
          <p>{{ t('orderSuccess.estimatedDelivery') }}</p>
          <p>{{ t('orderSuccess.emailConfirmation') }}</p>
        </div>
      </motion.div>

      <!-- Action Buttons -->
      <AnimatePresence>
        <motion.div
          v-if="showButtons"
          class="action-buttons"
          :initial="{ y: 30, opacity: 0 }"
          :animate="{ y: 0, opacity: 1 }"
          :transition="{ duration: 0.6, ease: 'easeOut' }"
        >
          <BaseButton
            @click="continueShopping"
            variant="secondary"
            size="large"
            class="action-btn"
          >
            {{ t('orderSuccess.continueShopping') }}
          </BaseButton>

          <BaseButton
            @click="viewOrders"
            size="large"
            class="action-btn primary"
          >
            {{ t('orderSuccess.viewOrders') }}
          </BaseButton>
        </motion.div>
      </AnimatePresence>
    </div>

    <HelpModal :show="showHelpModal" @close="showHelpModal = false" />
    <LanguageModal :show="showLanguageModal" @close="showLanguageModal = false" />
  </div>
</template>

<style scoped>
.order-success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.confetti-piece {
  position: absolute;
  font-size: 24px;
  animation: float-random 8s infinite ease-in-out;
  opacity: 0.8;
}

.confetti-1 { top: 10%; left: 10%; animation-delay: 0s; }
.confetti-2 { top: 20%; right: 15%; animation-delay: 1s; }
.confetti-3 { top: 35%; left: 20%; animation-delay: 2s; }
.confetti-4 { top: 50%; right: 10%; animation-delay: 3s; }
.confetti-5 { top: 65%; left: 15%; animation-delay: 4s; }
.confetti-6 { top: 80%; right: 20%; animation-delay: 5s; }
.confetti-7 { top: 15%; right: 25%; animation-delay: 6s; }
.confetti-8 { top: 70%; left: 25%; animation-delay: 7s; }

@keyframes float-random {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0.8;
  }
  25% {
    transform: translateY(-20px) rotate(90deg) scale(1.2);
    opacity: 1;
  }
  50% {
    transform: translateY(-40px) rotate(180deg) scale(0.9);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-20px) rotate(270deg) scale(1.1);
    opacity: 1;
  }
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.success-animation {
  text-align: center;
  margin-bottom: 30px;
}

.success-icon {
  font-size: 80px;
  margin-bottom: 20px;
  display: inline-block;
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.success-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
}

.card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  width: 100%;
}

.card-header {
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.order-info {
  padding: 0 24px 24px 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.value {
  color: #1f2937;
  font-weight: 500;
  text-align: right;
}

.highlight {
  color: #10b981;
  font-weight: 700;
  font-size: 16px;
}

.price {
  color: #059669;
  font-weight: 700;
  font-size: 18px;
}

.balance {
  color: #7c3aed;
  font-weight: 700;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.thank-you-section {
  text-align: center;
  margin-bottom: 30px;
}

.thank-you-text {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.delivery-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.delivery-info p {
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
  flex-direction: column;
}

.action-btn {
  flex: 1;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
}

.primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
}

@media (min-width: 640px) {
  .action-buttons {
    flex-direction: row;
  }

  .success-icon {
    font-size: 100px;
  }

  .success-title {
    font-size: 32px;
  }
}
</style>