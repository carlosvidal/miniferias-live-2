<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">Panel de Control</h1>
        <p class="text-gray-600 mt-1">Gestiona tu booth y monitorea tus ventas</p>
      </div>
      <div v-if="booth" class="text-right">
        <p class="text-sm text-gray-600">Booth</p>
        <p class="font-semibold">{{ booth.name }}</p>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="!booth" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="text-xl font-semibold mb-2">No tienes un booth asignado</h3>
      <p class="text-gray-600 mb-4">Contacta al administrador para que te asigne un booth.</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Sales -->
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">Ventas Totales</span>
            <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-3xl font-bold mb-1">S/ {{ formatPrice(stats.totalSales) }}</p>
          <p class="text-sm opacity-90">{{ stats.totalOrders }} {{ stats.totalOrders === 1 ? 'pedido' : 'pedidos' }}</p>
        </div>

        <!-- Pending Orders -->
        <div class="card bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">Pedidos Pendientes</span>
            <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-3xl font-bold mb-1">{{ stats.pendingOrders }}</p>
          <p class="text-sm opacity-90">Requieren atención</p>
        </div>

        <!-- Products -->
        <div class="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">Productos</span>
            <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-3xl font-bold mb-1">{{ stats.totalProducts }}</p>
          <p class="text-sm opacity-90">{{ stats.activeProducts }} activos</p>
        </div>

        <!-- Streaming Status -->
        <div :class="booth.isStreaming ? 'bg-gradient-to-br from-red-500 to-pink-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'" class="card text-white">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">Transmisión</span>
            <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-3xl font-bold mb-1">{{ booth.isStreaming ? 'EN VIVO' : 'OFFLINE' }}</p>
          <p class="text-sm opacity-90">{{ booth.isStreaming ? 'Transmitiendo ahora' : 'No activo' }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link to="/exhibitor/live" class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
            <div :class="booth.isStreaming ? 'bg-red-100' : 'bg-gray-100'" class="w-12 h-12 rounded-full flex items-center justify-center">
              <svg :class="booth.isStreaming ? 'text-red-600' : 'text-gray-600'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-center">{{ booth.isStreaming ? 'Controlar Stream' : 'Iniciar Stream' }}</span>
          </router-link>

          <router-link to="/exhibitor/products" class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
            <div class="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-center">Productos</span>
          </router-link>

          <router-link to="/exhibitor/orders" class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
            <div class="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span class="text-sm font-medium text-center">Pedidos</span>
          </router-link>

          <router-link to="/exhibitor/booth" class="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
            <div class="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-center">Configuración</span>
          </router-link>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Pedidos Recientes</h2>
          <router-link to="/exhibitor/orders" class="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Ver todos →
          </router-link>
        </div>

        <div v-if="recentOrders.length" class="space-y-3">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-medium font-mono text-sm">{{ order.orderNumber }}</p>
                <span :class="getStatusClass(order.status)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ order.user?.name }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-purple-600">S/ {{ formatPrice(order.total) }}</p>
              <p class="text-xs text-gray-500">{{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }}</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <p>No hay pedidos recientes</p>
        </div>
      </div>

      <!-- Top Products -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Productos Más Vendidos</h2>
          <router-link to="/exhibitor/products" class="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Ver todos →
          </router-link>
        </div>

        <div v-if="topProducts.length" class="space-y-3">
          <div v-for="(product, index) in topProducts" :key="product.id" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
              {{ index + 1 }}
            </div>
            <img
              v-if="product.images?.[0]"
              :src="product.images[0]"
              :alt="product.name"
              class="w-12 h-12 object-cover rounded"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ product.name }}</p>
              <p class="text-sm text-gray-600">S/ {{ formatPrice(product.price) }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">{{ product.soldCount || 0 }}</p>
              <p class="text-xs text-gray-500">vendidos</p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <p>No hay productos vendidos aún</p>
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
