<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center space-x-2">
          <span class="text-4xl">🎪</span>
          <span class="text-2xl font-bold text-gray-900">Miniferias</span>
        </router-link>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Crear Cuenta
        </h2>
      </div>

      <div class="card">
        <!-- Social Login -->
        <div class="space-y-3 mb-6">
          <p class="text-sm text-gray-600 text-center mb-3">
            Regístrate rápidamente con tus redes sociales
          </p>

          <!-- Google -->
          <button
            type="button"
            @click="handleSocialLogin('google')"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-target"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">Continuar con Google</span>
          </button>

          <!-- Facebook -->
          <button
            type="button"
            @click="handleSocialLogin('facebook')"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-target"
          >
            <svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">Continuar con Facebook</span>
          </button>

          <!-- TikTok -->
          <button
            type="button"
            @click="handleSocialLogin('tiktok')"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-target"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#000000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">Continuar con TikTok</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">O regístrate con email</span>
          </div>
        </div>

        <!-- Traditional Registration Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Error Message -->
          <div
            v-if="authStore.error"
            class="bg-red-50 text-red-600 px-4 py-3 rounded-lg"
          >
            {{ authStore.error }}
          </div>

          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Tu nombre"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input"
              placeholder="tu@email.com"
            />
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              Teléfono (opcional)
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="input"
              placeholder="999999999"
              pattern="9\d{8}"
              maxlength="9"
            />
            <p class="text-xs text-gray-500 mt-1">Formato: 9 dígitos comenzando con 9</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <!-- Role -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuario
            </label>
            <select
              id="role"
              v-model="form.role"
              class="input"
            >
              <option value="VISITOR">Visitante (Comprador)</option>
              <option value="EXHIBITOR">Expositor (Vendedor)</option>
            </select>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full btn btn-primary touch-target"
          >
            <span v-if="authStore.loading">Creando cuenta...</span>
            <span v-else>Crear Cuenta</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            ¿Ya tienes cuenta?
            <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
              Inicia sesión aquí
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'VISITOR'
})

async function handleSubmit() {
  try {
    await authStore.register(form.value)

    // Redirect based on user role
    let redirect = '/'

    // Exhibitors should go to their dashboard
    if (authStore.isExhibitor) {
      redirect = '/exhibitor'
    }
    // Admins should go to admin panel
    else if (authStore.isAdmin) {
      redirect = '/admin'
    }

    router.push(redirect)
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

function handleSocialLogin(provider) {
  // Get the backend base URL (without /api)
  let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  // Remove /api suffix if present
  backendUrl = backendUrl.replace(/\/api\/?$/, '')

  // Redirect to OAuth endpoint
  window.location.href = `${backendUrl}/api/auth/${provider}`
}
</script>
