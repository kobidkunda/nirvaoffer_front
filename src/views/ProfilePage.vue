<!-- src/views/ProfilePage.vue -->
<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useLanguage } from '@/composables/useLanguage'
import { ref, computed } from 'vue'
import { profileAPI } from '@/api/endpoints'
import { motion, AnimatePresence } from 'motion-v'
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const router = useRouter()
const { logout, user, updateUser } = useAuth()
const { t } = useLanguage()

const showHelpModal = ref(false)
const showLanguageModal = ref(false)
const showProfileModal = ref(false)
const showAddressModal = ref(false)
const updating = ref(false)
const error = ref('')

// Profile form data
const profileData = ref({
  name: user.value?.name || '',
  shipping_address: {
    line1: user.value?.shipping_address?.line1 || '',
    city: user.value?.shipping_address?.city || '',
    state: user.value?.shipping_address?.state || '',
    pincode: user.value?.shipping_address?.pincode || ''
  }
})

// Computed properties
const hasAddress = computed(() => {
  return user.value?.shipping_address?.line1 &&
         user.value?.shipping_address?.city &&
         user.value?.shipping_address?.state &&
         user.value?.shipping_address?.pincode
})

const handleLogout = () => {
  logout()
  router.push('/')
}

const openProfileModal = () => {
  profileData.value = {
    name: user.value?.name || '',
    shipping_address: {
      line1: user.value?.shipping_address?.line1 || '',
      city: user.value?.shipping_address?.city || '',
      state: user.value?.shipping_address?.state || '',
      pincode: user.value?.shipping_address?.pincode || ''
    }
  }
  showProfileModal.value = true
  error.value = ''
}

const openAddressModal = () => {
  profileData.value.shipping_address = {
    line1: user.value?.shipping_address?.line1 || '',
    city: user.value?.shipping_address?.city || '',
    state: user.value?.shipping_address?.state || '',
    pincode: user.value?.shipping_address?.pincode || ''
  }
  showAddressModal.value = true
  error.value = ''
}

const updateProfile = async () => {
  updating.value = true
  error.value = ''

  try {
    const response = await profileAPI.updateProfile({
      name: profileData.value.name,
      shipping_address: profileData.value.shipping_address
    })

    // Update local user data with the full profile from response
    updateUser(response.profile)

    showProfileModal.value = false
  } catch (err) {
    error.value = err.message || t('errors.unknown')
  } finally {
    updating.value = false
  }
}

const updateAddress = async () => {
  updating.value = true
  error.value = ''

  try {
    const response = await profileAPI.updateAddress(profileData.value.shipping_address)

    // Update local user data with the full profile from response (if available)
    if (response.profile) {
      updateUser(response.profile)
    } else {
      // Fallback: update only the address part
      updateUser({
        ...user.value,
        shipping_address: profileData.value.shipping_address
      })
    }

    showAddressModal.value = false
  } catch (err) {
    error.value = err.message || t('errors.unknown')
  } finally {
    updating.value = false
  }
}
</script>

<template>
  <div class="profile-page">
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
        {{ t('profile.title') }}
      </motion.h1>

      <!-- Profile Information -->
      <motion.div
        class="profile-section card"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.1 }"
      >
        <div class="section-header">
          <h2>{{ t('profile.personalInfo') }}</h2>
          <BaseButton @click="openProfileModal" variant="secondary" size="small">
            {{ t('profile.edit') }}
          </BaseButton>
        </div>
        <div class="info-item">
          <span class="label">{{ t('profile.phone') }}:</span>
          <span class="value">{{ user?.phone_number }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ t('profile.name') }}:</span>
          <span class="value">{{ user?.name || t('profile.notSet') }}</span>
        </div>
      </motion.div>

      <!-- Address Information -->
      <motion.div
        class="address-section card"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.2 }"
      >
        <div class="section-header">
          <h2>{{ t('profile.address') }}</h2>
          <BaseButton @click="openAddressModal" variant="secondary" size="small">
            {{ hasAddress ? t('profile.edit') : t('profile.add') }}
          </BaseButton>
        </div>
        <div v-if="hasAddress" class="address-display">
          <p>{{ user?.shipping_address?.line1 }}</p>
          <p>{{ user?.shipping_address?.city }}, {{ user?.shipping_address?.state }} {{ user?.shipping_address?.pincode }}</p>
        </div>
        <div v-else class="no-address">
          <p>{{ t('profile.noAddress') }}</p>
        </div>
      </motion.div>

      <!-- Logout Button -->
      <motion.div
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.3 }"
      >
        <button @click="handleLogout" class="logout-btn">
          {{ t('profile.logout') }}
        </button>
      </motion.div>
    </div>

    <!-- Profile Edit Modal -->
    <AnimatePresence>
      <motion.div
        v-if="showProfileModal"
        class="modal-overlay"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        @click.self="showProfileModal = false"
      >
        <motion.div
          class="modal-content"
          :initial="{ scale: 0.9, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :exit="{ scale: 0.9, opacity: 0 }"
        >
          <h2>{{ t('profile.editProfile') }}</h2>
          <form @submit.prevent="updateProfile" class="profile-form">
            <BaseInput
              v-model="profileData.name"
              :label="t('profile.fullName')"
              :placeholder="t('profile.fullNamePlaceholder')"
              required
            />
            <BaseInput
              v-model="profileData.shipping_address.line1"
              :label="t('cart.addressLine1')"
              :placeholder="t('cart.addressLine1Placeholder')"
              required
            />
            <BaseInput
              v-model="profileData.shipping_address.city"
              :label="t('cart.city')"
              :placeholder="t('cart.cityPlaceholder')"
              required
            />
            <BaseInput
              v-model="profileData.shipping_address.state"
              :label="t('cart.state')"
              :placeholder="t('cart.statePlaceholder')"
              required
            />
            <BaseInput
              v-model="profileData.shipping_address.pincode"
              :label="t('cart.pincode')"
              :placeholder="t('cart.pincodePlaceholder')"
              type="tel"
              maxlength="6"
              required
            />
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            <div class="modal-actions">
              <BaseButton
                type="button"
                @click="showProfileModal = false"
                variant="secondary"
                :disabled="updating"
              >
                {{ t('common.cancel') }}
              </BaseButton>
              <BaseButton
                type="submit"
                :loading="updating"
              >
                {{ t('profile.save') }}
              </BaseButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    <!-- Address Edit Modal -->
    <AnimatePresence>
      <motion.div
        v-if="showAddressModal"
        class="modal-overlay"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        @click.self="showAddressModal = false"
      >
        <motion.div
          class="modal-content"
          :initial="{ scale: 0.9, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :exit="{ scale: 0.9, opacity: 0 }"
        >
          <h2>{{ hasAddress ? t('profile.editAddress') : t('profile.addAddress') }}</h2>
          <form @submit.prevent="updateAddress" class="address-form">
            <BaseInput
              v-model="profileData.shipping_address.line1"
              :label="t('cart.addressLine1')"
              :placeholder="t('cart.addressLine1Placeholder')"
              required
            />
            <BaseInput
              v-model="profileData.shipping_address.city"
              :label="t('cart.city')"
              :placeholder="t('cart.cityPlaceholder')"
              required
            />
            <BaseInput
              v-model="profileData.shipping_address.state"
              :label="t('cart.state')"
              :placeholder="t('cart.statePlaceholder')"
              required
            />
            <BaseInput
              v-model="profileData.shipping_address.pincode"
              :label="t('cart.pincode')"
              :placeholder="t('cart.pincodePlaceholder')"
              type="tel"
              maxlength="6"
              required
            />
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            <div class="modal-actions">
              <BaseButton
                type="button"
                @click="showAddressModal = false"
                variant="secondary"
                :disabled="updating"
              >
                {{ t('common.cancel') }}
              </BaseButton>
              <BaseButton
                type="submit"
                :loading="updating"
              >
                {{ t('profile.save') }}
              </BaseButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    <HelpModal :show="showHelpModal" @close="showHelpModal = false" />
    <LanguageModal :show="showLanguageModal" @close="showLanguageModal = false" />
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
  text-align: center;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.profile-section, .address-section {
  padding: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #6b7280;
}

.value {
  color: #1f2937;
  text-align: right;
}

.address-display p {
  margin: 4px 0;
  color: #374151;
  line-height: 1.5;
}

.no-address {
  color: #6b7280;
  font-style: italic;
}

.logout-btn {
  width: 100%;
  padding: 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
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
  text-align: center;
}

.modal-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.profile-form, .address-form {
  text-align: left;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.error-message {
  background: #fee2e2;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  text-align: center;
}

@media (max-width: 640px) {
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .modal-content {
    padding: 24px;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
