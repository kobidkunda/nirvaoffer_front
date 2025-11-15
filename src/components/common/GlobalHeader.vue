<!-- src/components/common/GlobalHeader.vue -->
<script setup>
import { ref, computed } from 'vue'
import { motion } from 'motion-v'
import { useLanguage } from '@/composables/useLanguage'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import biolasticLogo from '@/assets/logo/logo_biolastic.png'
import nirvaLogo from '@/assets/logo/nirva-logo-sq.png'

const emit = defineEmits(['openHelp', 'openLanguage'])

const { t } = useLanguage()
const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const cartItemCount = computed(() => cartStore.itemCount)
const showMenu = ref(false)

const goToCart = () => {
  router.push('/cart')
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const navigateTo = (route) => {
  showMenu.value = false
  router.push(route)
}

const logout = () => {
  showMenu.value = false
  authStore.logout()
  router.push('/')
}

const openLanguageAndCloseMenu = () => {
  showMenu.value = false
  emit('openLanguage')
}

const openHelpAndCloseMenu = () => {
  showMenu.value = false
  emit('openHelp')
}

const goToHome = () => {
  if (isLoggedIn.value) {
    router.push('/dashboard')
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="global-header">
    <!-- Animated Background Icons -->
    <div class="header-bg-animation">
      <div class="float-icon icon-1">💰</div>
      <div class="float-icon icon-2">🎁</div>
      <div class="float-icon icon-3">⭐</div>
      <div class="float-icon icon-4">💎</div>
      <div class="float-icon icon-5">🎉</div>
      <div class="float-icon icon-6">🏆</div>
      <div class="float-icon icon-7">💵</div>
      <div class="float-icon icon-8">✨</div>
      <div class="float-icon icon-9">🎊</div>
      <div class="float-icon icon-10">🪙</div>
    </div>

    <!-- Content -->
    <div class="header-content">
      <!-- Dual Logo Section -->
       <div class="logos" @click="goToHome" role="button" tabindex="0" @keydown.enter="goToHome">
         <motion.img
           :src="biolasticLogo"
           alt="Biolastic"
           class="logo biolastic-logo"
           :initial="{ opacity: 0, x: -20 }"
           :animate="{ opacity: 1, x: 0 }"
           :transition="{ duration: 0.6 }"
         />
         <span class="logo-divider">&</span>
         <motion.img
           :src="nirvaLogo"
           alt="Nirva"
           class="logo nirva-logo"
           :initial="{ opacity: 0, x: 20 }"
           :animate="{ opacity: 1, x: 0 }"
           :transition="{ duration: 0.6 }"
         />
       </div>

      <!-- Action Buttons -->
      <div class="actions">
        <!-- For Logged-in Users -->
        <template v-if="isLoggedIn">
          <!-- Cart Button -->
          <motion.button
            @click="goToCart"
            class="action-btn cart-btn"
            :whileHover="{ scale: 1.1 }"
            :whileTap="{ scale: 0.95 }"
            aria-label="Shopping Cart"
          >
            <span class="icon">🛒</span>
            <span class="label">{{ t('cart.cart') }}</span>
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </motion.button>

          <!-- Menu Button -->
          <motion.button
            @click="toggleMenu"
            class="action-btn menu-btn"
            :whileHover="{ scale: 1.1 }"
            :whileTap="{ scale: 0.95 }"
            aria-label="Menu"
          >
            <span class="icon">☰</span>
            <span class="label">{{ t('common.menu') }}</span>
          </motion.button>
        </template>

        <!-- For Non-logged-in Users -->
        <template v-else>
          <!-- Language Button -->
          <motion.button
            @click="emit('openLanguage')"
            class="action-btn language-btn"
            :whileHover="{ scale: 1.1, rotate: 5 }"
            :whileTap="{ scale: 0.95 }"
            aria-label="Change Language"
          >
            <span class="icon">🌐</span>
            <span class="label">{{ t('common.language') }}</span>
          </motion.button>

          <!-- Help Button (Animated) -->
          <motion.button
            @click="emit('openHelp')"
            class="action-btn help-btn"
            :animate="{
              scale: [1, 1.1, 1],
              rotate: [0, -10, 10, 0]
            }"
            :transition="{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }"
            :whileHover="{ scale: 1.15 }"
            :whileTap="{ scale: 0.95 }"
            aria-label="Help"
          >
            <span class="icon">❓</span>
            <span class="label">{{ t('common.help') }}</span>
            <span class="ping"></span>
          </motion.button>
        </template>
      </div>

      <!-- Slide-out Menu Portal -->
      <teleport to="body">
        <AnimatePresence>
          <motion.div
            v-if="showMenu"
            class="slide-menu-portal"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            @click.self="showMenu = false"
          >
            <motion.div
              class="menu-content-portal"
              :initial="{ x: '100%' }"
              :animate="{ x: 0 }"
              :exit="{ x: '100%' }"
              :transition="{ type: 'tween', duration: 0.3 }"
            >
              <div class="menu-header">
                <h3>{{ t('common.menu') }}</h3>
                <button @click="showMenu = false" class="close-btn">✕</button>
              </div>
              <div class="menu-items">
                <button @click="navigateTo('/profile')" class="menu-item">
                  <span class="icon">👤</span>
                  <span>{{ t('profile.title') }}</span>
                </button>
                <button @click="navigateTo('/redeem')" class="menu-item">
                  <span class="icon">🛍️</span>
                  <span>{{ t('menu.shopNow') }}</span>
                </button>
                <button @click="navigateTo('/orders')" class="menu-item">
                  <span class="icon">📦</span>
                  <span>{{ t('orders.myOrders') }}</span>
                </button>
                <button @click="navigateTo('/wallet')" class="menu-item">
                  <span class="icon">💰</span>
                  <span>{{ t('wallet.title') }}</span>
                </button>
                <button @click="navigateTo('/scan')" class="menu-item redeem-highlight">
                  <span class="icon">📱</span>
                  <span>{{ t('menu.redeemCodes') }}</span>
                </button>
                <button @click="openLanguageAndCloseMenu" class="menu-item">
                  <span class="icon">🌐</span>
                  <span>{{ t('common.language') }}</span>
                </button>
                <button @click="openHelpAndCloseMenu" class="menu-item">
                  <span class="icon">❓</span>
                  <span>{{ t('common.help') }}</span>
                </button>
                <button @click="logout" class="menu-item logout">
                  <span class="icon">🚪</span>
                  <span>{{ t('auth.logout') }}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </teleport>
    </div>
  </div>
</template>

<style scoped>
.global-header {
  position: relative;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1),
              0 2px 8px rgba(255, 215, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
}

/* Animated Background */
.header-bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.float-icon {
  position: absolute;
  font-size: 20px;
  opacity: 0.15;
  animation: float-header 8s infinite ease-in-out;
}

.icon-1 {
  top: -10px;
  left: 5%;
  animation-delay: 0s;
}

.icon-2 {
  top: 10px;
  left: 15%;
  animation-delay: 0.5s;
}

.icon-3 {
  top: -5px;
  left: 25%;
  animation-delay: 1s;
}

.icon-4 {
  top: 15px;
  left: 35%;
  animation-delay: 1.5s;
}

.icon-5 {
  top: 5px;
  right: 35%;
  animation-delay: 2s;
}

.icon-6 {
  top: -8px;
  right: 25%;
  animation-delay: 2.5s;
}

.icon-7 {
  top: 12px;
  right: 15%;
  animation-delay: 3s;
}

.icon-8 {
  top: -3px;
  right: 5%;
  animation-delay: 3.5s;
}

.icon-9 {
  top: 20px;
  left: 45%;
  animation-delay: 4s;
}

.icon-10 {
  top: 8px;
  right: 45%;
  animation-delay: 4.5s;
}

@keyframes float-header {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0.15;
  }
  25% {
    transform: translateY(-8px) translateX(5px) rotate(90deg);
    opacity: 0.25;
  }
  50% {
    transform: translateY(0) translateX(-5px) rotate(180deg);
    opacity: 0.15;
  }
  75% {
    transform: translateY(-5px) translateX(3px) rotate(270deg);
    opacity: 0.2;
  }
}

/* Content Layer */
.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logos {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logos:hover {
  opacity: 0.8;
}

.logo {
  height: 15px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

.biolastic-logo {
  filter: brightness(1.1) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

.nirva-logo {
  border-radius: 8px;
}

.logo-divider {
  font-size: 20px;
  font-weight: 700;
  color: #6b7280;
  margin: 0 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-btn .icon {
  font-size: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.action-btn .label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

/* Help Button Special Effects */
.help-btn {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.help-btn .icon {
  background: linear-gradient(135deg, #10b981, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.help-btn .label {
  color: #10b981;
}

.help-btn .ping {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.help-btn .ping::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #10b981;
  border-radius: 50%;
  opacity: 0.75;
  animation: ping-ripple 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes ping-ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

/* Language Button Effects */
.language-btn:hover {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%);
}

.language-btn .label {
  color: #8b5cf6;
}

/* Cart Button Effects */
.cart-btn {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%);
  position: relative;
}

.cart-btn .icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cart-btn .label {
  color: #f59e0b;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Menu Button */
.menu-btn {
  border-color: #6b7280;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

.menu-btn .icon {
  color: #374151;
}

.menu-btn .label {
  color: #374151;
}

/* Slide-out Menu Portal */
.slide-menu-portal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.menu-content-portal {
  width: 280px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10000;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.menu-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 5px;
}

.menu-items {
  flex: 1;
  padding: 10px 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 16px;
  color: #374151;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item .icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.menu-item.logout {
  color: #dc2626;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

.menu-item.logout:hover {
  background: #fef2f2;
}

.menu-item.redeem-highlight {
  background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%);
  border-left: 4px solid #f59e0b;
  font-weight: 600;
}

.menu-item.redeem-highlight:hover {
  background: linear-gradient(135deg, #fde68a 0%, #fef3c7 100%);
}

/* Hover Effects */
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 640px) {
  .global-header {
    padding: 12px 16px;
  }

  .logo {
    height: 15px;
  }

  .logo-divider {
    font-size: 18px;
  }

  .action-btn {
    padding: 6px 10px;
  }

  .action-btn .icon {
    font-size: 18px;
  }

  .action-btn .label {
    font-size: 10px;
  }

  .float-icon {
    font-size: 16px;
  }
}
</style>
