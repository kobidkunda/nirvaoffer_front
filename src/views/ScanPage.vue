<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useAuthStore } from '@/stores/auth'
import { useLanguage } from '@/composables/useLanguage'
import { rewardAPI } from '@/api/endpoints'
import { motion } from 'motion-v'
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import ScratchCard from '@/components/reward/ScratchCard.vue'
import OTPModal from '@/components/common/OTPModal.vue'

// Import new scan components
import PrizeBadge from '@/components/scan/PrizeBadge.vue'
import GiftCarousel from '@/components/scan/GiftCarousel.vue'
import ExcitementChips from '@/components/scan/ExcitementChips.vue'
import ScanForm from '@/components/scan/ScanForm.vue'
import WinnerShowcase from '@/components/scan/WinnerShowcase.vue'
import QRScannerModal from '@/components/scan/QRScannerModal.vue'
import SliderComponent from '@/components/common/SliderComponent.vue'

const router = useRouter()
const walletStore = useWalletStore()
const authStore = useAuthStore()
const { t } = useLanguage()

const step = ref('scan')
const scannedCode = ref('')
const loading = ref(false)
const error = ref('') // For scan validation
const otpError = ref('')
const showOTPModal = ref(false)
const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const loginMode = ref(false)
const honeypot = ref('')
const gifts = ref([])

// *** FIXED: Refs for QR Scanner ***
const showScanner = ref(false)

// *** FIX: Add local ref to keep reward visible during navigation ***
const localPendingReward = ref(null)

// Fetch gift slider data
const fetchGifts = async () => {
  try {
    const response = await rewardAPI.getGiftSlider()
    gifts.value = response.gifts
  } catch (err) {
    console.error('Failed to fetch gift slider:', err)
  }
}

onMounted(() => {
  console.log('ScanPage mounted')
  fetchGifts()
})

// *** FIXED: Function to open scanner ***
const openScanner = () => {
  error.value = ''
  showScanner.value = true
}

// *** FIXED: Function to close scanner ***
const closeScanner = () => {
  showScanner.value = false
}

// *** FIXED: Handle successful QR detection ***
const onDetect = (detectedCodes) => {
  if (detectedCodes && detectedCodes.length > 0) {
    const decodedString = detectedCodes[0].rawValue
    console.log('QR detected:', decodedString)
    closeScanner()

    if (decodedString && /^[A-Z0-9]{12}$/i.test(decodedString)) {
      scannedCode.value = decodedString.toUpperCase()
      validateCode() // Auto-submit on valid scan
    } else if (decodedString) {
      // Scanned something, but it's not the right format
      scannedCode.value = decodedString // Show it to the user
      error.value = t('scan.invalid') // Show invalid error
    }
  }
}

const validateCode = async () => {
  error.value = ''
  if (honeypot.value) {
    error.value = 'Invalid request'
    return
  }
  if (!/^[A-Z0-9]{12}$/i.test(scannedCode.value)) {
    error.value = t('scan.invalid')
    return
  }
  loading.value = true
try {
    const response = await rewardAPI.validateCode(scannedCode.value)

    // *** FIX: Set both store and local reward ***
    walletStore.setPendingReward(response)
    localPendingReward.value = response

    step.value = 'scratch'
  } catch (err) {
    // *** START OF FIX ***
    if (err.response) {
      // This handles all errors where the server sent a response (4xx, 5xx)
      if (err.response.status === 404) {
        // SPECIFIC FIX: 404 is "Code is invalid", as requested.
        error.value = t('scan.invalid')
      } else {
        // SPECIFIC FIX: For other errors (like 409 "Already Used" or 400 "Bad Request"),
        // show the message returned from the API, as requested.
        error.value = err.response.data.message || err.message || t('errors.unknown')
      }
    } else {
      // This handles network errors where no response was received
      error.value = err.message || t('errors.unknown')
    }
    // *** END OF FIX ***
  } finally {
    loading.value = false
  }

}

const handleClaim = () => {
  loginMode.value = false
  error.value = '' // Clear main page error before opening modal
  if (authStore.isLoggedIn) {
    claimReward()
  } else {
    showOTPModal.value = true
  }
}

const handleLoginClick = () => {
  if (authStore.isLoggedIn) {
    // If user is logged in, navigate to redeem page
    router.push('/redeem')
  } else {
    // If not logged in, show login modal
    loginMode.value = true
    error.value = '' // Clear main page error before opening modal
    showOTPModal.value = true
  }
}

const handleOTPSuccess = async ({ phoneNumber, otpCode }) => {
  loading.value = true
  otpError.value = ''
  error.value = ''
  try {
    const result = await authStore.loginWithOTP(phoneNumber, otpCode)
    if (result.success) {
      showOTPModal.value = false
      otpError.value = ''
      // *** FIX: Check localPendingReward ***
      if (!loginMode.value && localPendingReward.value) {
        await claimReward()
      } else {
        await router.push('/dashboard')
      }
    } else {
      otpError.value = result.error || 'Login failed'
    }
  } catch (err) {
    otpError.value = err.message || 'Verification failed'
  } finally {
    loading.value = false
  }
}

const claimReward = async () => {
  // *** FIX: Check localPendingReward ***
  if (!localPendingReward.value) return
  loading.value = true
  try {
    // *** FIX: Use token from local reward ***
    const response = await rewardAPI.claimReward(localPendingReward.value.code_token)
    if (response.new_wallet_balance !== undefined) {
      walletStore.syncWallet({
        balance: response.new_wallet_balance,
        // *** FIX: Use tickets from local reward as fallback ***
        lucky_draw_tickets: response.draw_tickets_earned || localPendingReward.value.tickets
      })
    }
    await router.push('/dashboard')
  } catch (err) {
    error.value = err.message || t('errors.unknown')
  } finally {
    loading.value = false
  }
}

// Help methods
const callHelp = () => {
  window.location.href = 'tel:+918927902193'
}

const whatsappHelp = () => {
  const message = 'Hello, I need help with the Nirva Loyalty Program.'
  const whatsappUrl = `https://wa.me/918927902193?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}
</script>

<template>
  <div class="scan-page">
    <div class="animated-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>

      <div class="float-item money-1">💵</div>
      <div class="float-item money-2">💰</div>
      <div class="float-item money-3">💸</div>
      <div class="float-item gift-1">🎁</div>
      <div class="float-item gift-2">🎉</div>
      <div class="float-item gift-3">🏆</div>
      <div class="float-item coin-1">🪙</div>
      <div class="float-item coin-2">💎</div>
      <div class="float-item star-1">⭐</div>
      <div class="float-item star-2">✨</div>
      <div class="float-item trophy-1">🥇</div>
      <div class="float-item prize-1">🎊</div>

      <div class="bounce-item item-1">💵</div>
      <div class="bounce-item item-2">🎁</div>
      <div class="bounce-item item-3">💰</div>
      <div class="bounce-item item-4">🏅</div>
      <div class="bounce-item item-5">💎</div>
      <div class="bounce-item item-6">🎟️</div>
    </div>

    <GlobalHeader
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />

    <div class="page-content">
      <div v-if="step === 'scan'" class="scan-container">
        <PrizeBadge />

        <GiftCarousel :gifts="gifts" />

        <ExcitementChips />

        <ScanForm
          :scanned-code="scannedCode"
          :error="error"
          :loading="loading"
          :login-button-text="authStore.isLoggedIn ? 'Shop Now' : ''"
          @update:scanned-code="scannedCode = $event"
          @scan-qr="openScanner"
          @validate-code="validateCode"
          @login-click="handleLoginClick"
        />

        <WinnerShowcase />
      </div>

      <div v-if="step === 'scratch'" class="scratch-container">
        <ScratchCard
           v-if="localPendingReward"
           :cashback-amount="localPendingReward.cashback_amount"
           :tickets="localPendingReward.tickets"
           @revealed="() => {}"
           @claim="handleClaim"
         />
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
    </div>

    <OTPModal
      :show="showOTPModal"
      :error="otpError"
      @close="showOTPModal = false; otpError = ''"
      @success="handleOTPSuccess"
    />
    <HelpModal :show="showHelpModal" @close="showHelpModal = false" />
    <LanguageModal :show="showLanguageModal" @close="showLanguageModal = false" />

    <div v-if="loading && !showOTPModal" class="loading-overlay">
      <div class="spinner-ring"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <QRScannerModal
      :show="showScanner"
      @detect="onDetect"
      @close="closeScanner"
    />

    <!-- Help Section -->
    <div class="help-section">
      <div class="help-buttons">
        <button @click="callHelp" class="help-btn call-btn">
          📞 Call for Help
        </button>
        <button @click="whatsappHelp" class="help-btn whatsapp-btn">
          💬 WhatsApp Support
        </button>
      </div>
    </div>

    <!-- Slider Component -->
    <div class="slider-section">
      <SliderComponent />
    </div>
  </div>
</template>

<style scoped>
.scan-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Animated Background */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float-orb 20s infinite ease-in-out;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #ffd700, transparent);
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ff6b6b, transparent);
  bottom: -150px;
  right: -150px;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, #4ecdc4, transparent);
  top: 40%;
  right: 10%;
}

@keyframes float-orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Floating Items */
.float-item {
  position: absolute;
  font-size: 32px;
  animation: float-up 8s infinite ease-in-out;
  opacity: 0.8;
}

.money-1 { top: 10%; left: 5%; animation-delay: 0s; }
.money-2 { top: 30%; right: 10%; animation-delay: 1s; }
.money-3 { bottom: 25%; left: 8%; animation-delay: 2s; }
.gift-1 { top: 50%; left: 15%; animation-delay: 3s; }
.gift-2 { bottom: 15%; right: 20%; animation-delay: 4s; }
.gift-3 { top: 20%; right: 25%; animation-delay: 5s; }
.coin-1 { top: 70%; left: 25%; animation-delay: 1.5s; }
.coin-2 { top: 40%; right: 5%; animation-delay: 2.5s; }
.star-1 { bottom: 40%; left: 12%; animation-delay: 3.5s; }
.star-2 { top: 60%; right: 15%; animation-delay: 4.5s; }
.trophy-1 { bottom: 30%; right: 8%; animation-delay: 5.5s; }
.prize-1 { top: 80%; left: 30%; animation-delay: 6s; }

@keyframes float-up {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
  50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
}

/* Bouncing Items */
.bounce-item {
  position: absolute;
  font-size: 28px;
  animation: bounce-around 6s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.item-1 { top: 15%; left: 20%; animation-delay: 0s; }
.item-2 { top: 35%; right: 18%; animation-delay: 1s; }
.item-3 { bottom: 20%; left: 22%; animation-delay: 2s; }
.item-4 { top: 55%; right: 12%; animation-delay: 3s; }
.item-5 { bottom: 45%; left: 10%; animation-delay: 4s; }
.item-6 { top: 25%; left: 35%; animation-delay: 5s; }

@keyframes bounce-around {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -20px) scale(1.2); }
  50% { transform: translate(-15px, 15px) scale(0.9); }
  75% { transform: translate(15px, -10px) scale(1.1); }
}

.page-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.scan-container {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.scratch-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

/* Loading & Error */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner-ring {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.error-text {
  color: #fee2e2;
  background: rgba(239, 68, 68, 0.25);
  padding: 12px;
  border-radius: 8px;
  margin-top: 16px;
  font-weight: 600;
}

/* Help Section */
.help-section {
  padding: 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.help-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.help-btn {
  padding: 12px 24px;
  border-radius: 25px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
  justify-content: center;
}

.call-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.call-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.whatsapp-btn {
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}

.whatsapp-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
}

/* Slider Section */
.slider-section {
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.05);
}
</style>