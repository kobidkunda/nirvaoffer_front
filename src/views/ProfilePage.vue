<!-- src/views/ProfilePage.vue -->
<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useLanguage } from '@/composables/useLanguage'
import { ref } from 'vue'
import GlobalHeader from '@/components/common/GlobalHeader.vue'
import HelpModal from '@/components/common/HelpModal.vue'
import LanguageModal from '@/components/common/LanguageModal.vue'

const router = useRouter()
const { logout, user } = useAuth()
const { t } = useLanguage()

const showHelpModal = ref(false)
const showLanguageModal = ref(false)

const handleLogout = () => {
  logout()
  router.push('/')
}
</script>

<template>
  <div class="profile-page">
    <GlobalHeader 
      @open-help="showHelpModal = true"
      @open-language="showLanguageModal = true"
    />
    
    <div class="content">
      <h1>{{ t('profile.title') }}</h1>
      <div class="profile-info">
        <div class="info-item">
          <span class="label">{{ t('profile.phone') }}:</span>
          <span class="value">{{ user?.phone_number }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ t('profile.name') }}:</span>
          <span class="value">{{ user?.name }}</span>
        </div>
      </div>
      <button @click="handleLogout" class="logout-btn">
        {{ t('profile.logout') }}
      </button>
    </div>

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
  padding: 40px 20px;
  width: 100%;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 32px;
}

.profile-info {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
</style>
