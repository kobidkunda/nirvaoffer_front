<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import { useAuthStore } from '@/stores/auth'
import { useLanguage } from '@/composables/useLanguage'
import { rewardAPI } from '@/api/endpoints'
import { motion } from 'motion-v'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import ScratchCard from '@/components/reward/ScratchCard.vue'
import OTPModal from '@/components/common/OTPModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import giftsData from '@/data/gifts.json'

// *** NEW: Import QR Scanner ***
import { QrcodeStream } from 'vue-qrcode-reader'
// *** FIX: REMOVED the incorrect 'style.css' import line ***


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
const gifts = ref(giftsData.gifts)

// *** NEW: Refs for QR Scanner ***
const showScanner = ref(false)
const scannerError = ref('')

// *** FIX: Add local ref to keep reward visible during navigation ***
const localPendingReward = ref(null)


// Swiper modules
const modules = [Autoplay, EffectCoverflow]


onMounted(() => {
  console.log('ScanPage mounted')
})

// *** NEW: Function to open scanner ***
const openScanner = () => {
  error.value = ''
  scannerError.value = ''
  showScanner.value = true
}

// *** NEW: Function to close scanner ***
const closeScanner = () => {
  showScanner.value = false
}

// *** NEW: Handle successful QR scan ***
const onDecode = (decodedString) => {
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

// *** NEW: Handle camera initialization and permissions ***
const onScannerInit = async (promise) => {
  scannerError.value = ''
  try {
    await promise
  } catch (err) {
    console.error(err)
    if (err.name === 'NotAllowedError') {
      scannerError.value = t('errors.cameraPermission')
    } else if (err.name === 'NotFoundError') {
      scannerError.value = t('errors.cameraNotFound')
    } else {
      scannerError.value = t('errors.cameraError')
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
    if (err.response && err.response.status === 404) {
      error.value = t('scan.invalid') // Use specific error
    } else {
     error.value = err.message || t('errors.unknown')
    }
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
  loginMode.value = true
  error.value = '' // Clear main page error before opening modal
  showOTPModal.value = true
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
    const response = await rewardAPI.claimReward(localPendingReward.value.codeToken)
    if (response.new_wallet_balance !== undefined) {
      walletStore.syncWallet({
        balance: response.new_wallet_balance,
        // *** FIX: Use tickets from local reward as fallback ***
        lucky_draw_tickets: response.lucky_draw_tickets || localPendingReward.value.tickets
      })
    }
    await router.push('/dashboard')
  } catch (err) {
    error.value = err.message || t('errors.unknown')
  } finally {
    loading.value = false
  }
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
        <motion.div 
          class="prize-badge"
          :animate="{ 
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          }"
          :transition="{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }"
        >
          <div class="badge-shine"></div>
          <span class="badge-text">🎊 WIN AMAZING PRIZES! 🎊</span>
        </motion.div>


        <motion.div 
          class="carousel-section"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6 }"
        >
          <Swiper
            :modules="modules"
            :slides-per-view="4"
            :space-between="15"
            :loop="true"
            :autoplay="{
              delay: 2000,
              disableOnInteraction: false,
            }"
            :speed="1000"
            :breakpoints="{
              320: { slidesPerView: 2, spaceBetween: 10 },
              480: { slidesPerView: 3, spaceBetween: 12 },
              640: { slidesPerView: 4, spaceBetween: 15 }
            }"
            class="gifts-swiper"
          >
            <SwiperSlide v-for="gift in gifts" :key="gift.id">
              <motion.div 
                class="gift-card"
                :whileHover="{ scale: 1.05, y: -5 }"
              >
                <img :src="gift.image" :alt="gift.name" class="gift-image" />
                <div class="gift-name">{{ gift.name }}</div>
              </motion.div>
            </SwiperSlide>
          </Swiper>
        </motion.div>


        <motion.div 
          class="excitement-chips"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ delay: 0.3 }"
        >
          <motion.div 
            class="chip"
            :animate="{ scale: [1, 1.05, 1] }"
            :transition="{ duration: 1.5, repeat: Infinity, delay: 0 }"
          >
            💵 Instant Cash
          </motion.div>
          <motion.div 
            class="chip"
            :animate="{ scale: [1, 1.05, 1] }"
            :transition="{ duration: 1.5, repeat: Infinity, delay: 0.3 }"
          >
            🎁 Free Gifts
          </motion.div>
          <motion.div 
            class="chip"
            :animate="{ scale: [1, 1.05, 1] }"
            :transition="{ duration: 1.5, repeat: Infinity, delay: 0.6 }"
          >
            🏆 Big Prizes
          </motion.div>
        </motion.div>
        
        <motion.div 
          class="form-container"
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ duration: 0.6, delay: 0.4 }"
        >
          <div class="form-glow"></div>
          
          <motion.button
            class="scan-qr-button"
            @click="openScanner"
            :whileHover="{ scale: 1.02, backgroundColor: '#f0fdf4' }"
            :whileTap="{ scale: 0.98 }"
          >
            <span class="scan-icon">📷</span>
            <strong>{{ t('scan.scanButton') }}</strong>
          </motion.button>
          
          <div class="divider or-divider">
            <span>{{ t('scan.orEnterCode') }}</span>
          </div>
          
          <input v-model="honeypot" type="text" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off" />
          
          <div class="input-wrapper">
            <BaseInput
              v-model="scannedCode"
              type="text"
              :placeholder="t('scan.placeholder')"
              maxlength="12"
              :error="error"
              style="text-transform: uppercase"
            />
          </div>
          
          <motion.div
            :whileHover="{ scale: 1.02 }"
            :whileTap="{ scale: 0.98 }"
          >
            <BaseButton 
              @click="validateCode"
              :loading="loading"
              :disabled="scannedCode.length !== 12"
              class="check-button"
            >
              <span v-if="!loading" class="button-content">
                <span class="button-icon">🎯</span>
                {{ t('scan.submit') }}
                <span class="button-shine"></span>
              </span>
            </BaseButton>
          </motion.div>
          
          <div class="divider">
            <span>{{ t('scan.loginPrompt') }}</span>
          </div>
          
          <motion.button 
            class="login-link"
            @click="handleLoginClick"
            :whileHover="{ scale: 1.02, backgroundColor: '#f0fdf4' }"
            :whileTap="{ scale: 0.98 }"
          >
            <span class="login-icon">👤</span>
            <strong>{{ t('scan.loginButton') }}</strong>
          </motion.button>
        </motion.div>


        <motion.div 
          class="winner-showcase"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.6 }"
        >
          <div class="winner-badge">🏅 Recent Winners</div>
          <div class="winners-scroll">
            <motion.div 
              class="winner-item"
              :animate="{ x: [-300, 0] }"
              :transition="{ duration: 20, repeat: Infinity, ease: 'linear' }"
            >
              <span>Raj K. won <strong>₹500</strong> 💰</span>
              <span>Priya S. won <strong>Mixer</strong> 🥤</span>
              <span>Amit P. won <strong>₹1000</strong> 💵</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <div v-if="step === 'scratch'" class="scratch-container">
        <ScratchCard
          v-if="localPendingReward"
          :cashback-amount="localPendingReward.cashbackAmount"
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

    <div v-if="showScanner" class="scanner-modal">
      <QrcodeStream @decode="onDecode" @init="onScannerInit" class="scanner-video" />
      <button @click="closeScanner" class="close-scanner-btn">✕</button>
      <div class="scanner-overlay-content">
        <div class="scanner-box"></div>
        <p>{{ t('scan.scannerPrompt') }}</p>
        <div v-if="scannerError" class="scanner-error-display">
          {{ scannerError }}
        </div>
      </div>
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


/* Prize Badge */
.prize-badge {
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.6),
              inset 0 2px 4px rgba(255, 255, 255, 0.5);
  border: 3px solid #fff;
  overflow: hidden;
}


.badge-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: shine 3s infinite;
}


@keyframes shine {
  to { left: 200%; }
}


/* Carousel Section */
.carousel-section {
  margin-bottom: 24px;
  padding: 0 10px;
}


.gifts-swiper {
  padding: 10px 0;
}


.gift-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 215, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s;
}


.gift-image {
  width: 90px;
  height: 90px;
  object-fit: contain;
  margin: 0 auto 6px auto;
  display: block;
}


.gift-name {
  font-size: 11px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.gift-points {
  font-size: 10px;
  font-weight: 700;
  color: #10b981;
}


/* Excitement Chips */
.excitement-chips {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}


.chip {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.4);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}


/* Form Container */
.form-container {
  position: relative;
  background: rgba(255, 255, 255, 0.98);
  padding: 32px 28px;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 40px rgba(255, 215, 0, 0.3);
  border: 3px solid rgba(255, 215, 0, 0.5);
}


.form-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ffd700, #ff6b6b, #4ecdc4, #ffd700);
  background-size: 400% 400%;
  border-radius: 24px;
  z-index: -1;
  opacity: 0.6;
  animation: glow-rotate 4s linear infinite;
  filter: blur(8px);
}


@keyframes glow-rotate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}


/* *** NEW: Scan QR Button *** */
.scan-qr-button {
  width: 100%;
  padding: 14px;
  background: white;
  border: 3px solid #10b981;
  border-radius: 12px;
  color: #10b981;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.scan-icon {
  font-size: 20px;
}

/* *** NEW: "Or" Divider *** */
.divider.or-divider {
  margin: 20px 0;
}


.input-wrapper {
  margin-bottom: 18px;
}


/* Check Button */
.check-button {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  font-size: 18px;
  font-weight: 800;
  padding: 16px 32px;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}


.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}


.button-icon {
  font-size: 22px;
  animation: bounce-icon 1s infinite;
}


@keyframes bounce-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}


.button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: button-shine 2s infinite;
}


@keyframes button-shine {
  to { left: 200%; }
}


/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}


.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
}


.divider span {
  position: relative;
  background: white;
  padding: 0 14px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}


/* Login Link */
.login-link {
  width: 100%;
  padding: 14px;
  background: white;
  border: 3px solid #10b981;
  border-radius: 12px;
  color: #10b981;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}


.login-icon {
  font-size: 18px;
}


/* Winner Showcase */
.winner-showcase {
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}


.winner-badge {
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}


.winners-scroll {
  overflow: hidden;
  white-space: nowrap;
}


.winner-item {
  display: inline-flex;
  gap: 24px;
}


.winner-item span {
  display: inline-block;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 14px;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 8px;
}


.winner-item strong {
  color: #ffd700;
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

/* *** NEW: QR Scanner Modal Styles *** */
.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 2000;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.close-scanner-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2002;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.scanner-overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2001;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-box {
  width: 250px;
  height: 250px;
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.5);
}

.scanner-overlay-content p {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
}

.scanner-error-display {
  position: absolute;
  bottom: 80px;
  left: 20px;
  right: 20px;
  background: #ef4444;
  color: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  z-index: 2003;
  pointer-events: all;
}


/* Responsive */
@media (max-width: 640px) {
  .prize-badge { font-size: 14px; padding: 8px 16px; }
  .excitement-chips { gap: 8px; }
  .chip { font-size: 11px; padding: 5px 12px; }
  .form-container { padding: 28px 24px; }
  .check-button { font-size: 16px; padding: 14px 28px; }
  
  .gift-image {
    width: 100px;
    height: 60px;
  }
  
  .gift-name { font-size: 10px; }
}
</style>