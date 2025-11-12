<template>
  <div class="min-h-screen bg-gray-50">
    <LoadingSpinner v-if="loading" class="py-12" />

    <!-- No Booth State -->
    <div v-else-if="!booth" class="flex flex-col items-center justify-center p-8 text-center min-h-[70vh]">
      <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">No tienes un booth asignado</h3>
      <p class="text-gray-600 text-sm">Contacta al administrador para que te asigne un booth.</p>
    </div>

    <!-- Main Content -->
    <div v-else class="pb-4">
      <!-- Stats Cards - Responsive Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6">
        <!-- Total Sales -->
        <div class="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium opacity-90">Ventas</span>
            <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-2xl font-bold mb-0.5">S/ {{ formatPrice(stats.totalSales) }}</p>
          <p class="text-xs opacity-90">{{ stats.totalOrders }} pedido{{ stats.totalOrders !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Pending Orders -->
        <div class="rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white p-4 shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium opacity-90">Pendientes</span>
            <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-2xl font-bold mb-0.5">{{ stats.pendingOrders }}</p>
          <p class="text-xs opacity-90">Por atender</p>
        </div>

        <!-- Products -->
        <div class="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium opacity-90">Productos</span>
            <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-2xl font-bold mb-0.5">{{ stats.totalProducts }}</p>
          <p class="text-xs opacity-90">{{ stats.activeProducts }} activo{{ stats.activeProducts !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Streaming Status -->
        <div :class="booth.isStreaming ? 'bg-gradient-to-br from-red-500 to-pink-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'" class="rounded-2xl text-white p-4 shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium opacity-90">Streaming</span>
            <svg class="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-xl font-bold mb-0.5">{{ booth.isStreaming ? 'EN VIVO' : 'OFFLINE' }}</p>
          <p class="text-xs opacity-90">{{ booth.isStreaming ? 'Al aire' : 'Inactivo' }}</p>
        </div>
      </div>

      <!-- Quick Actions - Primary CTA -->
      <div class="px-4 md:px-6">
        <router-link
          to="/exhibitor/live"
          class="flex items-center justify-between p-4 md:p-6 rounded-2xl transition-all active:scale-[0.98] hover:scale-[1.01]"
          :class="booth.isStreaming ? 'bg-gradient-to-r from-red-500 to-pink-600 shadow-lg shadow-red-500/30' : 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30'"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="text-white">
              <p class="font-bold">{{ booth.isStreaming ? 'Controlar transmisión' : 'Iniciar transmisión' }}</p>
              <p class="text-xs opacity-90">{{ booth.isStreaming ? 'Ya estás en vivo' : 'Conéctate con tu audiencia' }}</p>
            </div>
          </div>
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <!-- Recent Orders & Top Products - Two Column Layout on Desktop -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-6 mt-6">
        <!-- Recent Orders -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-gray-900">Pedidos Recientes</h2>
          <router-link to="/exhibitor/orders" class="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
            Ver todos
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>

        <div v-if="recentOrders.length" class="space-y-2">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-bold font-mono text-sm text-gray-900">{{ order.orderNumber }}</p>
                <span :class="getStatusClass(order.status)" class="px-2 py-1 text-xs font-bold rounded-full">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-700 font-medium truncate">{{ order.user?.name }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="text-right ml-3">
              <p class="font-bold text-purple-600 text-lg">S/ {{ formatPrice(order.total) }}</p>
              <p class="text-xs text-gray-500">{{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-white rounded-xl">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-gray-500 text-sm">No hay pedidos recientes</p>
        </div>
        </div>

        <!-- Top Products -->
        <div class="pb-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-gray-900">Top Productos</h2>
          <router-link to="/exhibitor/products" class="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
            Ver todos
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>

        <div v-if="topProducts.length" class="space-y-2">
          <div v-for="(product, index) in topProducts" :key="product.id" class="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              {{ index + 1 }}
            </div>
            <img
              v-if="product.images?.[0]"
              :src="product.images[0]"
              :alt="product.name"
              class="w-14 h-14 object-cover rounded-lg"
            />
            <div v-else class="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm text-gray-900 truncate">{{ product.name }}</p>
              <p class="text-sm text-gray-600">S/ {{ formatPrice(product.price) }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-purple-600 text-lg">{{ product.soldCount || 0 }}</p>
              <p class="text-xs text-gray-500">vendidos</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-white rounded-xl">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-gray-500 text-sm">No hay productos vendidos aún</p>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBoothsStore } from '@/stores/booths'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const boothsStore = useBoothsStore()
const productsStore = useProductsStore()
const ordersStore = useOrdersStore()

const loading = ref(true)
const booth = ref(null)
const products = ref([])
const orders = ref([])

const stats = computed(() => {
  const totalSales = orders.value
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, order) => sum + parseFloat(order.total), 0)

  const totalOrders = orders.value.filter(o => o.status !== 'CANCELLED').length
  const pendingOrders = orders.value.filter(o => o.status === 'PENDING').length
  const totalProducts = products.value.length
  const activeProducts = products.value.filter(p => p.isActive).length

  return {
    totalSales,
    totalOrders,
    pendingOrders,
    totalProducts,
    activeProducts
  }
})

const recentOrders = computed(() => {
  return orders.value
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

const topProducts = computed(() => {
  // Calculate sold count per product from order items
  const productSales = {}

  orders.value.forEach(order => {
    if (order.status !== 'CANCELLED') {
      order.items.forEach(item => {
        const productId = item.productId
        if (!productSales[productId]) {
          productSales[productId] = {
            product: products.value.find(p => p.id === productId),
            soldCount: 0
          }
        }
        productSales[productId].soldCount += item.quantity
      })
    }
  })

  return Object.values(productSales)
    .filter(item => item.product)
    .map(item => ({ ...item.product, soldCount: item.soldCount }))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5)
})

onMounted(async () => {
  try {
    booth.value = await boothsStore.fetchMyBooth()

    if (booth.value) {
      const [productsResponse, ordersResponse] = await Promise.all([
        productsStore.fetchProductsByBooth(booth.value.id),
        ordersStore.fetchOrders({ boothId: booth.value.id })
      ])

      products.value = productsResponse.products
      orders.value = ordersResponse.orders
    }
  } catch (error) {
    console.error('Error loading dashboard:', error)
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

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusLabel(status) {
  const labels = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  }
  return labels[status] || status
}

function getStatusClass(status) {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}
</script>
