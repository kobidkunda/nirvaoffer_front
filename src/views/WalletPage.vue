<script setup>
import { ref, onMounted, computed } from 'vue'
import { motion } from 'motion-v'

// Import Common Components
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import FloatingActions from '@/components/common/FloatingActions.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'

// Import APIs
import { walletAPI } from '@/api/endpoints'

// --- Stores ---
const walletStore = useWalletStore()
const { t } = useLanguage()

// --- Page State ---
const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const loading = ref(true)
const walletData = ref(null)
const error = ref('')

// --- Computed Properties ---
const walletBalance = computed(() => walletData.value?.current_balance || 0)
const formattedBalance = computed(() => `₹${walletBalance.value.toFixed(2)}`)
const transactions = computed(() => walletData.value?.transactions?.data || [])

// --- Methods ---
const fetchWalletData = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await walletAPI.getWallet()
    walletData.value = response
  } catch (err) {
    console.error('Failed to fetch wallet data:', err)
    error.value = err.message || 'Failed to load wallet data'
  } finally {
    loading.value = false
  }
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

const getTransactionTypeColor = (type) => {
  const colors = {
    'earn': '#10b981',
    'redeem': '#f59e0b'
  }
  return colors[type] || '#6b7280'
}

// --- Lifecycle ---
onMounted(() => {
  fetchWalletData()
})
</script>

<template>
  <div class="wallet-page">
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
        {{ t('wallet.title') }}
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

      <!-- Current Balance Section -->
      <motion.div
        class="balance-section"
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ delay: 0.1 }"
      >
        <div class="balance-card">
          <div class="balance-header">
            <h2>{{ t('wallet.currentBalance') }}</h2>
          </div>
          <div class="balance-amount">
            <span class="amount">{{ formattedBalance }}</span>
          </div>
        </div>
      </motion.div>

      <!-- Transactions Section -->
      <motion.div
        class="transactions-section"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.2 }"
      >
        <h2 class="section-title">{{ t('wallet.transactionHistory') }}</h2>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>{{ t('wallet.loading') }}</p>
        </div>

        <div v-else-if="transactions.length === 0" class="empty-transactions">
          <motion.div
            class="empty-content"
            :initial="{ opacity: 0, scale: 0.9 }"
            :animate="{ opacity: 1, scale: 1 }"
            :transition="{ delay: 0.3 }"
          >
            <div class="icon">💰</div>
            <h3>{{ t('wallet.noTransactions') }}</h3>
            <p>{{ t('wallet.noTransactionsDesc') }}</p>
          </motion.div>
        </div>

        <div v-else class="transactions-list">
          <motion.div
            v-for="(transaction, index) in transactions"
            :key="transaction.id"
            class="transaction-card card"
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.3 + index * 0.05 }"
          >
            <div class="transaction-header">
              <div class="transaction-info">
                <h3 class="transaction-description">{{ transaction.description }}</h3>
                <p class="transaction-date">{{ formatDate(transaction.date) }}</p>
              </div>
              <div class="transaction-amount">
                <span
                  class="amount"
                  :class="{ 'credit': transaction.type === 'earn', 'debit': transaction.type === 'redeem' }"
                >
                  ₹{{ transaction.amount }}
                </span>
                <span
                  class="transaction-type"
                  :style="{ backgroundColor: getTransactionTypeColor(transaction.type) }"
                >
                  {{ transaction.type }}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
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
.wallet-page {
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

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 30px;
  text-align: center;
}

.balance-section {
  margin-bottom: 40px;
}

.balance-card {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  color: white;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.balance-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px 0;
  opacity: 0.9;
}

.balance-amount .amount {
  font-size: 48px;
  font-weight: 800;
  display: block;
  margin: 0;
}

.transactions-section {
  flex: 1;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.transaction-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.transaction-info {
  flex: 1;
}

.transaction-description {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.transaction-date {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.transaction-amount {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.amount {
  font-size: 18px;
  font-weight: 700;
}

.amount.credit {
  color: #10b981;
}

.amount.debit {
  color: #ef4444;
}

.transaction-type {
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.transaction-reference {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.transaction-reference p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  font-family: monospace;
}

.empty-transactions {
  text-align: center;
  padding: 60px 20px;
}

.empty-content {
  max-width: 300px;
  margin: 0 auto;
}

.empty-content .icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.empty-content p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.loading {
  text-align: center;
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