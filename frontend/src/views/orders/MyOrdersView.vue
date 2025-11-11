<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Mis Pedidos</h1>

      <!-- Loading State -->
      <div v-if="ordersStore.loading && !ordersStore.myOrders.length" class="text-center py-12">
        <LoadingSpinner />
      </div>

      <!-- Orders List -->
      <div v-else-if="ordersStore.myOrders.length > 0" class="space-y-6">
        <div
          v-for="order in ordersStore.myOrders"
          :key="order.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="router.push(`/orders/${order.id}`)"
        >
          <div class="flex flex-col md:flex-row md:items-start gap-6">
            <!-- Order Info -->
            <div class="flex-1">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold mb-1">Pedido #{{ order.orderNumber }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ formatDate(order.createdAt) }}
                  </p>
                </div>
                <span :class="getStatusBadgeClass(order.status)" class="badge">
                  {{ getStatusText(order.status) }}
                </span>
              </div>

              <!-- Booth Info -->
              <div class="flex items-center gap-3 mb-4 pb-4 border-b">
                <img
                  v-if="order.booth?.logo"
                  :src="order.booth.logo"
                  :alt="order.booth.name"
                  class="w-12 h-12 object-cover rounded-lg"
                />
                <div v-else class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white font-bold">
                  {{ order.booth?.name?.charAt(0) }}
                </div>
                <div>
                  <p class="font-semibold">{{ order.booth?.name }}</p>
                  <p class="text-sm text-gray-600">{{ order.items?.length || 0 }} productos</p>
                </div>
              </div>

              <!-- Order Items Preview -->
              <div class="space-y-2 mb-4">
                <div
                  v-for="item in order.items.slice(0, 3)"
                  :key="item.id"
                  class="flex items-center gap-3 text-sm"
                >
                  <img
                    v-if="item.productImage"
                    :src="item.productImage"
                    :alt="item.productName"
                    class="w-10 h-10 object-cover rounded"
                  />
                  <div class="flex-1">
                    <p class="font-medium">{{ item.productName }}</p>
                    <p class="text-gray-600">Cantidad: {{ item.quantity }}</p>
                  </div>
                  <p class="font-semibold">S/ {{ formatPrice(item.subtotal) }}</p>
                </div>
                <p v-if="order.items.length > 3" class="text-sm text-gray-500 text-center">
                  + {{ order.items.length - 3 }} producto(s) más
                </p>
              </div>

              <!-- Shipping Address -->
              <div class="text-sm text-gray-600 mb-4">
                <p class="font-medium text-gray-900 mb-1">Dirección de envío:</p>
                <p>{{ order.shippingAddress?.fullName }}</p>
                <p>{{ order.shippingAddress?.street }}, {{ order.shippingAddress?.district }}</p>
                <p>{{ order.shippingAddress?.city }} {{ order.shippingAddress?.postalCode }}</p>
              </div>
            </div>

            <!-- Total and Actions -->
            <div class="md:text-right">
              <p class="text-2xl font-bold text-purple-600 mb-4">
                S/ {{ formatPrice(order.total) }}
              </p>
              <button
                @click.stop="router.push(`/orders/${order.id}`)"
                class="btn btn-secondary"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 card">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p class="text-gray-600 mb-4">No tienes pedidos aún</p>
        <router-link to="/" class="btn btn-primary">
          Explorar Eventos
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/shared/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const router = useRouter()
const ordersStore = useOrdersStore()
const authStore = useAuthStore()

onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/orders/my')
    return
  }

  await ordersStore.fetchMyOrders()
})

function getStatusBadgeClass(status) {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-indigo-100 text-indigo-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function getStatusText(status) {
  const texts = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PROCESSING: 'Procesando',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  }
  return texts[status] || status
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}
</script>
