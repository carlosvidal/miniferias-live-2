<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <!-- Empty Cart -->
      <div v-if="cartStore.items.length === 0" class="card text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-gray-600 mb-4">Tu carrito está vacío</p>
        <router-link to="/" class="btn btn-primary">
          Ver Eventos
        </router-link>
      </div>

      <!-- Checkout Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Summary -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Resumen del Pedido</h2>
            <div class="space-y-4">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex gap-4 pb-4 border-b last:border-b-0"
              >
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-20 h-20 object-cover rounded-lg"
                />
                <div class="flex-1">
                  <h3 class="font-semibold">{{ item.name }}</h3>
                  <p class="text-sm text-gray-600">Cantidad: {{ item.quantity }}</p>
                  <p class="text-purple-600 font-semibold">S/ {{ formatPrice(item.price) }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold">S/ {{ formatPrice(item.price * item.quantity) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Dirección de Envío</h2>
            <form class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    v-model="shippingAddress.fullName"
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
                    v-model="shippingAddress.phone"
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
                  v-model="shippingAddress.street"
                  type="text"
                  required
                  class="input"
                  placeholder="Av. Principal 123"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Distrito *
                  </label>
                  <input
                    v-model="shippingAddress.district"
                    type="text"
                    required
                    class="input"
                    placeholder="Miraflores"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    v-model="shippingAddress.city"
                    type="text"
                    required
                    class="input"
                    placeholder="Lima"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    v-model="shippingAddress.postalCode"
                    type="text"
                    class="input"
                    placeholder="15074"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Referencias (opcional)
                </label>
                <textarea
                  v-model="shippingAddress.reference"
                  rows="2"
                  class="input"
                  placeholder="Frente al parque, puerta verde"
                ></textarea>
              </div>

              <div class="flex items-center gap-2">
                <input
                  v-model="saveAddress"
                  type="checkbox"
                  id="saveAddress"
                  class="rounded border-gray-300"
                />
                <label for="saveAddress" class="text-sm text-gray-700">
                  Guardar esta dirección para futuros pedidos
                </label>
              </div>
            </form>
          </div>

          <!-- Payment Method -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Método de Pago</h2>
            <div class="space-y-3">
              <label
                :class="[
                  'flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors',
                  paymentMethod === 'YAPE' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="YAPE"
                  class="text-purple-600"
                />
                <div class="flex-1">
                  <p class="font-semibold">Yape</p>
                  <p class="text-sm text-gray-600">Pago instantáneo con Yape</p>
                </div>
                <div class="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  YAPE
                </div>
              </label>

              <label
                :class="[
                  'flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors',
                  paymentMethod === 'PLIN' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="PLIN"
                  class="text-blue-600"
                />
                <div class="flex-1">
                  <p class="font-semibold">Plin</p>
                  <p class="text-sm text-gray-600">Pago instantáneo con Plin</p>
                </div>
                <div class="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  PLIN
                </div>
              </label>
            </div>

            <!-- Payment QR Code -->
            <div v-if="paymentMethod && booth" class="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 class="font-semibold mb-2 text-center">Escanea el código QR para pagar</h3>
              <div class="flex flex-col items-center">
                <div v-if="getPaymentQR()" class="bg-white p-4 rounded-lg mb-3">
                  <img
                    :src="getPaymentQR()"
                    alt="QR de pago"
                    class="w-48 h-48 object-contain"
                  />
                </div>
                <div v-else class="bg-white p-8 rounded-lg mb-3 text-center text-gray-500">
                  <p>QR no disponible</p>
                  <p class="text-sm mt-2">Número: {{ getPaymentNumber() }}</p>
                </div>
                <p class="text-sm text-gray-600 text-center">
                  Monto a pagar: <span class="font-bold text-lg text-purple-600">S/ {{ formatPrice(cartStore.total) }}</span>
                </p>
              </div>
            </div>

            <!-- Payment Proof Upload -->
            <div v-if="paymentMethod" class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Captura de Pantalla del Pago *
              </label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  class="hidden"
                  id="paymentProof"
                />
                <label for="paymentProof" class="cursor-pointer">
                  <div v-if="!paymentProofPreview">
                    <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p class="text-gray-600">Click para subir captura de pago</p>
                    <p class="text-xs text-gray-500 mt-1">PNG, JPG hasta 5MB</p>
                  </div>
                  <div v-else>
                    <img :src="paymentProofPreview" alt="Payment proof" class="max-w-xs mx-auto rounded-lg mb-2" />
                    <button type="button" @click.prevent="removePaymentProof" class="text-sm text-red-600 hover:text-red-700">
                      Cambiar imagen
                    </button>
                  </div>
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Sube una captura de pantalla que muestre tu pago completado
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Total -->
        <div class="lg:col-span-1">
          <div class="card sticky top-4">
            <h2 class="text-xl font-bold mb-4">Total del Pedido</h2>

            <div class="space-y-2 mb-4 pb-4 border-b">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>S/ {{ formatPrice(cartStore.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>A coordinar</span>
              </div>
            </div>

            <div class="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span class="text-purple-600">S/ {{ formatPrice(cartStore.total) }}</span>
            </div>

            <button
              @click="handleCheckout"
              :disabled="!canCheckout || submitting"
              class="btn btn-primary w-full"
            >
              {{ submitting ? 'Procesando...' : 'Confirmar Pedido' }}
            </button>

            <p class="text-xs text-gray-500 mt-4 text-center">
              Al confirmar, aceptas nuestros términos y condiciones
            </p>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mt-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
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
import { useBoothsStore } from '@/stores/booths'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/shared/AppHeader.vue'

const router = useRouter()
const cartStore = useCartStore()
const boothsStore = useBoothsStore()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

const booth = ref(null)
const paymentMethod = ref('')
const paymentProofFile = ref(null)
const paymentProofPreview = ref(null)
const saveAddress = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

const shippingAddress = ref({
  fullName: '',
  phone: '',
  street: '',
  district: '',
  city: '',
  postalCode: '',
  reference: ''
})

const canCheckout = computed(() => {
  return (
    shippingAddress.value.fullName &&
    shippingAddress.value.phone &&
    shippingAddress.value.street &&
    shippingAddress.value.district &&
    shippingAddress.value.city &&
    paymentMethod.value &&
    paymentProofFile.value
  )
})

onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/checkout')
    return
  }

  // Fetch booth data for payment QR
  if (cartStore.boothId) {
    try {
      booth.value = await boothsStore.fetchBoothById(cartStore.boothId)
    } catch (error) {
      console.error('Error loading booth:', error)
    }
  }

  // Load saved shipping address if available
  if (authStore.user?.shippingAddress) {
    shippingAddress.value = { ...authStore.user.shippingAddress }
  }
})

function getPaymentQR() {
  if (!booth.value) return null
  return paymentMethod.value === 'YAPE' ? booth.value.yapeQR : booth.value.plinQR
}

function getPaymentNumber() {
  if (!booth.value) return ''
  return paymentMethod.value === 'YAPE' ? booth.value.yapeNumber : booth.value.plinNumber
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'La imagen no debe superar 5MB'
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Solo se permiten archivos de imagen'
    return
  }

  paymentProofFile.value = file
  errorMessage.value = ''

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
  document.getElementById('paymentProof').value = ''
}

async function uploadPaymentProof() {
  if (!paymentProofFile.value) return null

  const formData = new FormData()
  formData.append('file', paymentProofFile.value)

  try {
    // TODO: Implement actual file upload to storage service (Supabase Storage)
    // For now, return the preview URL as placeholder
    return paymentProofPreview.value
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    throw new Error('Error al subir comprobante de pago')
  }
}

async function handleCheckout() {
  if (!canCheckout.value) {
    errorMessage.value = 'Por favor completa todos los campos requeridos'
    return
  }

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
      shippingAddress: shippingAddress.value,
      paymentMethod: paymentMethod.value,
      paymentProof: paymentProofUrl,
      saveShippingAddress: saveAddress.value
    }

    console.log('Creating order:', orderData)

    // Create order
    const response = await ordersStore.createOrder(orderData)

    // Clear cart
    cartStore.clear()

    // Redirect to order confirmation
    router.push(`/orders/${response.order.id}`)
  } catch (error) {
    console.error('Checkout error:', error)
    errorMessage.value = error.response?.data?.error || error.message || 'Error al procesar el pedido'
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
