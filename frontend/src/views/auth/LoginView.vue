<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center space-x-2">
          <span class="text-4xl">🎪</span>
          <span class="text-2xl font-bold text-gray-900">Miniferias</span>
        </router-link>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">
          Iniciar Sesión
        </h2>
      </div>

      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Error Message -->
          <div
            v-if="authStore.error"
            class="bg-red-50 text-red-600 px-4 py-3 rounded-lg"
          >
            {{ authStore.error }}
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
              class="input"
              placeholder="••••••••"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full btn btn-primary touch-target"
          >
            <span v-if="authStore.loading">Iniciando sesión...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            ¿No tienes cuenta?
            <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
              Regístrate aquí
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

async function handleSubmit() {
  try {
    await authStore.login(form.value)

    // Redirect based on user role
    let redirect = route.query.redirect || '/'

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
    console.error('Login failed:', error)
  }
}
</script>
