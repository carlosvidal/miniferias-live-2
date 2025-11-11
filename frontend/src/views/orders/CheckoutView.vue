<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="container mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
        <p class="text-gray-600">Completa la información para procesar tu pedido</p>
      </div>

      <!-- Empty Cart -->
      <div v-if="cartStore.items.length === 0" class="card text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p class="text-gray-600 mb-4">Tu carrito está vacío</p>
        <router-link to="/" class="btn btn-primary">
          Ver Eventos
        </router-link>
      </div>

      <!-- Checkout Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Forms -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Cart Summary -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Resumen del Pedido</h2>
            <div class="space-y-3">
              <div v-for="item in cartStore.items" :key="item.id" class="flex gap-4">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-20 h-20 object-cover rounded-lg"
                />
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{{ item.name }}</h3>
                  <p class="text-sm text-gray-500">Cantidad: {{ item.quantity }}</p>
                  <p class="text-purple-600 font-medium">S/ {{ formatPrice(item.price * item.quantity) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Information -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Información de Envío</h2>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    v-model="shippingForm.name"
                    type="text"
                    required
                    class="input"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    v-model="shippingForm.phone"
                    type="tel"
                    required
                    class="input"
                    placeholder="987654321"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  v-model="shippingForm.address"
                  type="text"
                  required
                  class="input"
                  placeholder="Av. Principal 123"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    v-model="shippingForm.city"
                    type="text"
                    required
                    class="input"
                    placeholder="Lima"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Distrito *
                  </label>
                  <input
                    v-model="shippingForm.district"
                    type="text"
                    required
                    class="input"
                    placeholder="Miraflores"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Referencia
                </label>
                <textarea
                  v-model="shippingForm.reference"
                  rows="2"
                  class="input"
                  placeholder="Casa de color blanco, al costado de la panadería..."
                ></textarea>
              </div>

              <div class="flex items-center">
                <input
                  v-model="saveAddress"
                  type="checkbox"
                  id="save-address"
                  class="w-4 h-4 text-purple-600 rounded"
                />
                <label for="save-address" class="ml-2 text-sm text-gray-700">
                  Guardar esta dirección para futuras compras
                </label>
              </div>
            </form>
          </div>

          <!-- Payment Method -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Método de Pago</h2>

            <div class="space-y-3 mb-4">
              <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'border-purple-600 bg-purple-50': paymentMethod === 'yape' }"
              >
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="yape"
                  class="w-4 h-4 text-purple-600"
                />
                <span class="ml-3 font-medium">Yape</span>
              </label>

              <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'border-purple-600 bg-purple-50': paymentMethod === 'plin' }"
              >
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="plin"
                  class="w-4 h-4 text-purple-600"
                />
                <span class="ml-3 font-medium">Plin</span>
              </label>
            </div>

            <!-- QR Code Display -->
            <div v-if="paymentMethod && boothPaymentInfo" class="border-t pt-4">
              <h3 class="font-semibold text-gray-900 mb-3">Escanea el QR para pagar</h3>

              <div v-if="paymentMethod === 'yape' && boothPaymentInfo.yapeQR" class="text-center">
                <img
                  :src="boothPaymentInfo.yapeQR"
                  alt="Yape QR"
                  class="mx-auto w-64 h-64 object-contain border rounded-lg mb-3"
                />
                <p class="text-sm text-gray-600">
                  Número: <span class="font-medium">{{ boothPaymentInfo.yapeNumber }}</span>
                </p>
              </div>

              <div v-else-if="paymentMethod === 'plin' && boothPaymentInfo.plinQR" class="text-center">
                <img
                  :src="boothPaymentInfo.plinQR"
                  alt="Plin QR"
                  class="mx-auto w-64 h-64 object-contain border rounded-lg mb-3"
                />
                <p class="text-sm text-gray-600">
                  Número: <span class="font-medium">{{ boothPaymentInfo.plinNumber }}</span>
                </p>
              </div>

              <div v-else class="bg-yellow-50 text-yellow-700 p-4 rounded-lg text-sm">
                ⚠️ El vendedor no ha configurado este método de pago. Por favor, contacta al booth.
              </div>

              <!-- Payment Proof Upload -->
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de Pago *
                </label>
                <p class="text-xs text-gray-500 mb-3">
                  Sube una captura de pantalla de tu pago realizado
                </p>

                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleFileSelect"
                    class="hidden"
                  />

                  <div v-if="!paymentProofPreview" @click="$refs.fileInput.click()" class="cursor-pointer">
                    <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="text-sm text-gray-600">Click para subir imagen</p>
                    <p class="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                  </div>

                  <div v-else class="relative">
                    <img :src="paymentProofPreview" alt="Preview" class="max-w-full h-64 object-contain mx-auto rounded" />
                    <button
                      type="button"
                      @click="removePaymentProof"
                      class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p v-if="uploadError" class="text-red-600 text-sm mt-2">{{ uploadError }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Summary -->
        <div class="lg:col-span-1">
          <div class="card sticky top-4">
            <h2 class="text-xl font-bold mb-4">Total del Pedido</h2>

            <div class="space-y-3 mb-4">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal ({{ cartStore.totalItems }} items)</span>
                <span>S/ {{ formatPrice(cartStore.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>S/ 0.00</span>
              </div>
              <div class="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span class="text-purple-600">S/ {{ formatPrice(cartStore.total) }}</span>
              </div>
            </div>

            <button
              @click="handleSubmit"
              :disabled="!canSubmit || submitting"
              class="btn btn-primary w-full text-lg"
            >
              {{ submitting ? 'Procesando...' : 'Confirmar Pedido' }}
            </button>

            <p class="text-xs text-gray-500 text-center mt-4">
              Al confirmar tu pedido, aceptas nuestros términos y condiciones
            </p>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/shared/AppHeader.vue'
import api from '@/services/api'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const shippingForm = ref({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  address: '',
  city: '',
  district: '',
  reference: ''
})

const saveAddress = ref(false)
const paymentMethod = ref('yape')
const paymentProofFile = ref(null)
const paymentProofPreview = ref(null)
const uploadError = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const boothPaymentInfo = ref(null)

const fileInput = ref(null)

// Check if form can be submitted
const canSubmit = computed(() => {
  return (
    shippingForm.value.name &&
    shippingForm.value.phone &&
    shippingForm.value.address &&
    shippingForm.value.city &&
    shippingForm.value.district &&
    paymentMethod.value &&
    paymentProofFile.value
  )
})

// Load booth payment info
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (cartStore.items.length === 0) {
    return
  }

  // Fetch booth payment information
  try {
    const response = await api.get(`/booths/${cartStore.boothId}`)
    boothPaymentInfo.value = {
      yapeNumber: response.data.yapeNumber,
      yapeQR: response.data.yapeQR,
      plinNumber: response.data.plinNumber,
      plinQR: response.data.plinQR
    }
  } catch (error) {
    console.error('Error loading booth payment info:', error)
  }

  // Load saved shipping address if available
  if (authStore.user?.shippingAddress) {
    const saved = authStore.user.shippingAddress
    shippingForm.value = {
      name: saved.name || authStore.user.name,
      phone: saved.phone || authStore.user.phone,
      address: saved.address || '',
      city: saved.city || '',
      district: saved.district || '',
      reference: saved.reference || ''
    }
  }
})

function handleFileSelect(event) {
  const file = event.target.files[0]
  uploadError.value = ''

  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'El archivo no debe superar los 5MB'
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Solo se permiten archivos de imagen'
    return
  }

  paymentProofFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    paymentProofPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removePaymentProof() {
  paymentProofFile.value = null
  paymentProofPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadPaymentProof() {
  if (!paymentProofFile.value) return null

  const formData = new FormData()
  formData.append('file', paymentProofFile.value)

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data.url
  } catch (error) {
    throw new Error('Error al subir el comprobante de pago')
  }
}

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  errorMessage.value = ''

  try {
    // Upload payment proof
    const paymentProofUrl = await uploadPaymentProof()

    // Prepare order data
    const orderData = {
      boothId: cartStore.boothId,
      items: cartStore.items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      shippingAddress: shippingForm.value,
      paymentMethod: paymentMethod.value,
      paymentProof: paymentProofUrl,
      saveShippingAddress: saveAddress.value
    }

    // Create order
    const response = await api.post('/orders', orderData)
    const orderId = response.data.order.id

    // Clear cart
    cartStore.clear()

    // Redirect to confirmation page
    router.push(`/orders/${orderId}/confirmation`)
  } catch (error) {
    console.error('Order creation error:', error)
    errorMessage.value = error.response?.data?.error || 'Error al procesar el pedido. Por favor, intenta nuevamente.'
  } finally {
    submitting.value = false
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}
</script>
