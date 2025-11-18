<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <RouterView />

    <!-- Global Social Login Modal -->
    <SocialLoginModal
      v-model="showModal"
      :title="modalConfig.title"
      :message="modalConfig.message"
    />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SocialLoginModal from '@/components/SocialLoginModal.vue'
import { useAuthPrompt } from '@/composables/useAuthPrompt'

const authStore = useAuthStore()
const { showModal, modalConfig } = useAuthPrompt()

onMounted(() => {
  // Fetch user data if token exists
  if (authStore.isAuthenticated) {
    authStore.fetchUser()
  }
})
</script>

<style scoped>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
