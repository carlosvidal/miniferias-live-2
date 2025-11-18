<template>
  <div class="min-h-screen bg-gray-50 pb-6">
    <!-- Filters - Horizontal Scroll -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-3 -mx-4">
      <div class="flex gap-2 overflow-x-auto md:justify-center pb-1 scrollbar-hide">
        <button
          v-for="status in orderStatuses"
          :key="status.value"
          @click="filterStatus = filterStatus === status.value ? null : status.value"
          :class="filterStatus === status.value ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'"
          class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex-shrink-0 active:scale-95 transition-all"
        >
          {{ status.label }}
          <span v-if="getOrderCountByStatus(status.value)" class="ml-1.5 px-2 py-0.5 bg-white bg-opacity-30 rounded-full text-xs font-bold">
            {{ getOrderCountByStatus(status.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Orders List -->
    <div v-else-if="filteredOrders.length" class="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      <router-link
        v-for="order in filteredOrders"
        :key="order.id"
        :to="{ name: 'exhibitor-order-detail', params: { id: order.id } }"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      >
        <!-- Order Header -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-sm font-bold font-mono text-gray-900">{{ order.orderNumber }}</h3>
                <span :class="getStatusClass(order.status)" class="px-2 py-1 text-xs font-bold rounded-full">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              <p class="text-sm font-medium text-gray-900">{{ order.user?.name || 'Desconocido' }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-purple-600">S/ {{ formatPrice(order.total) }}</p>
            </div>
          </div>
        </div>

        <!-- Products Summary -->
        <div class="p-4 bg-gray-50">
          <h4 class="font-bold text-xs text-gray-500 uppercase mb-2">Productos ({{ order.items.length }})</h4>
          <div class="space-y-2">
            <div v-for="(item, index) in order.items.slice(0, 2)" :key="item.id" class="flex items-center gap-3 bg-white rounded-lg p-2">
              <img
                v-if="item.productImage"
                :src="item.productImage"
                :alt="item.productName"
                class="w-12 h-12 object-cover rounded"
              />
              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm truncate">{{ item.quantity }}x {{ item.productName }}</p>
                <p class="text-xs text-gray-500">S/ {{ formatPrice(item.unitPrice) }} c/u</p>
              </div>
              <span class="text-sm font-bold text-gray-900">S/ {{ formatPrice(item.subtotal) }}</span>
            </div>
            <p v-if="order.items.length > 2" class="text-xs text-gray-500 text-center pt-1">
              +{{ order.items.length - 2 }} producto(s) más
            </p>
          </div>
        </div>

        <!-- View Details Link -->
        <div class="p-4 border-t border-gray-100">
          <div class="flex items-center justify-center gap-2 text-sm font-medium text-purple-600">
            Ver detalles completos
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">No hay pedidos</h3>
      <p class="text-gray-600 text-sm">{{ filterStatus ? 'No hay pedidos con este estado' : 'Aún no has recibido pedidos' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useBoothsStore } from '@/stores/booths'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const ordersStore = useOrdersStore()
const boothsStore = useBoothsStore()
const loading = ref(true)
const orders = ref([])
const filterStatus = ref(null)

const orderStatuses = [
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'SHIPPED', label: 'Enviados' },
  { value: 'DELIVERED', label: 'Entregados' },
  { value: 'CANCELLED', label: 'Cancelados' }
]

const filteredOrders = computed(() => {
  if (!filterStatus.value) return orders.value
  return orders.value.filter(order => order.status === filterStatus.value)
})

onMounted(async () => {
  try {
    const booth = await boothsStore.fetchMyBooth()
    if (booth) {
      const response = await ordersStore.fetchOrders({ boothId: booth.id })
      orders.value = response.orders
    }
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
})

function getStatusLabel(s) {
  return {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PREPARING: 'Preparando',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  }[s] || s
}

function getStatusClass(s) {
  return {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }[s] || 'bg-gray-100 text-gray-700'
}

function formatPrice(p) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(p)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getOrderCountByStatus(status) {
  return orders.value.filter(order => order.status === status).length
}
</script>

<style scoped>
/* Hide scrollbar but keep functionality */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
