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

        <!-- Live Streaming + Chat Section -->
        <div v-if="booth.isStreaming" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Live Stream -->
          <div class="lg:col-span-2">
            <div class="card">
              <div id="video-container" class="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                <!-- Remote Stream (Exhibitor) -->
                <div v-if="remoteUsers.length > 0" class="w-full h-full">
                  <div
                    v-for="user in remoteUsers"
                    :key="user.uid"
                    :id="`remote-player-${user.uid}`"
                    class="w-full h-full"
                  ></div>
                </div>

                <!-- Placeholder when not streaming yet -->
                <div v-else class="w-full h-full flex items-center justify-center text-white">
                  <div class="text-center">
                    <div class="animate-pulse mb-4">
                      <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p class="text-lg font-medium">{{ streamStatus }}</p>
                  </div>
                </div>

                <!-- Live Badge -->
                <div class="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium flex items-center gap-2">
                  <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  EN VIVO
                </div>

                <!-- Viewer Count -->
                <div v-if="viewerCount > 0" class="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-50 text-white rounded-full text-sm flex items-center gap-2">
                  👁️ {{ viewerCount }} {{ viewerCount === 1 ? 'espectador' : 'espectadores' }}
                </div>
              </div>

              <!-- Stream Error -->
              <div v-if="streamError" class="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {{ streamError }}
              </div>
            </div>
          </div>

          <!-- Chat -->
          <div class="lg:col-span-1">
            <BoothChat :booth-id="booth.id" />
          </div>
        </div>

        <!-- Products Section -->
        <div>
          <h2 class="text-2xl font-bold mb-6">Productos</h2>

          <div v-if="products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="product in products" :key="product.id" class="card hover:shadow-lg transition-shadow">
              <div v-if="product.images?.[0]" class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
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

              <!-- Own Booth Message -->
              <div v-if="isBoothMember" class="text-center py-2 px-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                No puedes comprar de tu propio booth
              </div>

              <!-- Add to Cart Button -->
              <button
                v-else-if="product.stock > 0"
                @click="addToCart(product)"
                class="btn btn-primary w-full"
              >
                Agregar al Carrito
              </button>

              <!-- Out of Stock -->
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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBoothsStore } from '@/stores/booths'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useAgora } from '@/composables/useAgora'
import AppHeader from '@/components/shared/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import BoothChat from '@/components/booths/BoothChat.vue'
import api from '@/services/api'

const route = useRoute()
const boothsStore = useBoothsStore()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const loading = ref(true)
const error = ref(null)
const booth = ref(null)
const products = ref([])
const isBoothMember = ref(false)

// Agora streaming
const {
  remoteUsers,
  isJoined,
  joinChannel,
  leaveChannel
} = useAgora()

const streamStatus = ref('Conectando al stream...')
const streamError = ref(null)
const viewerCount = ref(0)

// Load booth and products
onMounted(async () => {
  try {
    const boothId = route.params.id
    booth.value = await boothsStore.fetchBoothById(boothId)
    const response = await productsStore.fetchProductsByBooth(boothId)
    products.value = response.products

    // Check if current user is a booth member
    const authStore = useAuthStore()
    if (authStore.isAuthenticated && booth.value.members) {
      isBoothMember.value = booth.value.members.some(
        member => member.userId === authStore.user?.id
      )
    }

    // If booth is streaming, join the stream
    if (booth.value.isStreaming) {
      await initStream()
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar el booth'
  } finally {
    loading.value = false
  }
})

// Initialize Agora stream
async function initStream() {
  try {
    streamStatus.value = 'Obteniendo acceso al stream...'

    // Get stream token from backend
    const response = await api.get(`/booths/${booth.value.id}/stream-token`)
    const { appId, channel, token, uid } = response.data

    streamStatus.value = 'Conectando al canal...'

    // Join as audience
    await joinChannel(appId, channel, token, uid, 'audience')

    streamStatus.value = 'Esperando transmisión...'

    // Update viewer count (mock for now, would need real implementation)
    viewerCount.value = Math.floor(Math.random() * 50) + 10
  } catch (err) {
    console.error('Stream init error:', err)
    streamError.value = err.response?.data?.error || 'Error al conectar con el stream'
    streamStatus.value = 'Error al conectar'
  }
}

// Watch for remote users and play their video
watch(remoteUsers, async (users) => {
  if (users.length > 0) {
    streamStatus.value = 'Stream activo'
    await nextTick()

    users.forEach(user => {
      if (user.videoTrack) {
        const playerElement = document.getElementById(`remote-player-${user.uid}`)
        if (playerElement) {
          user.videoTrack.play(playerElement)
        }
      }
    })
  } else {
    streamStatus.value = 'Esperando transmisión...'
  }
}, { deep: true })

// Cleanup on unmount
onUnmounted(async () => {
  if (isJoined.value) {
    await leaveChannel()
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
    imageUrl: product.images?.[0] || '',
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
