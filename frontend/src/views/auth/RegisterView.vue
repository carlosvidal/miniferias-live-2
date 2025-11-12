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
</script>
