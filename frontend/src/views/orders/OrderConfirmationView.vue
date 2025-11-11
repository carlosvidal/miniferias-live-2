<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="container mx-auto px-4 py-8">
      <!-- Loading -->
      <LoadingSpinner v-if="loading" />

      <!-- Error -->
      <div v-else-if="error" class="card bg-red-50 text-red-600 max-w-2xl mx-auto">
        <p>{{ error }}</p>
      </div>

      <!-- Success -->
      <div v-else-if="order" class="max-w-3xl mx-auto">
        <!-- Success Header -->
        <div class="card text-center mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 mb-2">¡Pedido Realizado!</h1>
          <p class="text-gray-600 mb-4">
            Gracias por tu compra. Hemos recibido tu pedido y el vendedor lo procesará pronto.
          </p>

          <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
            <span class="text-sm font-medium">Número de Pedido:</span>
            <span class="text-lg font-bold">{{ order.orderNumber }}</span>
          </div>
        </div>

        <!-- Order Details -->
        <div class="card mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Detalles del Pedido</h2>

          <!-- Items -->
          <div class="space-y-4 mb-6">
            <div v-for="item in order.items" :key="item.id" class="flex gap-4">
              <img
                v-if="item.productImage"
                :src="item.productImage"
                :alt="item.productName"
                class="w-20 h-20 object-cover rounded-lg"
              />
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ item.productName }}</h3>
                <p class="text-sm text-gray-500">Cantidad: {{ item.quantity }}</p>
                <p class="text-sm text-gray-500">Precio unitario: S/ {{ formatPrice(item.unitPrice) }}</p>
                <p class="text-purple-600 font-medium">Subtotal: S/ {{ formatPrice(item.subtotal) }}</p>
              </div>
            </div>
          </div>

          <!-- Totals -->
          <div class="border-t pt-4 space-y-2">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>S/ {{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>S/ {{ formatPrice(order.shipping) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span class="text-purple-600">S/ {{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Info -->
        <div class="card mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información de Envío</h2>
          <div class="space-y-2 text-gray-600">
            <p><span class="font-medium text-gray-900">Nombre:</span> {{ order.shippingAddress.name }}</p>
            <p><span class="font-medium text-gray-900">Teléfono:</span> {{ order.shippingAddress.phone }}</p>
            <p><span class="font-medium text-gray-900">Dirección:</span> {{ order.shippingAddress.address }}</p>
            <p><span class="font-medium text-gray-900">Ciudad:</span> {{ order.shippingAddress.city }}</p>
            <p><span class="font-medium text-gray-900">Distrito:</span> {{ order.shippingAddress.district }}</p>
            <p v-if="order.shippingAddress.reference">
              <span class="font-medium text-gray-900">Referencia:</span> {{ order.shippingAddress.reference }}
            </p>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="card mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información de Pago</h2>
          <div class="space-y-3">
            <div>
              <span class="font-medium text-gray-900">Método de pago:</span>
              <span class="ml-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium uppercase">
                {{ order.paymentMethod }}
              </span>
            </div>

            <div v-if="order.paymentProof" class="border rounded-lg p-4">
              <p class="text-sm font-medium text-gray-700 mb-2">Comprobante de pago:</p>
              <img
                :src="order.paymentProof"
                alt="Payment proof"
                class="max-w-full h-auto max-h-64 object-contain rounded"
              />
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="card mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Estado del Pedido</h2>
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ getStatusText(order.status) }}</p>
              <p class="text-sm text-gray-600">
                Te enviaremos un correo electrónico cuando el vendedor confirme tu pedido.
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link to="/orders" class="btn btn-primary flex-1 text-center">
            Ver Mis Pedidos
          </router-link>
          <router-link to="/" class="btn btn-secondary flex-1 text-center">
            Seguir Comprando
          </router-link>
        </div>

        <!-- Help Info -->
        <div class="mt-8 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
          <p class="font-medium mb-2">¿Necesitas ayuda?</p>
          <p>
            Si tienes alguna pregunta sobre tu pedido, puedes contactar directamente al vendedor
            <strong>{{ order.booth?.name }}</strong> o revisar el estado de tu pedido en la sección "Mis Pedidos".
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/shared/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import api from '@/services/api'

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const order = ref(null)

onMounted(async () => {
  try {
    const orderId = route.params.id
    const response = await api.get(`/orders/${orderId}`)
    order.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar el pedido'
  } finally {
    loading.value = false
  }
})

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

function getStatusText(status) {
  const statuses = {
    PENDING: 'Pendiente de Confirmación',
    CONFIRMED: 'Confirmado',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  }
  return statuses[status] || status
}
</script>
