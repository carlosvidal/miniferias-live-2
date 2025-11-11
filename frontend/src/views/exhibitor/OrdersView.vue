<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Pedidos Recibidos</h1>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">{{ filteredOrders.length }} {{ filteredOrders.length === 1 ? 'pedido' : 'pedidos' }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="status in orderStatuses"
          :key="status.value"
          @click="filterStatus = filterStatus === status.value ? null : status.value"
          :class="filterStatus === status.value ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {{ status.label }}
          <span v-if="getOrderCountByStatus(status.value)" class="ml-1.5 px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">
            {{ getOrderCountByStatus(status.value) }}
          </span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12"><LoadingSpinner /></div>

    <div v-else-if="filteredOrders.length" class="space-y-4">
      <div v-for="order in filteredOrders" :key="order.id" class="card hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold font-mono">{{ order.orderNumber }}</h3>
              <span :class="getStatusClass(order.status)" class="px-3 py-1 text-xs font-medium rounded-full">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div class="text-gray-600">
                <span class="font-medium text-gray-900">Cliente:</span> {{ order.user?.name || 'Desconocido' }}
              </div>
              <div class="text-gray-600">
                <span class="font-medium text-gray-900">Teléfono:</span> {{ order.user?.phone || order.shippingAddress?.phone || 'N/A' }}
              </div>
              <div class="text-gray-600">
                <span class="font-medium text-gray-900">Email:</span> {{ order.user?.email || 'N/A' }}
              </div>
              <div class="text-gray-500 text-xs">
                {{ formatDate(order.createdAt) }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-purple-600">S/ {{ formatPrice(order.total) }}</p>
            <button
              @click="toggleOrderDetails(order.id)"
              class="text-sm text-purple-600 hover:text-purple-700 mt-2 flex items-center gap-1"
            >
              {{ expandedOrders.includes(order.id) ? 'Ocultar' : 'Ver' }} detalles
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedOrders.includes(order.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Products Summary (Always Visible) -->
        <div class="border-t pt-4 mb-4">
          <h4 class="font-semibold mb-2 text-sm text-gray-700">Productos ({{ order.items.length }}):</h4>
          <div class="space-y-2">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-3 text-sm">
              <img
                v-if="item.productImage"
                :src="item.productImage"
                :alt="item.productName"
                class="w-12 h-12 object-cover rounded"
              />
              <div class="flex-1">
                <p class="font-medium">{{ item.quantity }}x {{ item.productName }}</p>
                <p class="text-xs text-gray-500">S/ {{ formatPrice(item.unitPrice) }} c/u</p>
              </div>
              <span class="text-gray-600 font-medium">S/ {{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Expanded Details -->
        <div v-if="expandedOrders.includes(order.id)" class="border-t pt-4 mb-4 space-y-4">
          <!-- Shipping Address -->
          <div>
            <h4 class="font-semibold mb-2 text-sm text-gray-700">Dirección de Envío:</h4>
            <div class="bg-gray-50 p-3 rounded-lg text-sm">
              <p><span class="font-medium">Nombre:</span> {{ order.shippingAddress.name }}</p>
              <p><span class="font-medium">Teléfono:</span> {{ order.shippingAddress.phone }}</p>
              <p><span class="font-medium">Dirección:</span> {{ order.shippingAddress.address }}</p>
              <p><span class="font-medium">Distrito:</span> {{ order.shippingAddress.district }}, {{ order.shippingAddress.city }}</p>
              <p v-if="order.shippingAddress.reference"><span class="font-medium">Referencia:</span> {{ order.shippingAddress.reference }}</p>
            </div>
          </div>

          <!-- Payment Info -->
          <div>
            <h4 class="font-semibold mb-2 text-sm text-gray-700">Información de Pago:</h4>
            <div class="bg-gray-50 p-3 rounded-lg">
              <p class="text-sm mb-2">
                <span class="font-medium">Método:</span>
                <span class="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium uppercase">
                  {{ order.paymentMethod }}
                </span>
              </p>
              <div v-if="order.paymentProof">
                <p class="text-sm font-medium mb-2">Comprobante de pago:</p>
                <img
                  :src="order.paymentProof"
                  alt="Payment proof"
                  class="max-w-full h-auto max-h-64 object-contain rounded border cursor-pointer"
                  @click="showImageModal(order.paymentProof)"
                />
              </div>
            </div>
          </div>

          <!-- Order Totals -->
          <div>
            <h4 class="font-semibold mb-2 text-sm text-gray-700">Totales:</h4>
            <div class="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
              <div class="flex justify-between">
                <span>Subtotal:</span>
                <span>S/ {{ formatPrice(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Envío:</span>
                <span>S/ {{ formatPrice(order.shipping) }}</span>
              </div>
              <div class="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Total:</span>
                <span class="text-purple-600">S/ {{ formatPrice(order.total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.notes" class="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-4">
          <p class="text-sm text-yellow-800"><strong>Notas:</strong> {{ order.notes }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2">
          <button v-if="order.status === 'PENDING'" @click="updateStatus(order.id, 'CONFIRMED')" class="btn btn-primary text-sm">
            ✓ Confirmar Pedido
          </button>
          <button v-if="order.status === 'CONFIRMED'" @click="updateStatus(order.id, 'SHIPPED')" class="btn btn-primary text-sm">
            📦 Marcar como Enviado
          </button>
          <button v-if="order.status === 'SHIPPED'" @click="updateStatus(order.id, 'DELIVERED')" class="btn btn-primary text-sm">
            ✓ Marcar como Entregado
          </button>
          <button
            v-if="['PENDING', 'CONFIRMED'].includes(order.status)"
            @click="confirmCancel(order)"
            class="btn btn-secondary text-sm"
          >
            ✕ Cancelar Pedido
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 card">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
      <p class="text-gray-600">No has recibido pedidos aún</p>
    </div>

    <!-- Cancel Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showCancelModal = false">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">Cancelar Pedido</h3>
        <p class="text-gray-600 mb-4">¿Estás seguro de cancelar el pedido <strong>{{ orderToCancel?.orderNumber }}</strong>?</p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Razón (opcional)</label>
          <textarea v-model="cancelNotes" rows="3" class="input" placeholder="Explica por qué cancelas el pedido..."></textarea>
        </div>
        <div class="flex gap-3">
          <button @click="handleCancel" :disabled="cancelling" class="btn bg-red-600 text-white hover:bg-red-700 flex-1">
            {{ cancelling ? 'Cancelando...' : 'Cancelar Pedido' }}
          </button>
          <button @click="showCancelModal = false" :disabled="cancelling" class="btn btn-secondary flex-1">Volver</button>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="imageModalUrl" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" @click="imageModalUrl = null">
      <div class="relative max-w-4xl max-h-full">
        <button
          @click="imageModalUrl = null"
          class="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="imageModalUrl" alt="Comprobante" class="max-w-full max-h-full object-contain rounded-lg" />
      </div>
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
  } catch (error) { console.error('Error loading orders:', error) }
  finally { loading.value = false }
})

function getStatusLabel(s) { return {PENDING:'Pendiente',CONFIRMED:'Confirmado',PREPARING:'Preparando',SHIPPED:'Enviado',DELIVERED:'Entregado',CANCELLED:'Cancelado'}[s] || s }
function getStatusClass(s) { return {PENDING:'bg-yellow-100 text-yellow-700',CONFIRMED:'bg-blue-100 text-blue-700',PREPARING:'bg-purple-100 text-purple-700',SHIPPED:'bg-indigo-100 text-indigo-700',DELIVERED:'bg-green-100 text-green-700',CANCELLED:'bg-red-100 text-red-700'}[s] || 'bg-gray-100 text-gray-700' }
function formatPrice(p) { return new Intl.NumberFormat('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(p) }
function formatDate(d) { return new Date(d).toLocaleDateString('es-PE', {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }

async function updateStatus(orderId, newStatus) {
  try {
    await ordersStore.updateOrderStatus(orderId, newStatus)
    const order = orders.value.find(o => o.id === orderId)
    if (order) order.status = newStatus
  } catch (error) { alert('Error al actualizar el estado del pedido') }
}

function confirmCancel(order) { orderToCancel.value = order; cancelNotes.value = ''; showCancelModal.value = true }

async function handleCancel() {
  cancelling.value = true
  try {
    await ordersStore.updateOrderStatus(orderToCancel.value.id, 'CANCELLED', cancelNotes.value || null)
    const order = orders.value.find(o => o.id === orderToCancel.value.id)
    if (order) { order.status = 'CANCELLED'; order.notes = cancelNotes.value || order.notes }
    showCancelModal.value = false; orderToCancel.value = null; cancelNotes.value = ''
  } catch (error) { alert('Error al cancelar el pedido') }
  finally { cancelling.value = false }
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
