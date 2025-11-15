<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Mi Perfil</h1>

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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import AppHeader from '@/components/shared/AppHeader.vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useImageUpload } from '@/composables/useImageUpload'

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
  shippingAddress: null
})

const shippingAddress = reactive({
  street: '',
  district: '',
  city: '',
  postalCode: '',
  reference: ''
})

onMounted(async () => {
  try {
    loading.value = true
    const response = await authAPI.getMe()
    const user = response.data.user

    form.value = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      profilePicture: user.profilePicture,
      role: user.role,
      shippingAddress: user.shippingAddress
    }

    // Load shipping address if exists
    if (user.shippingAddress) {
      Object.assign(shippingAddress, user.shippingAddress)
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

const handleAvatarUploaded = (result) => {
  console.log('Avatar subido:', result)
  successMessage.value = 'Foto de perfil actualizada'
  showUploadAvatar.value = false

  setTimeout(() => {
    successMessage.value = ''
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
