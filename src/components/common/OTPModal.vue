<script setup>
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLanguage } from '@/composables/useLanguage'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'

const props = defineProps({
  show: Boolean,
  error: String,    // Error from parent (e.g., "Invalid OTP")
  loading: Boolean  // Loading state from parent (for verification)
})

const emit = defineEmits(['close', 'success'])

const { t } = useLanguage()
const authStore = useAuthStore()

const step = ref('phone') // phone, otp
const phoneNumber = ref('')
const otpCode = ref('')
const internalLoading = ref(false) // For 'Get OTP' request
const internalError = ref('')   // For internal validation

// Computed prop to show the correct error
const displayError = computed(() => {
  // Parent's error (e.g., "Invalid OTP") takes precedence
  return props.error || internalError.value
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// Watch for input changes to clear internal errors
watch(phoneNumber, () => {
  internalError.value = ''
})
watch(otpCode, () => {
  internalError.value = ''
})

// If parent sends an error, clear any internal error
watch(() => props.error, (newVal) => {
  if (newVal) {
    internalError.value = ''
  }
})

const resetForm = () => {
  step.value = 'phone'
  phoneNumber.value = ''
  otpCode.value = ''
  internalError.value = '' // Use internalError
  internalLoading.value = false
}

const handleRequestOTP = async () => {
  internalError.value = '' 
  
  // Validate phone number
  if (!/^[6-9]\d{9}$/.test(phoneNumber.value)) {
    internalError.value = 'Please enter a valid 10-digit mobile number'
    return
  }
  
  internalLoading.value = true
  
  try {
    const result = await authStore.requestOTP(phoneNumber.value)
    
    if (result.success) {
      console.log('OTP sent successfully')
      step.value = 'otp'
    } else {
      internalError.value = result.error || 'Failed to send OTP'
    }
  } catch (err) {
    console.error('OTP request error:', err)
    internalError.value = err.message || 'Failed to send OTP'
  } finally {
    internalLoading.value = false
  }
}

const handleVerifyOTP = async () => {
  internalError.value = ''
  
  if (otpCode.value.length < 4) {
    internalError.value = 'Please enter the OTP code'
    return
  }
  
  console.log('Verifying OTP:', { phoneNumber: phoneNumber.value, otpCode: otpCode.value })
  
  // Emit to parent component to handle login
  emit('success', { 
    phoneNumber: phoneNumber.value, 
    otpCode: otpCode.value 
  })
}

const close = () => {
  // Prevent closing if either internal or parent is loading
  if (!internalLoading.value && !props.loading) {
    emit('close')
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <button class="close-btn" @click="close" :disabled="internalLoading || props.loading">✕</button>
        
        <div v-if="step === 'phone'" class="modal-body">
          <div class="icon whatsapp-icon">💬</div>
          <h2>{{ t('auth.enterPhone') }}</h2>
          <p class="disclaimer">{{ t('auth.whatsappDisclaimer') }}</p>
          
          <BaseInput
            v-model="phoneNumber"
            type="tel"
            :placeholder="t('auth.phonePlaceholder')"
            :label="t('auth.phoneLabel')"
            maxlength="10"
            pattern="[0-9]*"
            :error="displayError" 
          />
          
          <BaseButton 
            @click="handleRequestOTP"
            :loading="internalLoading"
            :disabled="phoneNumber.length !== 10"
          >
            {{ t('auth.getOTP') }}
          </BaseButton>
        </div>
        
        <div v-if="step === 'otp'" class="modal-body">
          <div class="icon">🔐</div>
          <h2>{{ t('auth.enterOTP') }} {{ phoneNumber }}</h2>
          
          <BaseInput
            v-model="otpCode"
            type="tel"
            :placeholder="t('auth.otpLabel')"
            maxlength="6"
            pattern="[0-9]*"
            :error="displayError"
          />
          
          <BaseButton 
            @click="handleVerifyOTP"
            :loading="props.loading" 
            :disabled="otpCode.length < 4 || internalLoading"
          >
            {{ t('auth.verify') }}
          </BaseButton>
          
          <button 
            class="link-button" 
            @click="step = 'phone'" 
            :disabled="internalLoading || props.loading"
          >
            {{ t('auth.changeNumber') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
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
  z-index: 1000;
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

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  text-align: center;
}

.icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.icon.whatsapp-icon {
  color: #25D366; /* WhatsApp Green */
}

h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px; /* Reduced margin */
}

.disclaimer {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
}

/* *** CSS FIX for Change Number Button *** */
.link-button {
  background: #f9fafb; /* Light gray background */
  border: 1px solid #d1d5db; /* Gray border */
  color: #374151; /* Dark gray text */
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  padding: 10px 16px;
  width: 100%;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.link-button:hover {
  background-color: #f3f4f6; /* Slightly darker on hover */
  text-decoration: none;
}

.link-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* *** End of CSS FIX *** */

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>