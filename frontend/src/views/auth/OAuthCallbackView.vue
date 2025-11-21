<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="text-center">
      <div class="inline-flex items-center space-x-2 mb-4">
        <span class="text-4xl">🎪</span>
        <span class="text-2xl font-bold text-gray-900">Miniferias</span>
      </div>
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Completando inicio de sesión...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const token = route.query.token

    if (!token) {
      console.error('No token found in callback URL')
      router.push('/login?error=auth_failed')
      return
    }

    // Store the token using the auth store method (updates reactive state)
    authStore.setToken(token)

    // Fetch user data (now token.value is set, so fetchUser will work)
    await authStore.fetchUser()

    // Get redirect URL from sessionStorage (saved before OAuth flow)
    const savedRedirect = sessionStorage.getItem('auth_redirect_url')
    sessionStorage.removeItem('auth_redirect_url') // Clean up

    // Determine redirect based on user role or saved URL
    let redirect = savedRedirect || route.query.redirect || '/'

    // Override redirect for admin and exhibitor roles
    if (authStore.isExhibitor) {
      redirect = '/exhibitor'
    } else if (authStore.isAdmin) {
      redirect = '/admin'
    }

    router.push(redirect)
  } catch (error) {
    console.error('OAuth callback error:', error)
    router.push('/login?error=callback_failed')
  }
})
</script>
