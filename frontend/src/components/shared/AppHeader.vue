<template>
  <!-- Mobile-First Header -->
  <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200">
    <div class="max-w-lg lg:max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <router-link to="/" class="flex items-center">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Miniferias</h1>
          <p class="text-xs text-gray-500">Live Shopping</p>
        </div>
      </router-link>
      <div class="flex items-center gap-3">
        <!-- Profile/Login -->
        <button
          v-if="authStore.isAuthenticated"
          @click="navigateToProfile"
          class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <button
          v-else
          @click="$router.push('/login')"
          class="px-4 py-1.5 bg-pink-600 text-white text-sm font-medium rounded-full hover:bg-pink-700 transition-colors"
        >
          Ingresar
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function navigateToProfile() {
  if (authStore.user?.role === 'EXHIBITOR') {
    router.push('/exhibitor/dashboard')
  } else {
    router.push('/profile')
  }
}
</script>
