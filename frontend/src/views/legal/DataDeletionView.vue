<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white shadow-sm rounded-lg p-8 md:p-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Eliminación de Datos de Usuario</h1>
        <p class="text-sm text-gray-500 mb-8">Solicite la eliminación de sus datos personales</p>

        <div class="prose prose-gray max-w-none">
          <!-- Introducción -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Sus Derechos de Eliminación de Datos</h2>
            <p class="text-gray-700 mb-4">
              De acuerdo con nuestro compromiso con la privacidad y cumpliendo con regulaciones de protección de datos,
              usted tiene el derecho de solicitar la eliminación de su cuenta y todos los datos personales asociados
              que tenemos almacenados.
            </p>
          </section>

          <!-- Qué se elimina -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">¿Qué Datos se Eliminarán?</h2>
            <p class="text-gray-700 mb-4">
              Cuando solicite la eliminación de su cuenta, eliminaremos permanentemente:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Información de perfil:</strong> Nombre, correo electrónico, foto de perfil</li>
              <li><strong>Datos de autenticación:</strong> Contraseñas, tokens de sesión, conexiones de redes sociales</li>
              <li><strong>Preferencias y configuraciones:</strong> Notificaciones, recordatorios de eventos</li>
              <li><strong>Mensajes de chat:</strong> Sus conversaciones en eventos en vivo</li>
              <li><strong>Datos de uso:</strong> Historial de navegación, eventos vistos, interacciones</li>
            </ul>
          </section>

          <!-- Qué se retiene -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">¿Qué Datos se Retienen?</h2>
            <p class="text-gray-700 mb-4">
              Por razones legales, contables y de seguridad, debemos retener ciertos datos por un período limitado:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Historial de transacciones:</strong> Registro de compras y pagos (requerido por ley fiscal)</li>
              <li><strong>Información de pedidos:</strong> Detalles de pedidos completados (para garantía y soporte)</li>
              <li><strong>Datos de facturación:</strong> Información necesaria para cumplimiento fiscal (7 años)</li>
              <li><strong>Registros de seguridad:</strong> Logs de acceso y actividad sospechosa (90 días)</li>
            </ul>
            <p class="text-gray-700">
              Estos datos se mantienen de forma anónima cuando sea posible y se eliminan automáticamente después del
              período de retención legal.
            </p>
          </section>

          <!-- Proceso -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Proceso de Eliminación</h2>
            <div class="space-y-4">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div class="ml-4">
                  <h3 class="font-semibold text-gray-900">Solicitud</h3>
                  <p class="text-gray-700">
                    Complete el formulario a continuación o envíe un correo a privacy@miniferieslive.com
                  </p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div class="ml-4">
                  <h3 class="font-semibold text-gray-900">Verificación</h3>
                  <p class="text-gray-700">
                    Verificaremos su identidad por correo electrónico para proteger su seguridad
                  </p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div class="ml-4">
                  <h3 class="font-semibold text-gray-900">Confirmación</h3>
                  <p class="text-gray-700">
                    Le enviaremos un correo de confirmación con un enlace de verificación final
                  </p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div class="ml-4">
                  <h3 class="font-semibold text-gray-900">Eliminación</h3>
                  <p class="text-gray-700">
                    Procesamos la eliminación dentro de 30 días hábiles y le notificaremos cuando se complete
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Consecuencias -->
          <section class="mb-8">
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">Importante: Esta acción es irreversible</h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <p class="mb-2">Una vez eliminada su cuenta:</p>
                    <ul class="list-disc pl-5 space-y-1">
                      <li>No podrá acceder a su cuenta ni recuperar sus datos</li>
                      <li>Perderá acceso a sus pedidos históricos</li>
                      <li>No podrá participar en eventos futuros con esta cuenta</li>
                      <li>Deberá crear una nueva cuenta si desea usar el servicio nuevamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Formulario -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Solicitar Eliminación de Datos</h2>

            <!-- Formulario para usuarios autenticados -->
            <div v-if="isAuthenticated" class="space-y-6">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-800">
                  <strong>Usuario autenticado:</strong> {{ userEmail }}
                </p>
              </div>

              <form @submit.prevent="submitDeletionRequest" class="space-y-4">
                <div>
                  <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de eliminación (opcional)
                  </label>
                  <textarea
                    id="reason"
                    v-model="deletionReason"
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Por favor, comparta por qué desea eliminar su cuenta. Esto nos ayuda a mejorar nuestros servicios."
                  ></textarea>
                </div>

                <div class="flex items-start">
                  <input
                    id="confirm"
                    v-model="confirmDeletion"
                    type="checkbox"
                    class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="confirm" class="ml-2 text-sm text-gray-700">
                    Entiendo que esta acción es irreversible y que perderé el acceso a mi cuenta y datos permanentemente
                  </label>
                </div>

                <div class="flex items-center gap-4">
                  <button
                    type="submit"
                    :disabled="!confirmDeletion || isSubmitting"
                    class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ isSubmitting ? 'Procesando...' : 'Solicitar Eliminación' }}
                  </button>
                  <button
                    type="button"
                    @click="$router.back()"
                    class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              <!-- Mensaje de éxito -->
              <div v-if="showSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <div class="ml-3">
                    <p class="text-sm text-green-800">
                      <strong>Solicitud enviada exitosamente.</strong> Hemos enviado un correo de verificación a {{ userEmail }}.
                      Por favor, revise su correo y haga clic en el enlace para confirmar la eliminación.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Mensaje de error -->
              <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <div class="ml-3">
                    <p class="text-sm text-red-800">{{ errorMessage }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulario para usuarios no autenticados -->
            <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p class="text-gray-700 mb-4">
                Para solicitar la eliminación de sus datos, debe iniciar sesión en su cuenta o contactarnos por correo electrónico.
              </p>
              <div class="flex gap-4">
                <router-link
                  to="/login"
                  class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </router-link>
                <a
                  href="mailto:privacy@miniferieslive.com?subject=Solicitud de Eliminación de Datos"
                  class="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Contactar por Email
                </a>
              </div>
            </div>
          </section>

          <!-- Usuarios de Facebook -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Usuarios de Facebook Login</h2>
            <p class="text-gray-700 mb-4">
              Si inició sesión usando Facebook, la eliminación de su cuenta en Miniferias Live:
            </p>
            <ul class="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Eliminará todos los datos almacenados en nuestra plataforma</li>
              <li>Revocará el acceso de Miniferias Live a su cuenta de Facebook</li>
              <li>NO eliminará su cuenta de Facebook (debe hacerlo directamente en Facebook si lo desea)</li>
            </ul>
            <p class="text-gray-700">
              Para revocar el acceso de nuestra aplicación en Facebook sin eliminar su cuenta en Miniferias Live,
              puede hacerlo desde la configuración de aplicaciones de Facebook.
            </p>
          </section>

          <!-- Contacto -->
          <section class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">¿Necesita Ayuda?</h2>
            <p class="text-gray-700">
              Si tiene preguntas sobre el proceso de eliminación de datos o necesita asistencia, contáctenos:
            </p>
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <p class="text-gray-700">
                <strong>Email:</strong> privacy@miniferieslive.com<br>
                <strong>Tiempo de respuesta:</strong> 2-3 días hábiles
              </p>
            </div>
          </section>
        </div>

        <!-- Botón volver -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <button
            @click="$router.back()"
            class="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import AppHeader from '@/components/shared/AppHeader.vue'
import AppFooter from '@/components/shared/AppFooter.vue'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const userEmail = computed(() => authStore.user?.email || '')

const deletionReason = ref('')
const confirmDeletion = ref(false)
const isSubmitting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

const submitDeletionRequest = async () => {
  if (!confirmDeletion.value) {
    errorMessage.value = 'Debe confirmar que entiende las consecuencias de la eliminación'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  showSuccess.value = false

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    await axios.post(
      `${API_URL}/api/users/request-deletion`,
      { reason: deletionReason.value },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    showSuccess.value = true
    deletionReason.value = ''
    confirmDeletion.value = false
  } catch (error) {
    console.error('Error al solicitar eliminación:', error)
    errorMessage.value = error.response?.data?.message || 'Error al procesar la solicitud. Por favor, inténtelo de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
