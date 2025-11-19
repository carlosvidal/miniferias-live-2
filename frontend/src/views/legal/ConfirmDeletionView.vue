<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-lg w-full">
      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white shadow-sm rounded-lg p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Procesando eliminación de cuenta...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="bg-white shadow-sm rounded-lg p-8">
        <div class="text-center mb-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Cuenta Eliminada Exitosamente</h2>
          <p class="text-gray-600">
            Tu cuenta y datos personales han sido eliminados permanentemente de Miniferias Live.
          </p>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700">
                Los registros de pedidos se mantienen de forma anónima por razones legales y contables según lo establecido en nuestra política de privacidad.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-sm text-gray-600">
            Lamentamos verte partir. Si en el futuro deseas volver a usar Miniferias Live, deberás crear una nueva cuenta.
          </p>
          <p class="text-sm text-gray-600">
            Gracias por haber formado parte de nuestra comunidad.
          </p>
        </div>

        <div class="mt-8 text-center">
          <router-link
            to="/"
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </router-link>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white shadow-sm rounded-lg p-8">
        <div class="text-center mb-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Error al Eliminar Cuenta</h2>
          <p class="text-gray-600 mb-4">{{ error }}</p>
        </div>

        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                Posibles razones:
              </p>
              <ul class="list-disc list-inside text-sm text-yellow-700 mt-2">
                <li>El enlace ha expirado (válido por 24 horas)</li>
                <li>El enlace ya fue utilizado</li>
                <li>La cuenta ya fue eliminada</li>
                <li>El enlace es inválido</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Si deseas eliminar tu cuenta y el enlace expiró, por favor:
          </p>
          <ul class="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
            <li>Inicia sesión en tu cuenta</li>
            <li>Visita la página de <router-link to="/data-deletion" class="text-blue-600 hover:text-blue-800">Eliminación de Datos</router-link></li>
            <li>Solicita un nuevo enlace de confirmación</li>
          </ul>
          <p class="text-sm text-gray-600">
            O contáctanos en: <a href="mailto:privacy@miniferieslive.com" class="text-blue-600 hover:text-blue-800">privacy@miniferieslive.com</a>
          </p>
        </div>

        <div class="mt-8 flex gap-4 justify-center">
          <router-link
            to="/data-deletion"
            class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Solicitar Nuevo Enlace
          </router-link>
          <router-link
            to="/"
            class="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver al Inicio
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()

const isLoading = ref(true)
const isSuccess = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token

  if (!token) {
    error.value = 'Token de confirmación no proporcionado'
    isLoading.value = false
    return
  }

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await axios.get(`${API_URL}/api/users/confirm-deletion`, {
      params: { token }
    })

    if (response.data) {
      isSuccess.value = true
    }
  } catch (err) {
    console.error('Error confirming deletion:', err)
    error.value = err.response?.data?.error || 'Error al procesar la eliminación. Por favor, inténtelo de nuevo.'
  } finally {
    isLoading.value = false
  }
})
</script>
