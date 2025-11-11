<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats" class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Users -->
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">Total Usuarios</p>
              <p class="text-3xl font-bold mt-1">{{ stats.totalUsers }}</p>
              <div class="flex gap-2 mt-2 text-xs text-blue-100">
                <span>Admin: {{ stats.users.admin }}</span>
                <span>Exp: {{ stats.users.exhibitor }}</span>
                <span>Vis: {{ stats.users.visitor }}</span>
              </div>
            </div>
            <div class="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Events -->
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium">Total Eventos</p>
              <p class="text-3xl font-bold mt-1">{{ stats.totalEvents }}</p>
            </div>
            <div class="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Booths -->
        <div class="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-pink-100 text-sm font-medium">Total Booths</p>
              <p class="text-3xl font-bold mt-1">{{ stats.totalBooths }}</p>
            </div>
            <div class="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Products -->
        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">Total Productos</p>
              <p class="text-3xl font-bold mt-1">{{ stats.totalProducts }}</p>
            </div>
            <div class="bg-white bg-opacity-20 p-3 rounded-lg">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue and Orders -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Card -->
        <div class="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Ingresos Totales</h3>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-4xl font-bold">S/ {{ formatMoney(stats.totalRevenue) }}</p>
          <p class="text-amber-100 text-sm mt-2">De pedidos confirmados y entregados</p>
        </div>

        <!-- Orders Summary -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">Resumen de Pedidos</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-yellow-400 rounded-full"></span>
                <span class="text-sm">Pendientes</span>
              </div>
              <span class="font-semibold">{{ stats.orders.pending }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-blue-400 rounded-full"></span>
                <span class="text-sm">Confirmados</span>
              </div>
              <span class="font-semibold">{{ stats.orders.confirmed }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-purple-400 rounded-full"></span>
                <span class="text-sm">Preparando</span>
              </div>
              <span class="font-semibold">{{ stats.orders.preparing }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-indigo-400 rounded-full"></span>
                <span class="text-sm">Enviados</span>
              </div>
              <span class="font-semibold">{{ stats.orders.shipped }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-green-400 rounded-full"></span>
                <span class="text-sm">Entregados</span>
              </div>
              <span class="font-semibold">{{ stats.orders.delivered }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 bg-red-400 rounded-full"></span>
                <span class="text-sm">Cancelados</span>
              </div>
              <span class="font-semibold">{{ stats.orders.cancelled }}</span>
            </div>
            <div class="pt-3 border-t flex items-center justify-between">
              <span class="text-sm font-semibold">Total</span>
              <span class="font-bold text-lg">{{ stats.totalOrders }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card">
        <h3 class="text-xl font-semibold mb-4">Pedidos Recientes</h3>

        <div v-if="recentOrders.length" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booth</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-mono">{{ order.orderNumber }}</td>
                <td class="px-4 py-3 text-sm">{{ order.user.name }}</td>
                <td class="px-4 py-3 text-sm">{{ order.booth.name }}</td>
                <td class="px-4 py-3 text-sm font-semibold">S/ {{ formatMoney(order.total) }}</td>
                <td class="px-4 py-3">
                  <span :class="getOrderStatusClass(order.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getOrderStatusLabel(order.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(order.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          No hay pedidos recientes
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card bg-red-50 text-red-600">
      <p>{{ error }}</p>
      <button @click="loadStats" class="btn btn-primary mt-4">Reintentar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminAPI } from '@/services/api'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const loading = ref(true)
const error = ref(null)
const stats = ref(null)
const recentOrders = ref([])

onMounted(() => {
  loadStats()
})

async function loadStats() {
  loading.value = true
  error.value = null

  try {
    const response = await adminAPI.getStats()
    stats.value = response.data.stats
    recentOrders.value = response.data.recentOrders
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar estadísticas'
  } finally {
    loading.value = false
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getOrderStatusLabel(status) {
  const labels = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PREPARING: 'Preparando',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  }
  return labels[status] || status
}

function getOrderStatusClass(status) {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PREPARING: 'bg-purple-100 text-purple-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}
</script>
