// src/api/client.js
import { ofetch } from 'ofetch'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_VERSION = import.meta.env.VITE_API_VERSION

console.log('API Config:', { API_BASE_URL, API_VERSION })

// Create base API client
export const apiClient = ofetch.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  
  // Request interceptor
  onRequest({ options }) {
    console.log('→ API Request:', options.method, options.baseURL + (options.url || ''))
    
    // Add auth token if exists
    const token = localStorage.getItem('auth_token')
    if (token) {
      console.log('→ Using auth token')
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    }
    
    // Add default headers
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // Response interceptor
  onResponse({ response }) {
    console.log('← API Response:', response.status, response._data)
    return response._data
  },
  
  // Error interceptor
  onResponseError({ response }) {
    console.error('✗ API Error:', response.status, response._data)
    
    const status = response.status
    
    // Handle 401 - Unauthorized
    if (status === 401) {
      console.error('401 Unauthorized - clearing token')
      localStorage.removeItem('auth_token')
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    
    // Handle 429 - Rate Limited
    if (status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 60
      console.error(`Rate limited. Retry after ${retryAfter} seconds`)
    }
    
    // Throw error with message from API
    const errorMessage = response._data?.message || response._data?.error || 'An error occurred'
    throw new Error(errorMessage)
  },
  
  // Disable retry for debugging
  retry: 0,
  retryDelay: 500
})
