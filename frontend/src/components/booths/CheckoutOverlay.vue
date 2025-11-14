<template>
  <!-- Checkout Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative flex h-[100dvh] w-full max-w-lg mx-auto flex-col overflow-hidden bg-[#f8f6f7]/95 dark:bg-[#221019]/95 backdrop-blur-md text-gray-900 dark:text-white"
            @click.stop
          >
            <!-- Header -->
            <header class="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                @click="emit('close')"
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
            <main class="flex-1 overflow-y-auto">
              <div class="p-4 space-y-6">
                <!-- Order Summary -->
                <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h2 class="text-base font-semibold mb-3">Resumen del pedido</h2>

                  <!-- Cart Items -->
                  <div class="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div
                      v-for="item in cartStore.items"
                      :key="item.id"
                      class="flex gap-3"
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

                  <!-- Totals -->
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

                <!-- Delivery Options -->
                <div>
                  <h2 class="text-base font-semibold mb-3">Opciones de entrega</h2>
                  <div class="space-y-3">
                    <label
                      class="flex items-center p-4 border rounded-lg cursor-pointer transition-all bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                      :class="deliveryOption === 'pickup'
                        ? 'border-[#ee2b8c] ring-2 ring-[#ee2b8c] bg-pink-50/90 dark:bg-pink-900/30'
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
                      class="flex items-center p-4 border rounded-lg cursor-pointer transition-all bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                      :class="deliveryOption === 'delivery'
                        ? 'border-[#ee2b8c] ring-2 ring-[#ee2b8c] bg-pink-50/90 dark:bg-pink-900/30'
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
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#ee2b8c] focus:ring-2 focus:ring-[#ee2b8c] focus:ring-opacity-50 transition-colors"
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
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#ee2b8c] focus:ring-2 focus:ring-[#ee2b8c] focus:ring-opacity-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100/90 dark:disabled:bg-gray-900/90"
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
                          class="w-full px-4 py-2.5 pl-14 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#ee2b8c] focus:ring-2 focus:ring-[#ee2b8c] focus:ring-opacity-50 transition-colors"
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
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#ee2b8c] focus:ring-2 focus:ring-[#ee2b8c] focus:ring-opacity-50 transition-colors"
                      />
                      <p v-if="deliveryOption === 'pickup'" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Opcional para recojo en tienda
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Terms and Conditions -->
                <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <label class="flex items-start gap-3 cursor-pointer">
                    <input
                      v-model="acceptedTerms"
                      type="checkbox"
                      class="form-checkbox h-5 w-5 text-[#ee2b8c] rounded border-gray-300 dark:border-gray-600 focus:ring-[#ee2b8c] focus:ring-2 focus:ring-opacity-50 mt-0.5"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      Acepto los
                      <a href="#" @click.prevent class="text-[#ee2b8c] hover:underline">términos y condiciones</a>
                      y la
                      <a href="#" @click.prevent class="text-[#ee2b8c] hover:underline">política de privacidad</a>
                    </span>
                  </label>
                  <p v-if="!authStore.isAuthenticated" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Se creará una cuenta automáticamente con tu email
                  </p>
                </div>

                <!-- Error Message -->
                <div v-if="errorMessage" class="p-3 bg-red-50/90 dark:bg-red-900/30 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
                  {{ errorMessage }}
                </div>

                <!-- Submit Button -->
                <button
                  @click="handleSubmit"
                  :disabled="!canSubmit || submitting"
                  class="w-full rounded-full bg-[#ee2b8c] py-3.5 text-center font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
                >
                  {{ submitting ? 'Procesando...' : 'Confirmar Pedido' }}
                </button>

                <!-- Bottom padding for safe area -->
                <div class="h-4"></div>
              </div>
            </main>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'checkout-complete'])

const cartStore = useCartStore()
const authStore = useAuthStore()

const deliveryOption = ref('pickup')
const form = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const acceptedTerms = ref(false)
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
  return basicFields && addressRequired && acceptedTerms.value
})

// Load user data when opened
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && authStore.isAuthenticated && authStore.user) {
    form.value.name = authStore.user.name || ''
    form.value.email = authStore.user.email || ''
    form.value.phone = authStore.user.phone || ''

    if (authStore.user.shippingAddress) {
      const saved = authStore.user.shippingAddress
      form.value.address = saved.address || ''
    }
  }
})

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  errorMessage.value = ''

  try {
    let response

    if (authStore.isAuthenticated) {
      response = await api.post('/orders', {
        boothId: cartStore.boothId,
        items: cartStore.items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: form.value.name,
          phone: form.value.phone,
          address: form.value.address,
          deliveryOption: deliveryOption.value
        },
        paymentMethod: 'pending',
        saveShippingAddress: true
      })
    } else {
      response = await api.post('/orders/guest-checkout', {
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
      })

      if (response.data.token) {
        authStore.setToken(response.data.token)
        authStore.setUser(response.data.user)
      }
    }

    const orderId = response.data.order.id

    // Clear cart
    cartStore.clear()

    // Emit event with order ID
    emit('checkout-complete', orderId)
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
