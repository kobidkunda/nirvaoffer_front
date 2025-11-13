<script setup>
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLanguageStore } from '@/stores/language'
import { useLanguage } from '@/composables/useLanguage'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const languageStore = useLanguageStore()
const { t, changeLanguage } = useLanguage()

const testStores = () => {
  console.log('Auth Store:', authStore.$state)
  console.log('Wallet Store:', walletStore.$state)
  console.log('Language Store:', languageStore.$state)
}
</script>

<template>
  <div style="padding: 20px;">
    <h1>{{ t('common.appName') }}</h1>
    <p>Current Language: {{ languageStore.currentLanguageName }}</p>
    
    <div style="margin-top: 20px;">
      <button @click="changeLanguage('en')">English</button>
      <button @click="changeLanguage('hi')">हिन्दी</button>
      <button @click="changeLanguage('bn')">বাংলা</button>
    </div>
    
    <button @click="testStores" style="margin-top: 20px;">
      Test Stores (Check Console)
    </button>
    
    <p>{{ t('dashboard.welcome') }}</p>
    <p>{{ t('dashboard.wallet') }}: {{ walletStore.formattedBalance }}</p>
  </div>
</template>
