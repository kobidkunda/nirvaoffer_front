<script setup>
import { ref, computed } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['detect', 'close'])

const scannerError = ref('')
const cameraReady = ref(false)

// Enhanced camera constraints with autofocus
const cameraConstraints = computed(() => ({
  facingMode: 'environment',
  advanced: [
    { focusMode: 'continuous' },
    { zoom: 1.0 }
  ]
}))

// Handle successful QR detection
const onDetect = (detectedCodes) => {
  emit('detect', detectedCodes)
}

// Handle camera initialization and permissions
const onScannerInit = async (promise) => {
  scannerError.value = ''
  try {
    const { capabilities } = await promise
    console.log('Camera initialized successfully', capabilities)

    // Apply video constraints after camera is ready for better focus
    if (capabilities) {
      try {
        // Additional focus optimization for mobile devices
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            focusMode: 'continuous',
            zoom: true
          }
        })
        console.log('Enhanced constraints applied')
      } catch (constraintErr) {
        console.warn('Could not apply enhanced constraints:', constraintErr)
      }
    }
  } catch (err) {
    console.error('Camera init error:', err)

    if (err.name === 'NotAllowedError') {
      scannerError.value = t('errors.cameraPermission') || 'Camera permission denied. Please allow camera access.'
    } else if (err.name === 'NotFoundError') {
      scannerError.value = t('errors.cameraNotFound') || 'No camera found on this device.'
    } else if (err.name === 'NotSupportedError') {
      scannerError.value = 'Secure context required (HTTPS or localhost).'
    } else if (err.name === 'NotReadableError') {
      scannerError.value = 'Camera already in use by another application.'
    } else if (err.name === 'OverconstrainedError') {
      scannerError.value = 'Camera does not meet requirements.'
    } else if (err.name === 'StreamApiNotSupportedError') {
      scannerError.value = 'Camera API not supported in this browser.'
    } else if (err.name === 'InsecureContextError') {
      scannerError.value = 'Camera access only allowed on HTTPS or localhost.'
    } else {
      scannerError.value = t('errors.cameraError') || err.message || 'Camera error occurred.'
    }
  }
}

// Handle scanner errors
const onScannerError = (err) => {
  console.error('Scanner error:', err)
  scannerError.value = err.message || 'Scanner error occurred'
}

// Camera ready handler
const onCameraReady = () => {
  console.log('Camera stream is ready')
  cameraReady.value = true
  scannerError.value = ''
}

// Track function for visual feedback (helps with detection)
const paintOutline = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints

    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)

    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y)
    }

    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.closePath()
    ctx.stroke()

    // Add a green fill with transparency
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)'
    ctx.fill()
  }
}
</script>

<template>
  <div v-if="show" class="scanner-modal">
    <QrcodeStream
      @detect="onDetect"
      @init="onScannerInit"
      @error="onScannerError"
      @camera-on="onCameraReady"
      :constraints="cameraConstraints"
      :formats="['qr_code']"
      :track="paintOutline"
      class="scanner-video"
    />

    <button @click="$emit('close')" class="close-scanner-btn" aria-label="Close scanner">
      ✕
    </button>

    <div class="scanner-overlay-content">
      <div class="scanner-box">
        <div class="scanner-corners">
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
        </div>
        <div class="scanner-line"></div>
      </div>

      <div class="scanner-instructions">
        <p v-if="!cameraReady" class="scanner-text loading-text">
          {{ t('scan.initializingCamera') || 'Initializing camera...' }}
        </p>
        <p v-else class="scanner-text">
          {{ t('scan.scannerPrompt') || 'Position QR code within the frame' }}
        </p>
      </div>

      <div v-if="scannerError" class="scanner-error-display">
        <span class="error-icon">⚠️</span>
        {{ scannerError }}
      </div>

      <div v-if="cameraReady" class="scanner-status">
        <span class="status-indicator active"></span>
        <span class="status-text">Camera Active</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.close-scanner-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
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
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  overflow: hidden;
}

.scanner-corners {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #10b981;
  animation: corner-pulse 2s infinite;
}

.corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 24px;
}

.corner-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 24px;
}

.corner-bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 24px;
}

.corner-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 24px;
}

@keyframes corner-pulse {
  0%, 100% {
    opacity: 1;
    border-color: #10b981;
  }
  50% {
    opacity: 0.5;
    border-color: #34d399;
  }
}

.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  box-shadow: 0 0 20px #10b981, 0 0 40px #10b981;
  animation: scan-line 2s ease-in-out infinite;
}

@keyframes scan-line {
  0% {
    top: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

.scanner-instructions {
  margin-top: 32px;
  text-align: center;
}

.scanner-text {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.loading-text {
  animation: pulse-text 1.5s infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.scanner-error-display {
  position: absolute;
  bottom: 100px;
  left: 20px;
  right: 20px;
  background: #ef4444;
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  z-index: 2003;
  pointer-events: all;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.error-icon {
  font-size: 20px;
}

.scanner-status {
  position: absolute;
  bottom: 30px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
}

.status-indicator.active {
  animation: blink-indicator 1.5s infinite;
  box-shadow: 0 0 10px #10b981;
}

@keyframes blink-indicator {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  color: white;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .scanner-box {
    width: 240px;
    height: 240px;
  }

  .corner {
    width: 32px;
    height: 32px;
    border-width: 3px;
  }

  .scanner-text {
    font-size: 14px;
    padding: 10px 20px;
  }

  .scanner-error-display {
    font-size: 13px;
    padding: 14px 18px;
    left: 16px;
    right: 16px;
  }

  .close-scanner-btn {
    width: 40px;
    height: 40px;
    font-size: 20px;
    top: 16px;
    right: 16px;
  }
}

@media (max-width: 480px) {
  .scanner-box {
    width: 220px;
    height: 220px;
  }

  .scanner-text {
    font-size: 13px;
  }

  .scanner-error-display {
    font-size: 13px;
  }
}
</style>