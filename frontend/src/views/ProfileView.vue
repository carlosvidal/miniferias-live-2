<template>
  <div class="w-full">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Mi Perfil</h1>

      <!-- Loading State -->
      <div v-if="loading" class="card max-w-2xl">
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>

      <!-- Profile Form -->
      <div v-else class="card max-w-2xl">
        <form @submit.prevent="saveProfile" class="space-y-6">

          <!-- Avatar Section -->
          <div class="flex items-start gap-6 pb-6 border-b border-gray-200">
            <!-- Current Avatar Display -->
            <div v-if="form.profilePicture && !showUploadAvatar" class="flex-shrink-0">
              <div class="relative group">
                <img
                  :src="getAvatarUrl(form.profilePicture)"
                  alt="Avatar"
                  class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button
                  type="button"
                  @click="showUploadAvatar = true"
                  class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Avatar Upload -->
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Foto de Perfil
              </label>
              <p class="text-xs text-gray-500 mb-3">
                Imagen cuadrada recomendada. Se mostrará circular.
              </p>

              <div v-if="!form.profilePicture || showUploadAvatar">
                <ImageUpload
                  type="avatar"
                  v-model="form.profilePicture"
                  alt="Mi foto de perfil"
                  @uploaded="handleAvatarUploaded"
                  @error="handleUploadError"
                />

                <button
                  v-if="showUploadAvatar && form.profilePicture"
                  type="button"
                  @click="showUploadAvatar = false"
                  class="mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>

              <button
                v-else
                type="button"
                @click="showUploadAvatar = true"
                class="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Cambiar foto
              </button>
            </div>
          </div>

          <!-- Personal Information -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Información Personal</h3>

            <div class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="input"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <!-- Email (read-only) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  class="input bg-gray-50"
                  disabled
                />
                <p class="mt-1 text-xs text-gray-500">
                  El email no se puede cambiar
                </p>
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="input"
                  placeholder="+51 999 999 999"
                />
              </div>

              <!-- Role (read-only) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuario
                </label>
                <div class="flex items-center gap-2">
                  <span
                    :class="{
                      'bg-purple-100 text-purple-700': form.role === 'ADMIN',
                      'bg-blue-100 text-blue-700': form.role === 'EXHIBITOR',
                      'bg-gray-100 text-gray-700': form.role === 'VISITOR'
                    }"
                    class="px-3 py-1 text-sm font-medium rounded-full"
                  >
                    {{ getRoleLabel(form.role) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Connected Accounts -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Cuentas Conectadas</h3>
            <p class="text-sm text-gray-600 mb-4">
              Gestiona los métodos de inicio de sesión vinculados a tu cuenta
            </p>

            <div class="space-y-3">
              <!-- Google -->
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">Google</p>
                    <p v-if="isProviderLinked('GOOGLE')" class="text-xs text-green-600">Conectado</p>
                    <p v-else class="text-xs text-gray-500">No conectado</p>
                  </div>
                </div>
                <button
                  v-if="isProviderLinked('GOOGLE')"
                  @click="confirmUnlink('GOOGLE')"
                  :disabled="!canUnlinkProvider"
                  class="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Desvincular
                </button>
                <button
                  v-else
                  @click="linkProvider('google')"
                  class="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Conectar
                </button>
              </div>

              <!-- Facebook -->
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">Facebook</p>
                    <p v-if="isProviderLinked('FACEBOOK')" class="text-xs text-green-600">Conectado</p>
                    <p v-else class="text-xs text-gray-500">No conectado</p>
                  </div>
                </div>
                <button
                  v-if="isProviderLinked('FACEBOOK')"
                  @click="confirmUnlink('FACEBOOK')"
                  :disabled="!canUnlinkProvider"
                  class="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Desvincular
                </button>
                <button
                  v-else
                  @click="linkProvider('facebook')"
                  class="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Conectar
                </button>
              </div>

              <!-- TikTok -->
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center gap-3">
                  <svg class="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#000000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">TikTok</p>
                    <p v-if="isProviderLinked('TIKTOK')" class="text-xs text-green-600">Conectado</p>
                    <p v-else class="text-xs text-gray-500">No conectado</p>
                  </div>
                </div>
                <button
                  v-if="isProviderLinked('TIKTOK')"
                  @click="confirmUnlink('TIKTOK')"
                  :disabled="!canUnlinkProvider"
                  class="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Desvincular
                </button>
                <button
                  v-else
                  @click="linkProvider('tiktok')"
                  class="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Conectar
                </button>
              </div>

              <!-- Info message when only one provider -->
              <p v-if="!canUnlinkProvider" class="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                Debes tener al menos dos métodos de inicio de sesión antes de poder desvincular uno.
              </p>
            </div>
          </div>

          <!-- Shipping Address (for visitors) -->
          <div v-if="form.role === 'VISITOR' || form.shippingAddress">
            <h3 class="text-lg font-semibold mb-4">Dirección de Envío</h3>

            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Street Address -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    v-model="shippingAddress.street"
                    type="text"
                    class="input"
                    placeholder="Av. Principal 123"
                  />
                </div>

                <!-- District -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Distrito
                  </label>
                  <input
                    v-model="shippingAddress.district"
                    type="text"
                    class="input"
                    placeholder="Miraflores"
                  />
                </div>

                <!-- City -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    v-model="shippingAddress.city"
                    type="text"
                    class="input"
                    placeholder="Lima"
                  />
                </div>

                <!-- Postal Code -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    v-model="shippingAddress.postalCode"
                    type="text"
                    class="input"
                    placeholder="15074"
                  />
                </div>

                <!-- Reference -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Referencia
                  </label>
                  <input
                    v-model="shippingAddress.reference"
                    type="text"
                    class="input"
                    placeholder="Frente al parque"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              class="btn btn-primary flex-1"
              :disabled="saving"
            >
              <span v-if="saving" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useImageUpload } from '@/composables/useImageUpload'

const route = useRoute()
const authStore = useAuthStore()
const { getImageUrl } = useImageUpload()

const loading = ref(true)
const saving = ref(false)
const showUploadAvatar = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
  name: '',
  email: '',
  phone: '',
  profilePicture: null,
  role: 'VISITOR',
  shippingAddress: null,
  authProviders: []
})

const shippingAddress = reactive({
  street: '',
  district: '',
  city: '',
  postalCode: '',
  reference: ''
})

// Linked providers management
const linkedProviders = computed(() => {
  return form.value.authProviders || []
})

const canUnlinkProvider = computed(() => {
  return linkedProviders.value.length > 1
})

function isProviderLinked(provider) {
  return linkedProviders.value.some(p => p.provider === provider)
}

function linkProvider(provider) {
  // Get the backend base URL (without /api)
  let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  backendUrl = backendUrl.replace(/\/api\/?$/, '')

  // Get current token and redirect to link endpoint with authorization
  const token = localStorage.getItem('token')

  // Redirect to OAuth link endpoint
  // The backend will handle authentication and redirect back to profile
  window.location.href = `${backendUrl}/api/auth/link/${provider}?token=${token}`
}

async function confirmUnlink(provider) {
  if (!canUnlinkProvider.value) {
    errorMessage.value = 'Debes tener al menos dos métodos de inicio de sesión antes de poder desvincular uno.'
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
    return
  }

  const providerNames = {
    'GOOGLE': 'Google',
    'FACEBOOK': 'Facebook',
    'TIKTOK': 'TikTok'
  }

  const confirmed = confirm(`¿Estás seguro de que deseas desvincular ${providerNames[provider]}?\n\nAún podrás iniciar sesión con tus otros métodos vinculados.`)

  if (confirmed) {
    await unlinkProvider(provider)
  }
}

async function unlinkProvider(provider) {
  try {
    saving.value = true
    errorMessage.value = ''

    await authAPI.unlinkProvider(provider.toLowerCase())

    // Reload user data to update linked providers
    const response = await authAPI.getMe()
    form.value.authProviders = response.data.authProviders || []

    successMessage.value = `${provider} desvinculado correctamente`

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error unlinking provider:', error)
    errorMessage.value = error.response?.data?.error || 'Error al desvincular el proveedor'

    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const response = await authAPI.getMe()
    const user = response.data // El backend retorna el usuario directamente

    form.value = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      profilePicture: user.profilePicture,
      role: user.role,
      shippingAddress: user.shippingAddress,
      authProviders: user.authProviders || []
    }

    // Load shipping address if exists
    if (user.shippingAddress) {
      Object.assign(shippingAddress, user.shippingAddress)
    }

    // Check for OAuth linking result in URL params
    if (route.query.linked) {
      const providerNames = {
        'google': 'Google',
        'facebook': 'Facebook',
        'tiktok': 'TikTok'
      }
      const providerName = providerNames[route.query.linked] || route.query.linked
      successMessage.value = `${providerName} vinculado correctamente`

      // Clear URL params
      window.history.replaceState({}, '', '/profile')

      setTimeout(() => {
        successMessage.value = ''
      }, 5000)
    } else if (route.query.error) {
      const errorMessages = {
        'link_failed': 'Error al vincular la cuenta',
        'provider_already_linked': 'Esta cuenta ya está vinculada a otro usuario',
        'link_callback_failed': 'Error en el proceso de vinculación'
      }
      errorMessage.value = errorMessages[route.query.error] || 'Error al vincular la cuenta'

      // Clear URL params
      window.history.replaceState({}, '', '/profile')

      setTimeout(() => {
        errorMessage.value = ''
      }, 5000)
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    errorMessage.value = 'Error al cargar el perfil'
  } finally {
    loading.value = false
  }
})

const getAvatarUrl = (imageUrl) => {
  if (!imageUrl) return null
  // Si ya es una URL de Cloudflare, extraer el ID y usar el variant 'avatar'
  if (imageUrl.includes('imagedelivery.net')) {
    const matches = imageUrl.match(/imagedelivery\.net\/[^\/]+\/([^\/]+)/)
    if (matches && matches[1]) {
      return getImageUrl(matches[1], 'avatar')
    }
  }
  return imageUrl
}

const getRoleLabel = (role) => {
  const labels = {
    ADMIN: 'Administrador',
    EXHIBITOR: 'Expositor',
    VISITOR: 'Visitante'
  }
  return labels[role] || role
}

const handleAvatarUploaded = async (result) => {
  console.log('Avatar subido:', result)

  try {
    // Guardar el avatar en la base de datos inmediatamente
    await authAPI.updateProfile({ profilePicture: result.url })

    // Actualizar el formulario local
    form.value.profilePicture = result.url

    successMessage.value = 'Foto de perfil actualizada'
    showUploadAvatar.value = false
  } catch (error) {
    console.error('Error guardando avatar:', error)
    errorMessage.value = 'Error al guardar la foto de perfil'
  }

  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 3000)
}

const handleUploadError = (error) => {
  console.error('Error subiendo avatar:', error)
  errorMessage.value = 'Error al subir la imagen. Por favor intenta de nuevo.'

  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const saveProfile = async () => {
  try {
    saving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Prepare shipping address
    const hasShippingData = Object.values(shippingAddress).some(val => val)
    const shippingAddressData = hasShippingData ? { ...shippingAddress } : null

    await authAPI.updateProfile({
      name: form.value.name,
      phone: form.value.phone,
      profilePicture: form.value.profilePicture,
      shippingAddress: shippingAddressData
    })

    // Update auth store
    await authStore.fetchUser()

    successMessage.value = 'Perfil actualizado correctamente'

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error saving profile:', error)
    errorMessage.value = error.response?.data?.message || 'Error al guardar el perfil'
  } finally {
    saving.value = false
  }
}
</script>
