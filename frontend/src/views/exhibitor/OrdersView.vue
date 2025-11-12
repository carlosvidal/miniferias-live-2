<template>
  <div class="min-h-screen bg-gray-50 pb-6">
    <!-- Filters - Horizontal Scroll -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 -mx-4">
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
    <div v-else-if="filteredOrders.length" class="p-4 space-y-3">
      <div v-for="order in filteredOrders" :key="order.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

          <!-- Toggle Details Button -->
          <button
            @click="toggleOrderDetails(order.id)"
            class="w-full py-2 bg-gray-50 rounded-lg text-sm font-medium text-purple-600 hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {{ expandedOrders.includes(order.id) ? 'Ocultar' : 'Ver' }} detalles
            <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedOrders.includes(order.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Products Summary -->
        <div class="p-4 bg-gray-50">
          <h4 class="font-bold text-xs text-gray-500 uppercase mb-2">Productos ({{ order.items.length }})</h4>
          <div class="space-y-2">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-3 bg-white rounded-lg p-2">
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
          </div>
        </div>

        <!-- Expanded Details -->
        <Transition name="slide-down">
          <div v-if="expandedOrders.includes(order.id)" class="border-t border-gray-200">
            <!-- Contact Info -->
            <div class="p-4 border-b border-gray-100">
              <h4 class="font-bold text-xs text-gray-500 uppercase mb-2">Contacto</h4>
              <div class="space-y-1 text-sm">
                <p class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="text-gray-900 font-medium">{{ order.user?.phone || order.shippingAddress?.phone || 'N/A' }}</span>
                </p>
                <p class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="text-gray-900 font-medium">{{ order.user?.email || 'N/A' }}</span>
                </p>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="p-4 border-b border-gray-100">
              <h4 class="font-bold text-xs text-gray-500 uppercase mb-2">Dirección de Envío</h4>
              <div class="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                <p class="font-bold text-gray-900">{{ order.shippingAddress.name }}</p>
                <p class="text-gray-700">{{ order.shippingAddress.phone }}</p>
                <p class="text-gray-700">{{ order.shippingAddress.address }}</p>
                <p class="text-gray-600">{{ order.shippingAddress.district }}, {{ order.shippingAddress.city }}</p>
                <p v-if="order.shippingAddress.reference" class="text-gray-600 text-xs italic">Ref: {{ order.shippingAddress.reference }}</p>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="p-4 border-b border-gray-100">
              <h4 class="font-bold text-xs text-gray-500 uppercase mb-2">Pago</h4>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm mb-2 flex items-center gap-2">
                  <span class="font-medium text-gray-700">Método:</span>
                  <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase">
                    {{ order.paymentMethod }}
                  </span>
                </p>
                <div v-if="order.paymentProof">
                  <p class="text-xs font-bold text-gray-700 mb-2">Comprobante:</p>
                  <img
                    :src="order.paymentProof"
                    alt="Comprobante"
                    class="w-full h-40 object-cover rounded-lg border cursor-pointer"
                    @click="showImageModal(order.paymentProof)"
                  />
                </div>
              </div>
            </div>

            <!-- Totals -->
            <div class="p-4 border-b border-gray-100">
              <h4 class="font-bold text-xs text-gray-500 uppercase mb-2">Resumen</h4>
              <div class="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                <div class="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span class="font-medium">S/ {{ formatPrice(order.subtotal) }}</span>
                </div>
                <div class="flex justify-between text-gray-700">
                  <span>Envío:</span>
                  <span class="font-medium">S/ {{ formatPrice(order.shipping) }}</span>
                </div>
                <div class="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
                  <span class="text-gray-900">Total:</span>
                  <span class="text-purple-600">S/ {{ formatPrice(order.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="order.notes" class="p-4 border-b border-gray-100">
              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p class="text-xs font-bold text-yellow-800 mb-1">Notas:</p>
                <p class="text-sm text-yellow-700">{{ order.notes }}</p>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Action Buttons -->
        <div class="p-4 space-y-2">
          <button
            v-if="order.status === 'PENDING'"
            @click="updateStatus(order.id, 'CONFIRMED')"
            class="w-full py-3 bg-blue-600 text-white rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Confirmar Pedido
          </button>

          <button
            v-if="order.status === 'CONFIRMED'"
            @click="updateStatus(order.id, 'SHIPPED')"
            class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Marcar como Enviado
          </button>

          <button
            v-if="order.status === 'SHIPPED'"
            @click="updateStatus(order.id, 'DELIVERED')"
            class="w-full py-3 bg-green-600 text-white rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Marcar como Entregado
          </button>

          <button
            v-if="['PENDING', 'CONFIRMED'].includes(order.status)"
            @click="confirmCancel(order)"
            class="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar Pedido
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
      <p class="text-gray-600 text-sm">{{ filterStatus ? 'No hay pedidos con este estado' : 'Aún no has recibido pedidos' }}</p>
    </div>

    <!-- Cancel Modal -->
    <Transition name="slide-up">
      <div
        v-if="showCancelModal"
        class="fixed inset-0 bg-black/50 flex items-end z-50"
        @click.self="showCancelModal = false"
      >
        <div class="bg-white rounded-t-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h3 class="text-xl font-bold mb-2">Cancelar Pedido</h3>
          <p class="text-gray-600 mb-4">
            ¿Seguro que quieres cancelar <strong>{{ orderToCancel?.orderNumber }}</strong>?
          </p>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-900 mb-2">Razón (opcional)</label>
            <textarea
              v-model="cancelNotes"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Explica por qué cancelas..."
            ></textarea>
          </div>
          <div class="space-y-3">
            <button
              @click="handleCancel"
              :disabled="cancelling"
              class="w-full py-4 bg-red-600 text-white rounded-xl font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {{ cancelling ? 'Cancelando...' : 'Sí, Cancelar Pedido' }}
            </button>
            <button
              @click="showCancelModal = false"
              :disabled="cancelling"
              class="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              No, Volver
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Image Modal -->
    <Transition name="fade">
      <div
        v-if="imageModalUrl"
        class="fixed inset-0 bg-black flex items-center justify-center z-50"
        @click="imageModalUrl = null"
      >
        <button
          @click="imageModalUrl = null"
          class="absolute top-4 right-4 bg-white rounded-full p-3 hover:bg-gray-100 active:scale-95 transition-transform z-10"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="imageModalUrl" alt="Comprobante" class="max-w-full max-h-full object-contain p-4" />
      </div>
    </Transition>
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
const showCancelModal = ref(false)
const orderToCancel = ref(null)
const cancelNotes = ref('')
const cancelling = ref(false)
const expandedOrders = ref([])
const imageModalUrl = ref(null)
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

async function updateStatus(orderId, newStatus) {
  try {
    await ordersStore.updateOrderStatus(orderId, newStatus)
    const order = orders.value.find(o => o.id === orderId)
    if (order) order.status = newStatus
  } catch (error) {
    alert('Error al actualizar el estado del pedido')
  }
}

function confirmCancel(order) {
  orderToCancel.value = order
  cancelNotes.value = ''
  showCancelModal.value = true
}

async function handleCancel() {
  cancelling.value = true
  try {
    await ordersStore.updateOrderStatus(orderToCancel.value.id, 'CANCELLED', cancelNotes.value || null)
    const order = orders.value.find(o => o.id === orderToCancel.value.id)
    if (order) {
      order.status = 'CANCELLED'
      order.notes = cancelNotes.value || order.notes
    }
    showCancelModal.value = false
    orderToCancel.value = null
    cancelNotes.value = ''
  } catch (error) {
    alert('Error al cancelar el pedido')
  } finally {
    cancelling.value = false
  }
}

function toggleOrderDetails(orderId) {
  const index = expandedOrders.value.indexOf(orderId)
  if (index > -1) {
    expandedOrders.value.splice(index, 1)
  } else {
    expandedOrders.value.push(orderId)
  }
}

function showImageModal(url) {
  imageModalUrl.value = url
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

/* Slide down animation for expanded details */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Slide up animation for modals */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
