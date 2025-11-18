<template>
  <div class="min-h-screen bg-gray-50 pb-6">
    <!-- Header with Back Button -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-bold text-gray-900">Detalle del Pedido</h1>
          <p v-if="order" class="text-sm text-gray-500">{{ order.orderNumber }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Order Detail -->
    <div v-else-if="order" class="p-4 md:p-6 max-w-4xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Order Header -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <h2 class="text-xl font-bold font-mono text-gray-900">{{ order.orderNumber }}</h2>
                <span :class="getStatusClass(order.status)" class="px-3 py-1 text-sm font-bold rounded-full">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              <p class="text-base font-medium text-gray-900">{{ order.user?.name || 'Desconocido' }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-purple-600">S/ {{ formatPrice(order.total) }}</p>
            </div>
          </div>
        </div>

        <!-- Products List -->
        <div class="p-6 bg-gray-50 border-b border-gray-200">
          <h3 class="font-bold text-sm text-gray-500 uppercase mb-4">Productos ({{ order.items.length }})</h3>
          <div class="space-y-3">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4 bg-white rounded-lg p-4">
              <img
                v-if="item.productImage"
                :src="item.productImage"
                :alt="item.productName"
                class="w-16 h-16 object-cover rounded"
              />
              <div class="flex-1 min-w-0">
                <p class="font-bold text-base truncate">{{ item.quantity }}x {{ item.productName }}</p>
                <p class="text-sm text-gray-500">S/ {{ formatPrice(item.unitPrice) }} c/u</p>
              </div>
              <span class="text-base font-bold text-gray-900">S/ {{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="p-6 border-b border-gray-100">
          <h3 class="font-bold text-sm text-gray-500 uppercase mb-4">Contacto</h3>
          <div class="space-y-3 text-base">
            <p class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-gray-900 font-medium">{{ order.user?.phone || order.shippingAddress?.phone || 'N/A' }}</span>
            </p>
            <p class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-gray-900 font-medium">{{ order.user?.email || 'N/A' }}</span>
            </p>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="p-6 border-b border-gray-100">
          <h3 class="font-bold text-sm text-gray-500 uppercase mb-4">Dirección de Envío</h3>
          <div class="bg-gray-50 p-4 rounded-lg text-base space-y-1.5">
            <p class="font-bold text-gray-900">{{ order.shippingAddress.name }}</p>
            <p class="text-gray-700">{{ order.shippingAddress.phone }}</p>
            <p class="text-gray-700">{{ order.shippingAddress.address }}</p>
            <p class="text-gray-600">{{ order.shippingAddress.district }}, {{ order.shippingAddress.city }}</p>
            <p v-if="order.shippingAddress.reference" class="text-gray-600 text-sm italic">Ref: {{ order.shippingAddress.reference }}</p>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="p-6 border-b border-gray-100">
          <h3 class="font-bold text-sm text-gray-500 uppercase mb-4">Pago</h3>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-base mb-3 flex items-center gap-3">
              <span class="font-medium text-gray-700">Método:</span>
              <span class="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-bold uppercase">
                {{ order.paymentMethod }}
              </span>
            </p>
            <div v-if="order.paymentProof">
              <p class="text-sm font-bold text-gray-700 mb-3">Comprobante:</p>
              <img
                :src="order.paymentProof"
                alt="Comprobante"
                class="w-full max-w-md h-64 object-cover rounded-lg border cursor-pointer"
                @click="showImageModal(order.paymentProof)"
              />
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="p-6 border-b border-gray-100">
          <h3 class="font-bold text-sm text-gray-500 uppercase mb-4">Resumen</h3>
          <div class="bg-gray-50 p-4 rounded-lg text-base space-y-3">
            <div class="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span class="font-medium">S/ {{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-gray-700">
              <span>Envío:</span>
              <span class="font-medium">S/ {{ formatPrice(order.shipping) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
              <span class="text-gray-900">Total:</span>
              <span class="text-purple-600">S/ {{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.notes" class="p-6 border-b border-gray-100">
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p class="text-sm font-bold text-yellow-800 mb-2">Notas:</p>
            <p class="text-base text-yellow-700">{{ order.notes }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="p-6 space-y-3">
          <button
            v-if="order.status === 'PENDING'"
            @click="updateStatus('CONFIRMED')"
            class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Confirmar Pedido
          </button>

          <button
            v-if="order.status === 'CONFIRMED'"
            @click="updateStatus('SHIPPED')"
            class="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Marcar como Enviado
          </button>

          <button
            v-if="order.status === 'SHIPPED'"
            @click="updateStatus('DELIVERED')"
            class="w-full py-4 bg-green-600 text-white rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Marcar como Entregado
          </button>

          <button
            v-if="['PENDING', 'CONFIRMED'].includes(order.status)"
            @click="showCancelModal = true"
            class="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar Pedido
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Pedido no encontrado</h3>
      <p class="text-gray-600 text-sm mb-4">El pedido que buscas no existe o no tienes acceso a él.</p>
      <button @click="goBack" class="btn btn-primary">Volver a Pedidos</button>
    </div>

    <!-- Cancel Modal -->
    <Transition name="slide-up">
      <div
        v-if="showCancelModal"
        class="fixed inset-0 bg-black/50 flex items-end md:items-center md:justify-center z-50"
        @click.self="showCancelModal = false"
      >
        <div class="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg p-6 max-h-[80vh] overflow-y-auto">
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden"></div>
          <h3 class="text-xl font-bold mb-2">Cancelar Pedido</h3>
          <p class="text-gray-600 mb-4">
            ¿Seguro que quieres cancelar <strong>{{ order?.orderNumber }}</strong>?
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()

const loading = ref(true)
const order = ref(null)
const showCancelModal = ref(false)
const cancelNotes = ref('')
const cancelling = ref(false)
const imageModalUrl = ref(null)

onMounted(async () => {
  try {
    const orderId = route.params.id
    order.value = await ordersStore.fetchOrderById(orderId)
  } catch (error) {
    console.error('Error loading order:', error)
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.push({ name: 'exhibitor-orders' })
}

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

async function updateStatus(newStatus) {
  try {
    await ordersStore.updateOrderStatus(order.value.id, newStatus)
    order.value.status = newStatus
  } catch (error) {
    alert('Error al actualizar el estado del pedido')
  }
}

async function handleCancel() {
  cancelling.value = true
  try {
    await ordersStore.updateOrderStatus(order.value.id, 'CANCELLED', cancelNotes.value || null)
    order.value.status = 'CANCELLED'
    if (cancelNotes.value) {
      order.value.notes = cancelNotes.value
    }
    showCancelModal.value = false
    cancelNotes.value = ''
  } catch (error) {
    alert('Error al cancelar el pedido')
  } finally {
    cancelling.value = false
  }
}

function showImageModal(url) {
  imageModalUrl.value = url
}
</script>

<style scoped>
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
