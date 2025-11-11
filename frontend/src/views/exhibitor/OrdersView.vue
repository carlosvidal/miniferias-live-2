<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Pedidos Recibidos</h1>

    <div v-if="loading" class="text-center py-12"><LoadingSpinner /></div>

    <div v-else-if="orders.length" class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="card hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold font-mono">{{ order.orderNumber }}</h3>
              <span :class="getStatusClass(order.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <p class="text-gray-600 text-sm">Cliente: {{ order.user?.name || 'Desconocido' }}</p>
            <p class="text-gray-500 text-xs">{{ formatDate(order.createdAt) }}</p>
          </div>
          <p class="text-2xl font-bold text-purple-600">S/ {{ formatPrice(order.total) }}</p>
        </div>

        <div class="border-t pt-4 mb-4">
          <h4 class="font-semibold mb-2 text-sm text-gray-700">Productos:</h4>
          <div class="space-y-2">
            <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm">
              <span>{{ item.quantity }}x {{ item.product?.name || 'Producto' }}</span>
              <span class="text-gray-600">S/ {{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <div v-if="order.notes" class="bg-gray-50 p-3 rounded-lg mb-4">
          <p class="text-sm text-gray-700"><strong>Notas:</strong> {{ order.notes }}</p>
        </div>

        <div class="flex gap-2">
          <button v-if="order.status === 'PENDING'" @click="updateStatus(order.id, 'CONFIRMED')" class="btn btn-primary text-sm">Confirmar Pedido</button>
          <button v-if="order.status === 'CONFIRMED'" @click="updateStatus(order.id, 'PREPARING')" class="btn btn-primary text-sm">Marcar como Preparando</button>
          <button v-if="order.status === 'PREPARING'" @click="updateStatus(order.id, 'SHIPPED')" class="btn btn-primary text-sm">Marcar como Enviado</button>
          <button v-if="order.status === 'SHIPPED'" @click="updateStatus(order.id, 'DELIVERED')" class="btn btn-primary text-sm">Marcar como Entregado</button>
          <button v-if="['PENDING', 'CONFIRMED'].includes(order.status)" @click="confirmCancel(order)" class="btn btn-secondary text-sm">Cancelar Pedido</button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 card">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
      <p class="text-gray-600">No has recibido pedidos aún</p>
    </div>

    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showCancelModal = false">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">Cancelar Pedido</h3>
        <p class="text-gray-600 mb-4">¿Estás seguro de cancelar el pedido <strong>{{ orderToCancel?.orderNumber }}</strong>?</p>
        <div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-1">Razón (opcional)</label>
          <textarea v-model="cancelNotes" rows="3" class="input" placeholder="Explica por qué cancelas el pedido..."></textarea>
        </div>
        <div class="flex gap-3">
          <button @click="handleCancel" :disabled="cancelling" class="btn bg-red-600 text-white hover:bg-red-700 flex-1">{{ cancelling ? 'Cancelando...' : 'Cancelar Pedido' }}</button>
          <button @click="showCancelModal = false" :disabled="cancelling" class="btn btn-secondary flex-1">Volver</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useBoothsStore } from '@/stores/booths'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const ordersStore = useOrdersStore()
const boothsStore = useBoothsStore()
const loading = ref(true)
const orders = ref([])
const showCancelModal = ref(false)
const orderToCancel = ref(null)
const cancelNotes = ref('')
const cancelling = ref(false)

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
</script>
