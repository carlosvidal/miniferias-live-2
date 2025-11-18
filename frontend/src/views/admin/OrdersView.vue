<template>
  <div class="min-h-screen">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Pedidos</h1>
      <p class="text-sm text-gray-600 mt-1">Gestiona todos los pedidos de todos los booths</p>
    </div>

    <!-- Filters - Horizontal Scroll -->
    <div class="sticky top-0 z-30 bg-gray-100 -mx-4 md:-mx-8 px-4 md:px-8 py-3 mb-6 border-b border-gray-200">
      <div class="flex gap-2 overflow-x-auto md:justify-start pb-1 scrollbar-hide">
        <button
          @click="filterStatus = null"
          :class="filterStatus === null ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'"
          class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex-shrink-0 active:scale-95 transition-all"
        >
          Todos
          <span v-if="orders.length" class="ml-1.5 px-2 py-0.5 bg-white bg-opacity-30 rounded-full text-xs font-bold">
            {{ orders.length }}
          </span>
        </button>
        <button
          v-for="status in orderStatuses"
          :key="status.value"
          @click="filterStatus = filterStatus === status.value ? null : status.value"
          :class="filterStatus === status.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'"
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
    <div v-else-if="filteredOrders.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Order Header -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-start justify-between mb-3">
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
              <p class="text-xl font-bold text-indigo-600">S/ {{ formatPrice(order.total) }}</p>
            </div>
          </div>

          <!-- Booth Info -->
          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              {{ getBoothInitial(order.booth) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-gray-900 truncate">{{ order.booth?.name || 'Sin booth' }}</p>
              <p class="text-xs text-gray-500">Booth</p>
            </div>
          </div>
        </div>

        <!-- Products Summary -->
        <div class="p-4 bg-gray-50">
          <h4 class="font-bold text-xs text-gray-500 uppercase mb-2">Productos ({{ order.items?.length || 0 }})</h4>
          <div class="space-y-2">
            <div v-for="(item, index) in (order.items || []).slice(0, 2)" :key="item.id" class="flex items-center gap-3 bg-white rounded-lg p-2">
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
            <p v-if="(order.items?.length || 0) > 2" class="text-xs text-gray-500 text-center pt-1">
              +{{ order.items.length - 2 }} producto(s) más
            </p>
          </div>
        </div>

        <!-- View Details Link -->
        <div class="p-4 border-t border-gray-100">
          <button
            @click="viewOrderDetails(order)"
            class="w-full flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Ver detalles completos
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">No hay pedidos</h3>
      <p class="text-gray-600 text-sm">{{ filterStatus ? 'No hay pedidos con este estado' : 'Aún no hay pedidos en el sistema' }}</p>
    </div>

    <!-- Order Details Modal -->
    <Transition name="modal">
      <div v-if="selectedOrder" @click="selectedOrder = null" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div @click.stop class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-gray-900">Pedido {{ selectedOrder.orderNumber }}</h2>
                <p class="text-sm text-gray-600 mt-1">{{ formatDate(selectedOrder.createdAt) }}</p>
              </div>
              <button @click="selectedOrder = null" class="p-2 rounded-full hover:bg-gray-100">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Content -->
          <div class="p-6 space-y-6">
            <!-- Status & Total -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Estado</p>
                <span :class="getStatusClass(selectedOrder.status)" class="inline-block px-3 py-1 text-sm font-bold rounded-full">
                  {{ getStatusLabel(selectedOrder.status) }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Total</p>
                <p class="text-2xl font-bold text-indigo-600">S/ {{ formatPrice(selectedOrder.total) }}</p>
              </div>
            </div>

            <!-- Booth Info -->
            <div>
              <p class="text-sm text-gray-600 mb-2">Booth</p>
              <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {{ getBoothInitial(selectedOrder.booth) }}
                </div>
                <div>
                  <p class="font-bold text-gray-900">{{ selectedOrder.booth?.name || 'Sin booth' }}</p>
                  <p class="text-sm text-gray-600">{{ selectedOrder.booth?.description || 'Sin descripción' }}</p>
                </div>
              </div>
            </div>

            <!-- Customer Info -->
            <div>
              <p class="text-sm text-gray-600 mb-2">Cliente</p>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="font-bold text-gray-900">{{ selectedOrder.user?.name || 'Desconocido' }}</p>
                <p class="text-sm text-gray-600">{{ selectedOrder.user?.email || 'Sin email' }}</p>
              </div>
            </div>

            <!-- Products -->
            <div>
              <p class="text-sm text-gray-600 mb-2">Productos</p>
              <div class="space-y-2">
                <div v-for="item in selectedOrder.items || []" :key="item.id" class="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <img
                    v-if="item.productImage"
                    :src="item.productImage"
                    :alt="item.productName"
                    class="w-16 h-16 object-cover rounded"
                  />
                  <div class="flex-1">
                    <p class="font-bold text-gray-900">{{ item.productName }}</p>
                    <p class="text-sm text-gray-600">{{ item.quantity }} x S/ {{ formatPrice(item.unitPrice) }}</p>
                  </div>
                  <span class="text-lg font-bold text-gray-900">S/ {{ formatPrice(item.subtotal) }}</span>
                </div>
              </div>
            </div>

            <!-- Delivery Address -->
            <div v-if="selectedOrder.deliveryAddress">
              <p class="text-sm text-gray-600 mb-2">Dirección de entrega</p>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-gray-900">{{ selectedOrder.deliveryAddress }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const ordersStore = useOrdersStore()
const loading = ref(true)
const orders = ref([])
const filterStatus = ref(null)
const selectedOrder = ref(null)

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
    // Fetch all orders (admin can see all orders from all booths)
    const response = await ordersStore.fetchOrders({})
    orders.value = response.orders || []
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

function getBoothInitial(booth) {
  if (!booth || !booth.name) return 'B'
  return booth.name.charAt(0).toUpperCase()
}

function viewOrderDetails(order) {
  selectedOrder.value = order
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

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
