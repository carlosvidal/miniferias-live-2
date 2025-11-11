<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <LoadingSpinner v-if="loading" />

      <div v-else-if="booth" class="space-y-8">
        <!-- Booth Header -->
        <div class="card">
          <div v-if="booth.bannerUrl" class="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
            <img :src="booth.bannerUrl" :alt="booth.name" class="w-full h-full object-cover" />
          </div>
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold mb-2">{{ booth.name }}</h1>
              <p class="text-gray-600 mb-4">{{ booth.description }}</p>
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span>📦 {{ products.length }} productos</span>
                <span v-if="booth.event">📅 {{ booth.event.name }}</span>
              </div>
            </div>
            <span v-if="booth.isStreaming" class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-2">
              <span class="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              EN VIVO
            </span>
          </div>
        </div>

        <!-- Live Streaming Placeholder -->
        <div v-if="booth.isStreaming" class="card bg-gradient-to-br from-purple-50 to-pink-50">
          <div class="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white">
            <div class="text-center">
              <svg class="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p class="text-xl font-semibold">Transmisión en Vivo</p>
              <p class="text-sm text-gray-300 mt-2">La integración de streaming estará disponible próximamente</p>
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div>
          <h2 class="text-2xl font-bold mb-6">Productos</h2>

          <div v-if="products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="product in products" :key="product.id" class="card hover:shadow-lg transition-shadow">
              <div v-if="product.imageUrl" class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>

              <h3 class="text-lg font-semibold mb-2">{{ product.name }}</h3>
              <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>

              <div class="flex items-center justify-between mb-4">
                <span class="text-2xl font-bold text-purple-600">S/ {{ formatPrice(product.price) }}</span>
                <span v-if="product.stock > 0" class="text-sm text-gray-500">Stock: {{ product.stock }}</span>
                <span v-else class="text-sm text-red-600 font-medium">Agotado</span>
              </div>

              <button v-if="product.stock > 0" @click="addToCart(product)" class="btn btn-primary w-full">
                Agregar al Carrito
              </button>
              <button v-else disabled class="btn btn-secondary w-full opacity-50 cursor-not-allowed">
                No Disponible
              </button>
            </div>
          </div>

          <div v-else class="text-center py-12 card">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="text-gray-600">Este booth aún no tiene productos disponibles</p>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="card bg-red-50 text-red-600">
        <p>{{ error }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoothsStore } from '@/stores/booths'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import AppHeader from '@/components/shared/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const route = useRoute()
const boothsStore = useBoothsStore()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const loading = ref(true)
const error = ref(null)
const booth = ref(null)
const products = ref([])

onMounted(async () => {
  try {
    const boothId = route.params.id
    booth.value = await boothsStore.fetchBoothById(boothId)
    const response = await productsStore.fetchProductsByBooth(boothId)
    products.value = response.products
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar el booth'
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

function addToCart(product) {
  cartStore.addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    boothId: booth.value.id,
    boothName: booth.value.name,
    quantity: 1
  })
  alert(`${product.name} agregado al carrito`)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
