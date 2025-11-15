// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'scan',
    component: () => import('@/views/ScanPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/redeem',
    name: 'redeem',
    component: () => import('@/views/RedeemPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/product/:id',
    name: 'product-details',
    component: () => import('@/views/ProductDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/category/:slug',
    name: 'category-details',
    component: () => import('@/views/CategoryDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrdersPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: () => import('@/views/WalletPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'order-details',
    component: () => import('@/views/OrderDetailsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/language-select',
    name: 'language-select',
    component: () => import('@/views/LanguageSelect.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth

  console.log('Router guard:', { to: to.name, requiresAuth, isLoggedIn: authStore.isLoggedIn })

  // If user is already logged in and tries to access scan page, redirect to dashboard
  if (to.name === 'scan' && authStore.isLoggedIn && !from.name) {
    console.log('Already logged in, redirecting to dashboard')
    next('/dashboard')
  } else if (requiresAuth && !authStore.isLoggedIn) {
    // Store return URL for redirect after login
    authStore.returnUrl = to.fullPath
    console.log('Not logged in, redirecting to scan page')
    next('/')
  } else {
    next()
  }
})

export default router
