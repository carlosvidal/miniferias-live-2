<template>
  <!-- Modal Backdrop -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal Content -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
            @click.stop
          >
            <!-- Close Button -->
            <button
              @click="close"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <!-- Header -->
            <div class="text-center pt-8 px-6">
              <div class="inline-flex items-center space-x-2 mb-4">
                <span class="text-5xl">🎪</span>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-2">
                {{ title }}
              </h3>
              <p class="text-gray-600 text-sm mb-6">
                {{ message }}
              </p>
            </div>

            <!-- Social Login Buttons -->
            <div class="px-6 pb-6 space-y-3">
              <!-- Google -->
              <button
                type="button"
                @click="handleSocialLogin('google')"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span class="font-medium text-gray-700">Continuar con Google</span>
              </button>

              <!-- Facebook -->
              <button
                type="button"
                @click="handleSocialLogin('facebook')"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span class="font-medium text-gray-700">Continuar con Facebook</span>
              </button>

              <!-- TikTok -->
              <button
                type="button"
                @click="handleSocialLogin('tiktok')"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#000000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span class="font-medium text-gray-700">Continuar con TikTok</span>
              </button>
            </div>

            <!-- Divider -->
            <div class="relative px-6">
              <div class="absolute inset-0 flex items-center px-6">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-3 bg-white text-gray-500">o</span>
              </div>
            </div>

            <!-- Email Login Link -->
            <div class="px-6 py-4 text-center">
              <button
                @click="goToLogin"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Usar email y contraseña
              </button>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 text-center">
              <p class="text-xs text-gray-500">
                Al continuar, aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Inicia sesión para continuar'
  },
  message: {
    type: String,
    default: 'Accede con tus redes sociales en segundos'
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()

function close() {
  emit('update:modelValue', false)
}

function handleSocialLogin(provider) {
  // Store current path for redirect after login
  const currentPath = window.location.pathname + window.location.search
  sessionStorage.setItem('auth_redirect_url', currentPath)

  // Get the backend base URL (without /api)
  let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  // Remove /api suffix if present
  backendUrl = backendUrl.replace(/\/api\/?$/, '')

  // Redirect to OAuth endpoint
  window.location.href = `${backendUrl}/api/auth/${provider}`
}

function goToLogin() {
  close()
  router.push('/login')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
