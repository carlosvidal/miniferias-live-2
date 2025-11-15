<template>
  <div class="relative flex h-[100dvh] w-full max-w-lg mx-auto flex-col overflow-hidden bg-[#f8f6f7] dark:bg-[#221019] text-gray-900 dark:text-white">
    <!-- Header -->
    <header class="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700">
      <h1 class="text-lg font-bold">Pedido Confirmado</h1>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="inline-block w-12 h-12 border-4 border-gray-300 border-t-[#ee2b8c] rounded-full animate-spin mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center h-full p-4">
        <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-600 dark:text-red-400 text-center mb-4">{{ error }}</p>
        <button @click="$router.push('/')" class="px-6 py-2 bg-[#ee2b8c] text-white rounded-full font-semibold hover:bg-pink-600 transition-colors">
          Volver al inicio
        </button>
      </div>

      <!-- Success State -->
      <div v-else-if="order" class="p-4 space-y-6">
        <!-- Success Icon -->
        <div class="text-center py-6">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg class="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold mb-2">¡Gracias por tu pedido!</h2>
          <p class="text-gray-600 dark:text-gray-400">
            Pedido #{{ order.orderNumber }}
          </p>
        </div>

        <!-- Order Summary -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold mb-3">Resumen del pedido</h3>

          <div class="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex gap-3"
            >
              <img
                v-if="item.productImage"
                :src="item.productImage"
                :alt="item.productName"
                class="w-12 h-12 object-cover rounded-lg"
              />
              <div class="flex-1">
                <h4 class="font-medium text-sm text-gray-900 dark:text-white">{{ item.productName }}</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400">Cantidad: {{ item.quantity }}</p>
                <p class="text-[#ee2b8c] font-semibold text-sm">S/ {{ formatPrice(item.subtotal) }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>S/ {{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Envío</span>
              <span>S/ {{ formatPrice(order.shipping) }}</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-lg font-bold">
              <span class="text-gray-900 dark:text-white">Total</span>
              <span class="text-[#ee2b8c]">S/ {{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Info -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold mb-3">Información de entrega</h3>
          <div class="space-y-2 text-sm">
            <p class="text-gray-700 dark:text-gray-300">
              <span class="font-medium">Nombre:</span> {{ order.shippingAddress.name }}
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <span class="font-medium">Teléfono:</span> {{ order.shippingAddress.phone }}
            </p>
            <p v-if="order.shippingAddress.deliveryOption === 'delivery'" class="text-gray-700 dark:text-gray-300">
              <span class="font-medium">Dirección:</span> {{ order.shippingAddress.address }}
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <span class="font-medium">Tipo:</span>
              {{ order.shippingAddress.deliveryOption === 'pickup' ? 'Recoger en tienda' : 'Entrega a domicilio' }}
            </p>
          </div>
        </div>

        <!-- Payment Instructions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold mb-3">Instrucciones de pago</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Realiza tu pago usando alguna de las siguientes opciones:
          </p>

          <div class="space-y-4">
            <!-- Yape -->
            <div v-if="booth.yapeNumber" class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  Y
                </div>
                <span class="font-semibold text-gray-900 dark:text-white">Yape</span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ booth.yapeNumber }}</p>
            </div>

            <!-- Plin -->
            <div v-if="booth.plinNumber" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  P
                </div>
                <span class="font-semibold text-gray-900 dark:text-white">Plin</span>
              </div>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ booth.plinNumber }}</p>
            </div>

            <!-- Bank Transfer (if available) -->
            <div v-if="booth.bankAccount || booth.cci" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span class="font-semibold text-gray-900 dark:text-white">Transferencia bancaria</span>
              </div>
              <div class="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p v-if="booth.bankAccount">
                  <span class="font-medium">Cuenta:</span> {{ booth.bankAccount }}
                </p>
                <p v-if="booth.cci">
                  <span class="font-medium">CCI:</span> {{ booth.cci }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p class="text-xs text-yellow-800 dark:text-yellow-200">
              <span class="font-semibold">Importante:</span> Una vez realizado el pago, el vendedor confirmará tu pedido y te contactará para coordinar la entrega.
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="goToBoothStream"
            class="w-full rounded-full bg-[#ee2b8c] py-3.5 text-center font-bold text-white hover:bg-pink-600 transition-colors"
          >
            Volver a la transmisión
          </button>

          <button
            @click="$router.push('/orders')"
            class="w-full rounded-full border-2 border-gray-300 dark:border-gray-600 py-3.5 text-center font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Ver mis pedidos
          </button>
        </div>

        <!-- Bottom padding for safe area -->
        <div class="h-4"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

const order = ref(null)
const booth = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const orderId = route.params.id

    // Fetch order details
    const orderResponse = await api.get(`/orders/${orderId}`)
    order.value = orderResponse.data

    // Fetch booth details
    const boothResponse = await api.get(`/booths/${order.value.boothId}`)
    booth.value = boothResponse.data
  } catch (err) {
    console.error('Error loading order:', err)
    error.value = err.response?.data?.error || 'No se pudo cargar la información del pedido'
  } finally {
    loading.value = false
  }
})

function goToBoothStream() {
  if (order.value && order.value.boothId) {
    router.push(`/booths/${order.value.boothId}`)
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}
</script>
