<template>
  <!-- Full Screen Live Shopping Experience -->
  <div class="relative flex h-screen w-full max-w-lg mx-auto flex-col overflow-hidden bg-black">

    <!-- Main Content Area with Video Player -->
    <div class="absolute inset-0 h-full w-full">
      <!-- Loading State -->
      <div v-if="loading" class="flex h-full items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>

      <!-- Media Player -->
      <div v-else-if="booth" class="relative flex h-full w-full flex-col bg-black">
        <!-- Video Container -->
        <div
          id="video-container"
          class="relative flex h-full items-center justify-center bg-black bg-cover bg-center"
          :style="!remoteUsers.length && booth.bannerUrl ? `background-image: url(${booth.bannerUrl})` : ''"
        >
          <!-- Remote Stream (Exhibitor) -->
          <div v-if="remoteUsers.length > 0" class="w-full h-full">
            <div
              v-for="user in remoteUsers"
              :key="user.uid"
              :id="`remote-player-${user.uid}`"
              class="w-full h-full"
            ></div>
          </div>

          <!-- Placeholder when not streaming -->
          <div v-else-if="!booth.isStreaming || !remoteUsers.length" class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-white z-10">
              <svg class="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p class="text-lg font-medium opacity-80">{{ streamStatus }}</p>
            </div>
            <!-- Dark overlay for better text readability -->
            <div class="absolute inset-0 bg-black/40"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex h-full items-center justify-center bg-gray-900 p-8">
        <div class="text-center text-white">
          <p class="text-lg">{{ error }}</p>
          <button @click="$router.go(-1)" class="mt-4 px-6 py-2 bg-pink-600 rounded-full">
            Volver
          </button>
        </div>
      </div>
    </div>

    <!-- UI Overlay -->
    <div v-if="booth" class="relative z-10 flex h-full w-full flex-col justify-between pointer-events-none">

      <!-- Top App Bar -->
      <div class="flex items-center p-4 pb-2 justify-between bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-auto">
        <div class="flex items-center gap-3">
          <!-- Booth Logo/Avatar -->
          <div
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 ring-2 ring-white/30"
            :style="`background-image: url(${booth.bannerUrl || 'https://via.placeholder.com/40'})`"
          ></div>
          <div>
            <p class="text-white text-base font-bold leading-tight">{{ booth.name }}</p>
            <p v-if="booth.isStreaming" class="text-white/90 text-sm font-medium leading-tight flex items-center gap-1">
              <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              EN VIVO
            </p>
            <p v-else class="text-white/70 text-sm font-normal leading-tight">Offline</p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2">
          <!-- Cart Button -->
          <button
            @click="showCartModal = true"
            class="relative flex cursor-pointer items-center justify-center rounded-full w-10 h-10 bg-pink-600 text-white backdrop-blur-sm hover:bg-pink-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 bg-white text-pink-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {{ cartStore.totalItems }}
            </span>
          </button>
          <!-- Back Button -->
          <button
            @click="$router.go(-1)"
            class="flex cursor-pointer items-center justify-center rounded-full w-10 h-10 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Center Area: Comments and Products -->
      <div class="flex flex-1 justify-between p-4 pb-0 pointer-events-none">

        <!-- Comments Overlay (Left Side) -->
        <div class="flex flex-col-reverse self-end h-1/2 max-w-[65%] overflow-hidden pointer-events-auto"
             style="mask-image: linear-gradient(to top, black 60%, transparent 100%)">
          <div class="flex flex-col gap-2">
            <div
              v-for="message in recentMessages"
              :key="message.id"
              class="flex w-full flex-row items-start justify-start gap-2 animate-slide-up"
            >
              <div
                class="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-7 h-7 shrink-0"
                :style="`background-image: url(https://ui-avatars.com/api/?name=${encodeURIComponent(message.user?.name || 'User')}&background=random)`"
              ></div>
              <div class="flex h-full flex-1 flex-col items-start justify-start rounded-lg bg-black/40 p-2 backdrop-blur-sm">
                <p class="text-white text-xs font-bold">{{ message.user?.name || 'Usuario' }}</p>
                <p class="text-white text-sm font-normal leading-snug">{{ message.content }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Carousel - Vertical on the right -->
        <div class="flex flex-col items-stretch justify-end gap-2 pointer-events-auto">
          <div
            v-for="(product, index) in products.slice(0, 3)"
            :key="product.id"
            @click="showProductModal(product)"
            class="flex w-16 h-16 shrink-0 flex-col gap-4 rounded-lg cursor-pointer hover:scale-110 transition-transform"
            :class="index === selectedProductIndex ? 'ring-2 ring-pink-500 shadow-lg' : ''"
          >
            <div
              class="h-full w-full bg-center bg-no-repeat bg-cover rounded-lg"
              :style="`background-image: url(${product.images?.[0] || 'https://via.placeholder.com/64'})`"
            ></div>
          </div>
        </div>
      </div>

      <!-- Bottom Input Bar -->
      <div class="p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-auto">
        <div class="flex items-center gap-3">
          <input
            v-model="newComment"
            @keyup.enter="sendComment"
            class="h-12 flex-1 rounded-full border-none bg-black/30 px-4 text-white placeholder-white/60 focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
            placeholder="Escribe un comentario..."
            type="text"
          />
          <button
            @click="sendComment"
            :disabled="!newComment.trim()"
            class="flex shrink-0 items-center justify-center rounded-full w-12 h-12 bg-pink-600 text-white hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <Transition name="slide-up">
      <div
        v-if="selectedProduct && showModal"
        class="absolute inset-0 z-30 flex items-end bg-black/50 backdrop-blur-sm"
        @click.self="closeProductModal"
      >
        <div class="flex w-full flex-col gap-6 rounded-t-2xl bg-gray-900 p-6 max-h-[80vh] overflow-y-auto">
          <!-- Close button -->
          <button
            @click="closeProductModal"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="flex items-start gap-4">
            <div
              class="w-24 h-24 bg-center bg-no-repeat aspect-square bg-cover rounded-lg shrink-0"
              :style="`background-image: url(${selectedProduct.images?.[0] || 'https://via.placeholder.com/96'})`"
            ></div>
            <div class="flex flex-col flex-1">
              <p class="text-white text-2xl font-bold leading-tight mb-1">S/ {{ formatPrice(selectedProduct.price) }}</p>
              <p class="text-white text-base font-semibold leading-normal">{{ selectedProduct.name }}</p>
              <p class="text-white/70 text-sm font-normal leading-normal mt-2">{{ selectedProduct.description }}</p>
              <p v-if="selectedProduct.stock > 0" class="text-white/60 text-sm mt-1">Stock disponible: {{ selectedProduct.stock }}</p>
              <p v-else class="text-red-400 text-sm font-medium mt-1">Sin stock</p>
            </div>
          </div>

          <!-- Own Booth Warning -->
          <div v-if="isBoothMember" class="p-3 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm text-center">
            No puedes comprar productos de tu propio booth
          </div>

          <!-- Add to Cart Button -->
          <button
            v-else-if="selectedProduct.stock > 0"
            @click="addToCartFromModal"
            class="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 bg-pink-600 text-white text-base font-bold leading-normal hover:bg-pink-700 transition-colors"
          >
            Agregar al Carrito
          </button>

          <!-- Out of Stock Button -->
          <button
            v-else
            disabled
            class="flex w-full items-center justify-center rounded-xl h-12 bg-gray-700 text-gray-400 text-base font-bold leading-normal cursor-not-allowed"
          >
            No Disponible
          </button>
        </div>
      </div>
    </Transition>

    <!-- Shopping Cart Modal -->
    <ShoppingCart :is-open="showCartModal" @close="showCartModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBoothsStore } from '@/stores/booths'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useAgora } from '@/composables/useAgora'
import { subscribeToBoothMessages } from '@/services/supabase'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import ShoppingCart from '@/components/booths/ShoppingCart.vue'
import api from '@/services/api'

const route = useRoute()
const authStore = useAuthStore()
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
  leaveChannel,
  setOnVideoTrack
} = useAgora()

const streamStatus = ref('Conectando al stream...')
const streamError = ref(null)

// Track which videos have been played to avoid multiple play() calls
const playedVideos = new Set()

// Set up callback for when video tracks are ready
setOnVideoTrack(async (uid, videoTrack) => {
  if (playedVideos.has(uid)) {
    console.log(`⏭️ Video for user ${uid} already played, skipping`)
    return
  }

  console.log(`🎥 Video track ready for user ${uid}, waiting for DOM...`)
  streamStatus.value = 'Stream activo'

  // Wait for Vue to render the DOM element
  await nextTick()

  const playerElement = document.getElementById(`remote-player-${uid}`)
  if (playerElement) {
    console.log(`📺 Playing video for user ${uid}`)
    try {
      videoTrack.play(playerElement)
      playedVideos.add(uid)
      console.log(`✅ Video playing successfully for user ${uid}`)
    } catch (error) {
      console.error(`❌ Failed to play video for user ${uid}:`, error)
    }
  } else {
    console.error(`❌ Player element not found for user ${uid}`)
  }
})

// Chat
const newComment = ref('')
const messages = ref([])
let realtimeChannel = null
let messagePollingInterval = null

// Only show last 5 messages as overlay
const recentMessages = computed(() => {
  return messages.value.slice(-5)
})

// Product modal
const selectedProduct = ref(null)
const selectedProductIndex = ref(0)
const showModal = ref(false)

// Shopping cart modal
const showCartModal = ref(false)

// Load booth and products
onMounted(async () => {
  try {
    const boothId = route.params.id
    booth.value = await boothsStore.fetchBoothById(boothId)
    const response = await productsStore.fetchProductsByBooth(boothId)
    products.value = response.products

    // Check if current user is a booth member
    if (authStore.isAuthenticated && booth.value.members) {
      isBoothMember.value = booth.value.members.some(
        member => member.userId === authStore.user?.id
      )
    }

    // Load initial messages
    await loadMessages()

    // Subscribe to new messages
    subscribeToMessages()

    // If booth is streaming, join the stream
    if (booth.value.isStreaming) {
      await initStream()
    } else {
      streamStatus.value = 'El booth no está transmitiendo'
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
  } catch (err) {
    console.error('Stream init error:', err)
    streamError.value = err.response?.data?.error || 'Error al conectar con el stream'
    streamStatus.value = 'Error al conectar'
  }
}

// Load messages
async function loadMessages() {
  try {
    const response = await api.get(`/messages/booth/${booth.value.id}`, {
      params: { limit: 50 }
    })
    messages.value = response.data.messages
  } catch (err) {
    console.error('Error loading messages:', err)
  }
}

// Subscribe to real-time messages
function subscribeToMessages() {
  try {
    realtimeChannel = subscribeToBoothMessages(booth.value.id, async () => {
      // Reload messages when new one arrives
      await loadMessages()
    })

    if (!realtimeChannel) {
      console.warn('Real-time chat not available (Supabase not configured)')
      // Poll for messages every 5 seconds as fallback
      if (!messagePollingInterval) {
        messagePollingInterval = setInterval(async () => {
          await loadMessages()
        }, 5000)
      }
    }
  } catch (error) {
    console.error('Failed to subscribe to messages:', error)
  }
}

// Send comment
async function sendComment() {
  if (!newComment.value.trim()) return

  if (!authStore.isAuthenticated) {
    alert('Debes iniciar sesión para comentar')
    return
  }

  try {
    await api.post('/messages', {
      boothId: booth.value.id,
      content: newComment.value.trim()
    })
    newComment.value = ''
  } catch (err) {
    console.error('Error sending message:', err)
    alert('Error al enviar mensaje')
  }
}

// Product modal functions
function showProductModal(product) {
  selectedProduct.value = product
  selectedProductIndex.value = products.value.findIndex(p => p.id === product.id)
  showModal.value = true
}

function closeProductModal() {
  showModal.value = false
  setTimeout(() => {
    selectedProduct.value = null
  }, 300)
}

function addToCartFromModal() {
  if (!selectedProduct.value) return

  cartStore.addItem({
    productId: selectedProduct.value.id,
    name: selectedProduct.value.name,
    price: selectedProduct.value.price,
    imageUrl: selectedProduct.value.images?.[0] || '',
    boothId: booth.value.id,
    boothName: booth.value.name,
    quantity: 1
  })

  // Show feedback
  const button = event.target
  button.textContent = '¡Agregado! ✓'
  button.classList.add('bg-green-600')

  setTimeout(() => {
    closeProductModal()
  }, 800)
}

// Cleanup on unmount
onUnmounted(async () => {
  if (isJoined.value) {
    await leaveChannel()
  }
  if (realtimeChannel) {
    realtimeChannel.unsubscribe()
  }
  if (messagePollingInterval) {
    clearInterval(messagePollingInterval)
    messagePollingInterval = null
  }
  // Clear played videos set
  playedVideos.clear()
})

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}
</script>

<style scoped>
/* Slide up animation for modal */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Slide up animation for new comments */
@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

/* Hide scrollbar but keep functionality */
.overflow-y-auto::-webkit-scrollbar {
  width: 0px;
}

.overflow-y-auto {
  scrollbar-width: none;
}
</style>
