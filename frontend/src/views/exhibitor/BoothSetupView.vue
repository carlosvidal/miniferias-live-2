<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Configuración de Mi Booth</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <!-- No Booth Assigned -->
    <div v-else-if="!booth && !error" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="text-xl font-semibold mb-2">No tienes un booth asignado</h3>
      <p class="text-gray-600">Contacta al administrador para que te asigne un booth.</p>
    </div>

    <!-- Booth Configuration -->
    <div v-else-if="booth" class="space-y-6">
      <!-- Booth Info Card -->
      <div class="card">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-2xl font-semibold mb-2">{{ booth.name }}</h2>
            <p class="text-gray-600">{{ booth.description }}</p>
          </div>
          <button @click="editMode = true" class="btn btn-primary">
            Editar Información
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Banner -->
          <div class="md:col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-2">Banner del Booth</label>
            <div v-if="booth.bannerUrl" class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img :src="booth.bannerUrl" :alt="booth.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
              <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <!-- Event Info -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Evento</label>
            <p class="text-lg">{{ booth.event?.title || 'Sin evento' }}</p>
          </div>

          <!-- Products Count -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Productos</label>
            <p class="text-lg font-semibold">{{ booth._count?.products || 0 }} productos</p>
          </div>

          <!-- Live Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div class="flex items-center gap-2">
              <span
                :class="booth.isLive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'"
                class="px-3 py-1 text-sm font-medium rounded-full flex items-center gap-2"
              >
                <span v-if="booth.isLive" class="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                {{ booth.isLive ? 'En Vivo' : 'Offline' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Configuration -->
      <div class="card">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold mb-1">Métodos de Pago</h2>
            <p class="text-sm text-gray-600">Configura tus métodos de pago para recibir pedidos</p>
          </div>
          <button @click="editPaymentMode = true" class="btn btn-secondary text-sm">
            Editar
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Yape -->
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
              Yape
            </h3>
            <div v-if="booth.yapeQR || booth.yapeNumber" class="space-y-3">
              <div v-if="booth.yapeQR" class="bg-gray-100 rounded-lg p-3">
                <img :src="booth.yapeQR" alt="Yape QR" class="w-48 h-48 object-contain mx-auto" />
              </div>
              <div v-if="booth.yapeNumber">
                <p class="text-sm text-gray-600">Número:</p>
                <p class="font-medium">{{ booth.yapeNumber }}</p>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">
              No configurado
            </div>
          </div>

          <!-- Plin -->
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
              Plin
            </h3>
            <div v-if="booth.plinQR || booth.plinNumber" class="space-y-3">
              <div v-if="booth.plinQR" class="bg-gray-100 rounded-lg p-3">
                <img :src="booth.plinQR" alt="Plin QR" class="w-48 h-48 object-contain mx-auto" />
              </div>
              <div v-if="booth.plinNumber">
                <p class="text-sm text-gray-600">Número:</p>
                <p class="font-medium">{{ booth.plinNumber }}</p>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">
              No configurado
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <router-link to="/exhibitor/products" class="card hover:shadow-lg transition-shadow text-center">
          <svg class="w-12 h-12 mx-auto text-purple-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="font-semibold mb-1">Gestionar Productos</h3>
          <p class="text-sm text-gray-600">Agrega y edita productos</p>
        </router-link>

        <router-link to="/exhibitor/orders" class="card hover:shadow-lg transition-shadow text-center">
          <svg class="w-12 h-12 mx-auto text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="font-semibold mb-1">Ver Pedidos</h3>
          <p class="text-sm text-gray-600">Gestiona tus pedidos</p>
        </router-link>

        <router-link to="/exhibitor/live" class="card hover:shadow-lg transition-shadow text-center">
          <svg class="w-12 h-12 mx-auto text-red-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 class="font-semibold mb-1">Transmitir en Vivo</h3>
          <p class="text-sm text-gray-600">Inicia tu livestream</p>
        </router-link>
      </div>
    </div>

    <!-- Payment Edit Modal -->
    <div
      v-if="editPaymentMode"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closePaymentEditModal"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-6">Configurar Métodos de Pago</h2>

          <form @submit.prevent="handleUpdatePayment" class="space-y-6">
            <!-- Yape Section -->
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-4">Yape</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Número de Yape
                  </label>
                  <input
                    v-model="paymentForm.yapeNumber"
                    type="text"
                    class="input"
                    placeholder="987654321"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    URL del QR de Yape
                  </label>
                  <input
                    v-model="paymentForm.yapeQR"
                    type="url"
                    class="input"
                    placeholder="https://ejemplo.com/yape-qr.jpg"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Sube tu imagen de QR a un servicio como Imgur y pega el enlace aquí
                  </p>
                </div>
              </div>
            </div>

            <!-- Plin Section -->
            <div class="border rounded-lg p-4">
              <h3 class="font-semibold mb-4">Plin</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Número de Plin
                  </label>
                  <input
                    v-model="paymentForm.plinNumber"
                    type="text"
                    class="input"
                    placeholder="987654321"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    URL del QR de Plin
                  </label>
                  <input
                    v-model="paymentForm.plinQR"
                    type="url"
                    class="input"
                    placeholder="https://ejemplo.com/plin-qr.jpg"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Sube tu imagen de QR a un servicio como Imgur y pega el enlace aquí
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="paymentErrorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {{ paymentErrorMessage }}
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                :disabled="updatingPayment"
                class="btn btn-primary flex-1"
              >
                {{ updatingPayment ? 'Guardando...' : 'Guardar Métodos de Pago' }}
              </button>
              <button
                type="button"
                @click="closePaymentEditModal"
                class="btn btn-secondary flex-1"
                :disabled="updatingPayment"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Booth Modal -->
    <div
      v-if="editMode"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditModal"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-6">Editar Booth</h2>

          <form @submit.prevent="handleUpdate" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Booth *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input"
                placeholder="Nombre de tu booth"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                v-model="form.description"
                required
                rows="4"
                class="input"
                placeholder="Describe tu booth y lo que ofreces..."
              ></textarea>
            </div>

            <!-- Banner URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                URL del Banner
              </label>
              <input
                v-model="form.bannerUrl"
                type="url"
                class="input"
                placeholder="https://ejemplo.com/banner.jpg"
              />
              <p class="text-xs text-gray-500 mt-1">
                Puedes subir tu imagen a Imgur, Cloudinary u otro servicio y pegar el enlace aquí
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {{ errorMessage }}
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                :disabled="updating"
                class="btn btn-primary flex-1"
              >
                {{ updating ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
              <button
                type="button"
                @click="closeEditModal"
                class="btn btn-secondary flex-1"
                :disabled="updating"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card bg-red-50 text-red-600">
      <p>{{ error }}</p>
      <button @click="loadBooth" class="btn btn-primary mt-4">Reintentar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBoothsStore } from '@/stores/booths'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const boothsStore = useBoothsStore()

const loading = ref(true)
const error = ref(null)
const booth = ref(null)
const editMode = ref(false)
const updating = ref(false)
const errorMessage = ref('')

const form = ref({
  name: '',
  description: '',
  bannerUrl: ''
})

const editPaymentMode = ref(false)
const updatingPayment = ref(false)
const paymentErrorMessage = ref('')

const paymentForm = ref({
  yapeNumber: '',
  yapeQR: '',
  plinNumber: '',
  plinQR: ''
})

onMounted(() => {
  loadBooth()
})

async function loadBooth() {
  loading.value = true
  error.value = null

  try {
    const response = await boothsStore.fetchMyBooth()
    booth.value = response
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar el booth'
  } finally {
    loading.value = false
  }
}

function openEditModal() {
  form.value = {
    name: booth.value.name,
    description: booth.value.description,
    bannerUrl: booth.value.bannerUrl || ''
  }
  editMode.value = true
}

function closeEditModal() {
  editMode.value = false
  form.value = {
    name: '',
    description: '',
    bannerUrl: ''
  }
  errorMessage.value = ''
}

async function handleUpdate() {
  updating.value = true
  errorMessage.value = ''

  try {
    const data = {
      name: form.value.name,
      description: form.value.description,
      bannerUrl: form.value.bannerUrl || null
    }

    await boothsStore.updateBooth(booth.value.id, data)
    await loadBooth()
    closeEditModal()
  } catch (err) {
    errorMessage.value = err.response?.data?.error || 'Error al actualizar el booth'
  } finally {
    updating.value = false
  }
}

function openPaymentEditModal() {
  paymentForm.value = {
    yapeNumber: booth.value.yapeNumber || '',
    yapeQR: booth.value.yapeQR || '',
    plinNumber: booth.value.plinNumber || '',
    plinQR: booth.value.plinQR || ''
  }
  editPaymentMode.value = true
}

function closePaymentEditModal() {
  editPaymentMode.value = false
  paymentForm.value = {
    yapeNumber: '',
    yapeQR: '',
    plinNumber: '',
    plinQR: ''
  }
  paymentErrorMessage.value = ''
}

async function handleUpdatePayment() {
  updatingPayment.value = true
  paymentErrorMessage.value = ''

  try {
    const data = {
      yapeNumber: paymentForm.value.yapeNumber || null,
      yapeQR: paymentForm.value.yapeQR || null,
      plinNumber: paymentForm.value.plinNumber || null,
      plinQR: paymentForm.value.plinQR || null
    }

    await boothsStore.updateBooth(booth.value.id, data)
    await loadBooth()
    closePaymentEditModal()
  } catch (err) {
    paymentErrorMessage.value = err.response?.data?.error || 'Error al actualizar los métodos de pago'
  } finally {
    updatingPayment.value = false
  }
}
</script>
