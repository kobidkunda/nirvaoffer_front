<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { gsap } from 'gsap'
import { motion } from 'motion-v'
// *** NEW: Import translations ***
import { useLanguage } from '@/composables/useLanguage'

// *** NEW: Initialize translations ***
const { t } = useLanguage()

const props = defineProps({
  cashbackAmount: {
    type: Number,
    required: true
  },
  tickets: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['revealed', 'claim'])

const canvasRef = ref(null)
const containerRef = ref(null)
const isScratching = ref(false)
const scratchProgress = ref(0)
const isRevealed = ref(false)
const showConfetti = ref(false)

let context = null
const scratchThreshold = 50 // 50% scratched to auto-reveal

onMounted(() => {
  nextTick(() => {
    initCanvas()
    animateEntry()
  })
})

const animateEntry = () => {
  gsap.from(containerRef.value, {
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    ease: 'back.out(1.7)'
  })
}

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  context = canvas.getContext('2d')
  
  // Set canvas size for retina displays
  canvas.width = canvas.offsetWidth * 2
  canvas.height = canvas.offsetHeight * 2
  context.scale(2, 2)
  
  // Draw scratch cover (luxurious gradient)
  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#d4af37') // Gold
  gradient.addColorStop(1, '#b8860b') // Darker gold
  
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)
  
  // Add sparkling "Scratch Here" text with shadow
  context.fillStyle = '#fffacd'
  context.font = 'bold 28px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.shadowColor = 'rgba(255, 255, 255, 0.9)'
  context.shadowBlur = 10
  
  // *** FIX: Use translation for canvas text ***
  context.fillText(t('scratch.scratchHere'), canvas.width / 4, canvas.height * 0.25)

  // Register events
  canvas.addEventListener('mousedown', startScratch)
  canvas.addEventListener('mousemove', scratch)
  canvas.addEventListener('mouseup', stopScratch)
  canvas.addEventListener('mouseleave', stopScratch)
  canvas.addEventListener('touchstart', startScratch, { passive: false })
  canvas.addEventListener('touchmove', scratch, { passive: false })
  canvas.addEventListener('touchend', stopScratch)
}

const startScratch = (e) => {
  isScratching.value = true
  e.preventDefault()
}

const stopScratch = () => {
  isScratching.value = false
}

const scratch = (e) => {
  if (!isScratching.value) return
  e.preventDefault()
  
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  
  let x, y
  if (e.type.includes('touch')) {
    x = e.touches[0].clientX - rect.left
    y = e.touches[0].clientY - rect.top
  } else {
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  }
  
  context.globalCompositeOperation = 'destination-out'
  context.beginPath()
  context.arc(x, y, 30, 0, Math.PI * 2)
  context.fill()
  
  calculateProgress()
}

const calculateProgress = () => {
  const canvas = canvasRef.value
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data
  let transparent = 0
  
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 128) transparent++
  }
  
  scratchProgress.value = Math.round((transparent / (pixels.length / 4)) * 100)
  
  if (scratchProgress.value >= scratchThreshold && !isRevealed.value) {
    revealReward()
  }
}

const revealReward = () => {
  isRevealed.value = true
  showConfetti.value = true
  
  gsap.to(canvasRef.value, {
    opacity: 0,
    duration: 0.4,
    onComplete: () => {
      emit('revealed')
      animateReward()
    }
  })
}

const animateReward = () => {
  gsap.from('.reward-content', {
    scale: 0,
    opacity: 0,
    duration: 0.6,
    ease: 'elastic.out(1, 0.5)'
  })
}

const handleClaim = () => {
  emit('claim')
}
</script>

<template>
  <div ref="containerRef" class="scratch-card">
    <div class="card-inner">
      <motion.div 
        v-if="showConfetti"
        class="confetti-container"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      >
        <motion.div
          v-for="n in 30"
          :key="`confetti-${n}`"
          class="confetti-icon"
          :animate="{
            y: [0, -250],
            x: [0, (n % 2 === 0 ? -100 : 100)],
            rotate: [0, 720]
          }"
          :transition="{
            duration: 4 + n * 0.1,
            repeat: Infinity,
            ease: 'linear',
            delay: n * 0.1
          }"
          :style="{ fontSize: `${14 + (n % 5) * 6}px`, opacity: 0.8 }"
        >
          🎉
        </motion.div>
        <motion.div
          v-for="n in 20"
          :key="`coin-${n}`"
          class="confetti-icon"
          :animate="{
            y: [0, -200],
            x: [0, (n % 2 === 0 ? 80 : -80)],
            rotate: [0, -720]
          }"
          :transition="{
            duration: 5 + n * 0.15,
            repeat: Infinity,
            ease: 'linear',
            delay: n * 0.08
          }"
          :style="{ fontSize: `${12 + (n % 4) * 5}px`, opacity: 0.7 }"
        >
          🪙
        </motion.div>
      </motion.div>

      <div class="reward-content">
        <div class="reward-icon">🎊</div>
        <h2 class="reward-title">{{ t('scratch.title') }}</h2>
        <div class="reward-amount">
          <span class="currency">₹</span>{{ cashbackAmount }}
          <span class="label">{{ t('scratch.cashback') }}</span>
        </div>
        <div class="reward-tickets">
          <div class="ticket-count">
            {{ tickets === 1 ? t('scratch.ticketSingle') : t('scratch.ticketPlural', { count: tickets }) }}
          </div>
          <div class="prize-info">{{ t('scratch.prizeInfo') }}</div>
        </div>
        <BaseButton 
          v-if="isRevealed"
          @click="handleClaim"
          variant="primary"
          size="large"
          class="claim-button"
        >
          {{ t('scratch.claim') }}
        </BaseButton>
      </div>
      
      <canvas 
        ref="canvasRef" 
        class="scratch-canvas"
        :style="{ pointerEvents: isRevealed ? 'none' : 'auto', opacity: isRevealed ? 0 : 1 }"
      />
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: scratchProgress + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.scratch-card {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  user-select: none;
}

.card-inner {
  position: relative;
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
  border-radius: 20px;
  padding: 40px 20px;
  box-shadow:
    0 0 30px 3px #fedb58,
    inset 0 0 40px 10px #f9d71c,
    0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.reward-content {
  text-align: center;
  position: relative;
  z-index: 2;
  color: #6b4b00;
  text-shadow:
    0 0 8px #ffd700,
    0 0 12px #fbbf24;
}

.reward-icon {
  font-size: 72px;
  margin-bottom: 18px;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.reward-title {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 18px;
  color: #b27700;
  text-shadow: 0 0 10px #ffd700;
}

.reward-amount {
  font-size: 56px;
  font-weight: 900;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
  text-shadow:
    0 0 12px #fbbf24,
    0 0 18px #fedb58;
}

.currency {
  font-size: 36px;
}

.label {
  font-size: 22px;
  font-weight: 700;
  color: #b45309;
}

.reward-tickets {
  color: #7c4a00;
  margin-bottom: 28px;
  text-shadow: 0 0 7px #fff3bf;
}

/* *** NEW: Class for ticket count *** */
.ticket-count {
  font-size: 20px;
  font-weight: 700;
}

/* *** NEW: Class for prize info *** */
.prize-info {
  font-size: 16px;
  font-weight: 500;
  margin-top: 4px;
  color: #b27700;
}

.scratch-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  touch-action: none;
  z-index: 5;
  border-radius: 20px;
}

.claim-button {
  margin-top: 20px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  box-shadow:
    0 0 15px #fcd34d,
    inset 0 0 20px #fedc56;
  transition: box-shadow 0.4s ease;
}

.claim-button:hover {
  box-shadow:
    0 0 25px #fde68a,
    inset 0 0 28px #ffec99;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #facc15;
  border-radius: 3px;
  margin-top: 20px;
  overflow: hidden;
  box-shadow: 0 0 12px #fcd34d inset;
}

.progress-fill {
  height: 100%;
  background: #ca8a04;
  transition: width 0.3s ease;
  box-shadow: 0 0 15px #ca8a04;
}

/* Confetti Container Fullscreen */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9;
  overflow: visible;
  background: radial-gradient(circle at center, rgba(255, 240, 200, 0.15), transparent 80%);
}

/* Confetti icons floating upward */
.confetti-icon {
  position: absolute;
  bottom: -40px;
  user-select: none;
  filter: drop-shadow(0 0 3px gold);
  text-shadow:
    0 0 6px #fef3c7,
    0 0 12px #fca311;
}
</style>