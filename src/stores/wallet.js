// src/stores/wallet.js
import { defineStore } from 'pinia'

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    balance: 0,
    transactions: [],
    luckyDrawTickets: 0,
    pendingReward: null
  }),

  getters: {
    formattedBalance: (state) => `₹${state.balance.toFixed(2)}`,
    canRedeem: (state) => state.balance > 0,
    ticketCount: (state) => state.luckyDrawTickets
  },

  actions: {
    setPendingReward(rewardData) {
      this.pendingReward = {
        codeToken: rewardData.code_token,
        cashbackAmount: rewardData.cashback_amount,
        tickets: rewardData.lucky_draw_tickets
      }
    },

    addReward(amount, tickets = 0) {
      this.balance += amount
      this.luckyDrawTickets += tickets
      this.pendingReward = null
    },

    deductAmount(amount) {
      if (this.balance >= amount) {
        this.balance -= amount
        return true
      }
      return false
    },

    syncWallet(walletData) {
      this.balance = walletData.balance || 0
      this.luckyDrawTickets = walletData.lucky_draw_tickets || 0
    },

    clearPendingReward() {
      this.pendingReward = null
    }
  },

  persist: {
    key: 'nirva_wallet',
    paths: ['balance', 'luckyDrawTickets']
  }
})
