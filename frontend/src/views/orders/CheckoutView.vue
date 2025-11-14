<template>
  <div class="relative flex h-[100dvh] w-full max-w-lg mx-auto flex-col overflow-hidden bg-[#f8f6f7] dark:bg-[#221019] text-gray-900 dark:text-white">
    <!-- Header -->
    <header class="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <button
        @click="goBack"
        class="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="flex-1 text-center text-lg font-bold">Checkout</h1>
      <div class="w-10"></div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4">
      <!-- Empty Cart -->
      <div v-if="cartStore.items.length === 0" class="flex flex-col items-center justify-center h-full">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Tu carrito está vacío</p>
        <button @click="$router.push('/')" class="px-6 py-2 bg-[#ee2b8c] text-white rounded-full font-semibold hover:bg-pink-600 transition-colors">
          Ver Eventos
        </button>
      </div>

      <!-- Checkout Form -->
      <div v-else class="space-y-6">
        <!-- Cart Summary -->
        <div>
          <h2 class="text-base font-semibold mb-3">Resumen del pedido</h2>
          <div class="space-y-3">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="w-16 h-16 object-cover rounded-lg"
              />
              <div class="flex-1">
                <h3 class="font-medium text-sm text-gray-900 dark:text-white">{{ item.name }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Cantidad: {{ item.quantity }}</p>
                <p class="text-[#ee2b8c] font-semibold">S/ {{ formatPrice(item.price * item.quantity) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery Options -->
        <div>
          <h2 class="text-base font-semibold mb-3">Opciones de entrega</h2>
          <div class="space-y-3">
            <label
              class="flex items-center p-4 border rounded-lg cursor-pointer transition-all bg-white dark:bg-gray-800"
              :class="deliveryOption === 'pickup'
                ? 'border-[#ee2b8c] ring-2 ring-[#ee2b8c] bg-pink-50 dark:bg-pink-900/20'
                : 'border-gray-300 dark:border-gray-600'"
            >
              <div class="flex-1">
                <p class="font-semibold text-gray-900 dark:text-white">Recoger (Gratis)</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Recoge tu pedido en la tienda.</p>
              </div>
              <input
                v-model="deliveryOption"
                type="radio"
                value="pickup"
                class="form-radio h-5 w-5 text-[#ee2b8c] focus:ring-[#ee2b8c] border-gray-300 dark:border-gray-600"
              />
            </label>
            <label
              class="flex items-center p-4 border rounded-lg cursor-pointer transition-all bg-white dark:bg-gray-800"
              :class="deliveryOption === 'delivery'
                ? 'border-[#ee2b8c] ring-2 ring-[#ee2b8c] bg-pink-50 dark:bg-pink-900/20'
                : 'border-gray-300 dark:border-gray-600'"
            >
              <div class="flex-1">
                <p class="font-semibold text-gray-900 dark:text-white">Recibir (+ S/ 10.00)</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Recibe tu pedido en tu dirección.</p>
              </div>
              <input
                v-model="deliveryOption"
                type="radio"
                value="delivery"
                class="form-radio h-5 w-5 text-[#ee2b8c] focus:ring-[#ee2b8c] border-gray-300 dark:border-gray-600"
              />
            </label>
          </div>
        </div>

        <!-- Contact Information -->
        <div>
          <h2 class="text-base font-semibold mb-3">Información de contacto</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300" for="name">
                Nombre
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                placeholder="Ingresa tu nombre completo"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#ee2b8c] focus:ring-2 focus:ring-[#ee2b8c] focus:ring-opacity-50 transition-colors"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300" for="email">
                Email
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                :disabled="authStore.isAuthenticated"
                placeholder="Ingresa tu correo electrónico"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#ee2b8c] focus:ring-2 focus:ring-[#ee2b8c] focus:ring-opacity-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900"
              />
              <p v-if="authStore.isAuthenticated" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email de tu cuenta actual
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300" for="phone">
                Teléfono
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span class="text-gray-500 dark:text-gray-400">+51</span>
                </div>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  pattern="[0-9]{9}"
                  required
                  placeholder="987 654 321"
                  title="El número de teléfono debe tener 9 dígitos."
                  class="w-full px-4 py-2.5 pl-14 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#ee2b8c] focus:ring-2 focus:ring-[#ee2b8c] focus:ring-opacity-50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300" for="address">
                Dirección
              </label>
              <input
                id="address"
                v-model="form.address"
                type="text"
                :required="deliveryOption === 'delivery'"
                placeholder="Ingresa tu dirección"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#ee2b8c] focus:ring-2 focus:ring-[#ee2b8c] focus:ring-opacity-50 transition-colors"
              />
              <p v-if="deliveryOption === 'pickup'" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Opcional para recojo en tienda
              </p>
            </div>
          </div>
        </div>

        <!-- Order Total -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal ({{ cartStore.totalItems }} items)</span>
              <span>S/ {{ formatPrice(cartStore.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Envío</span>
              <span>S/ {{ formatPrice(shippingCost) }}</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-lg font-bold">
              <span class="text-gray-900 dark:text-white">Total</span>
              <span class="text-[#ee2b8c]">S/ {{ formatPrice(totalWithShipping) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer v-if="cartStore.items.length > 0" class="p-4 border-t border-gray-200 dark:border-gray-700 bg-[#f8f6f7] dark:bg-[#221019]">
      <button
        @click="handleSubmit"
        :disabled="!canSubmit || submitting"
        class="w-full rounded-full bg-[#ee2b8c] py-3.5 text-center font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
      >
        {{ submitting ? 'Procesando...' : 'Enviar' }}
      </button>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
        {{ errorMessage }}
      </div>

      <!-- Success for guest users -->
      <p v-if="!authStore.isAuthenticated" class="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
        Se creará una cuenta automáticamente con tu email
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const deliveryOption = ref('pickup')
const form = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const submitting = ref(false)
const errorMessage = ref('')

// Computed
const shippingCost = computed(() => {
  return deliveryOption.value === 'delivery' ? 10.00 : 0.00
})

const totalWithShipping = computed(() => {
  return cartStore.total + shippingCost.value
})

const canSubmit = computed(() => {
  const basicFields = form.value.name && form.value.email && form.value.phone
  const addressRequired = deliveryOption.value === 'delivery' ? form.value.address : true
  return basicFields && addressRequired
})

// Load user data if authenticated
onMounted(() => {
  if (authStore.isAuthenticated && authStore.user) {
    form.value.name = authStore.user.name || ''
    form.value.email = authStore.user.email || ''
    form.value.phone = authStore.user.phone || ''

    // Load saved shipping address if available
    if (authStore.user.shippingAddress) {
      const saved = authStore.user.shippingAddress
      form.value.address = saved.address || ''
    }
  }
})

function goBack() {
  router.back()
}

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  errorMessage.value = ''

  try {
    const orderData = {
      boothId: cartStore.boothId,
      items: cartStore.items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      contactInfo: {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        address: form.value.address
      },
      deliveryOption: deliveryOption.value,
      shippingCost: shippingCost.value
    }

    let response

    if (authStore.isAuthenticated) {
      // Authenticated user - use regular order creation
      response = await api.post('/orders', {
        ...orderData,
        shippingAddress: {
          name: form.value.name,
          phone: form.value.phone,
          address: form.value.address
        },
        paymentMethod: 'pending', // Will be handled in next step
        saveShippingAddress: true
      })
    } else {
      // Guest user - use guest checkout endpoint
      response = await api.post('/orders/guest-checkout', orderData)

      // Auto-login the user with the returned token
      if (response.data.token) {
        authStore.setToken(response.data.token)
        authStore.setUser(response.data.user)
      }
    }

    const orderId = response.data.order.id

    // Clear cart
    cartStore.clear()

    // Navigate to order confirmation
    router.push(`/orders/${orderId}/confirmation`)
  } catch (error) {
    console.error('Checkout error:', error)
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
