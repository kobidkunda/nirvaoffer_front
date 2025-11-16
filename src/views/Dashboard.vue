<!-- src/views/Dashboard.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLanguage } from '@/composables/useLanguage'
import { profileAPI } from '@/api/endpoints'
import { motion, AnimatePresence } from 'motion-v'
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const { t } = useLanguage()

const loading = ref(false)
const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const showNameModal = ref(false)
const nameInput = ref('')
const updatingName = ref(false)
const nameError = ref('')

const userName = computed(() => authStore.user?.name || 'Friend')

onMounted(async () => {
  loading.value = true
  try {
    await authStore.fetchProfile()

    if (authStore.user?.wallet_balance !== undefined) {
      walletStore.syncWallet({
        balance: authStore.user.wallet_balance,
        lucky_draw_tickets: authStore.user.lucky_draw_tickets || 0
      })
    }

    // Check if name is missing and show modal
    if (!authStore.user?.name || authStore.user.name.trim() === '') {
      showNameModal.value = true
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  } finally {
    loading.value = false
  }
})

const scanAnother = () => router.push('/')
const goToRedeem = () => router.push('/redeem')
const goToProfile = () => router.push('/profile')

const updateName = async () => {
  if (!nameInput.value.trim()) {
    nameError.value = 'Please enter your name'
    return
  }

  updatingName.value = true
  nameError.value = ''

  try {
    await profileAPI.updateProfile({
      name: nameInput.value.trim()
    })

    // Refresh profile to get updated data
    await authStore.fetchProfile()
    showNameModal.value = false
    nameInput.value = ''
  } catch (error) {
    nameError.value = error.response?.data?.message || error.message || 'Failed to update name'
  } finally {
    updatingName.value = false
  }
}
</script>

<template>
  <div class="dashboard">
    <!-- Global Header -->
    <GlobalHeader 
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>
    
    <!-- Main Content -->
    <div v-else class="content">
      <!-- Welcome Section -->
      <motion.div 
        class="welcome-card"
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6 }"
      >
        <div class="welcome-text">
          <span class="greeting">{{ t('dashboard.welcome') }}</span>
          <h1>{{ userName }}! 👋</h1>
        </div>
        <button class="profile-btn" @click="goToProfile">
          <span class="icon">👤</span>
        </button>
      </motion.div>

      <!-- Wallet Card -->
      <motion.div 
        class="card wallet-card"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.1 }"
        :whileHover="{ y: -4 }"
      >
        <div class="card-icon">💰</div>
        <h2 class="card-title">{{ t('dashboard.wallet') }}</h2>
        <motion.div 
          class="balance"
          :animate="{ scale: [1, 1.05, 1] }"
          :transition="{ duration: 0.5 }"
        >
          {{ walletStore.formattedBalance }}
        </motion.div>
        <BaseButton 
          @click="goToRedeem"
          variant="primary"
          :disabled="!walletStore.canRedeem"
        >
          {{ t('dashboard.redeemGifts') }}
        </BaseButton>
      </motion.div>
      
      <!-- Lucky Draw Card -->
      <motion.div 
        class="card ticket-card"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.2 }"
        :whileHover="{ y: -4 }"
      >
        <div class="card-icon">🎟️</div>
        <h2 class="card-title">{{ t('dashboard.tickets') }}</h2>
        <div class="ticket-count">{{ walletStore.ticketCount }}</div>
        <BaseButton 
          @click="() => {}"
          variant="outline"
        >
          {{ t('dashboard.seePrizes') }}
        </BaseButton>
      </motion.div>
      
      <!-- Scan Another -->
      <motion.div 
        class="scan-section"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 0.6, delay: 0.3 }"
      >
        <BaseButton 
          @click="scanAnother"
          variant="secondary"
          size="large"
        >
          🔍 {{ t('dashboard.scanAnother') }}
        </BaseButton>
      </motion.div>
    </div>

    <!-- Modals -->
    <HelpModal
      :show="showHelpModal"
      @close="showHelpModal = false"
    />

    <LanguageModal
      :show="showLanguageModal"
      @close="showLanguageModal = false"
    />

    <!-- Name Required Modal -->
    <AnimatePresence>
      <motion.div
        v-if="showNameModal"
        class="modal-overlay"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      >
        <motion.div
          class="modal-content name-modal"
          :initial="{ scale: 0.9, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :exit="{ scale: 0.9, opacity: 0 }"
        >
          <div class="modal-header">
            <h2>{{ t('auth.enterName') }}</h2>
            <p>Please enter your name to continue using the app.</p>
          </div>

          <form @submit.prevent="updateName" class="name-form">
            <BaseInput
              v-model="nameInput"
              :label="t('auth.nameLabel')"
              :placeholder="t('auth.namePlaceholder')"
              required
              autofocus
            />

            <div v-if="nameError" class="error-message">
              {{ nameError }}
            </div>

            <BaseButton
              type="submit"
              :loading="updatingName"
              size="large"
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
.dashboard {
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
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.welcome-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.greeting {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.welcome-card h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.profile-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.profile-btn:hover {
  border-color: #10b981;
  transform: scale(1.05);
}

.icon {
  font-size: 24px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
}

.balance {
  font-size: 48px;
  font-weight: 800;
  color: #10b981;
  margin-bottom: 24px;
}

.ticket-count {
  font-size: 48px;
  font-weight: 800;
  color: #8b5cf6;
  margin-bottom: 24px;
}

.scan-section {
  margin-top: 32px;
}

/* Name Modal Styles */
.name-modal {
  max-width: 400px;
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.modal-header p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.name-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.name-form .base-button {
  margin-top: 8px;
}

.error-message {
  background: #fee2e2;
  color: #b91c1c;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

/* Modal Styles */
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
}
</style>
