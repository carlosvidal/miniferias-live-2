<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow-sm">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200">
      <h3 class="font-semibold text-gray-900">Chat en Vivo</h3>
      <p class="text-xs text-gray-500 mt-1">
        {{ messages.length }} mensaje{{ messages.length !== 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Messages Container -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-3"
      style="max-height: 400px"
    >
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="messages.length === 0" class="text-center py-8">
        <p class="text-gray-500 text-sm">No hay mensajes aún</p>
        <p class="text-gray-400 text-xs mt-1">¡Sé el primero en comentar!</p>
      </div>

      <!-- Messages List -->
      <div v-else v-for="message in messages" :key="message.id" class="flex gap-2">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div v-if="message.user?.profilePicture" class="w-8 h-8 rounded-full overflow-hidden">
            <img :src="message.user.profilePicture" :alt="message.user.name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium">
            {{ getInitials(message.user?.name || 'U') }}
          </div>
        </div>

        <!-- Message Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2">
            <span class="font-medium text-sm text-gray-900">{{ message.user?.name || 'Usuario' }}</span>
            <span class="text-xs text-gray-500">{{ formatTime(message.createdAt) }}</span>
          </div>
          <p class="text-sm text-gray-700 break-words">{{ message.content }}</p>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="border-t border-gray-200 p-4">
      <!-- Rate Limit Warning -->
      <div v-if="rateLimitWarning" class="mb-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">
        ⚠️ Máximo 5 mensajes por minuto. Espera un momento.
      </div>

      <!-- Not Authenticated -->
      <div v-if="!isAuthenticated" class="text-center py-2">
        <p class="text-sm text-gray-600 mb-2">Inicia sesión para participar en el chat</p>
        <router-link to="/login" class="text-sm text-purple-600 hover:text-purple-700 font-medium">
          Iniciar Sesión
        </router-link>
      </div>

      <!-- Message Form -->
      <form v-else @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="newMessage"
          type="text"
          :disabled="sending || rateLimitWarning"
          maxlength="500"
          placeholder="Escribe un mensaje..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
        />
        <button
          type="submit"
          :disabled="!newMessage.trim() || sending || rateLimitWarning"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {{ sending ? '...' : 'Enviar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { subscribeToBoothMessages, unsubscribeFromChannel } from '@/services/supabase'

const props = defineProps({
  boothId: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()
const isAuthenticated = ref(authStore.isAuthenticated)

const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const rateLimitWarning = ref(false)
const messagesContainer = ref(null)
let realtimeChannel = null

// Fetch initial messages
async function loadMessages() {
  try {
    loading.value = true
    const response = await api.get(`/messages/booth/${props.boothId}`, {
      params: { limit: 100 }
    })
    messages.value = response.data.messages
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    loading.value = false
  }
}

// Send message
async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return

  try {
    sending.value = true
    const response = await api.post('/messages', {
      boothId: props.boothId,
      content: newMessage.value.trim()
    })

    // Message will be added via realtime subscription
    newMessage.value = ''
    rateLimitWarning.value = false
  } catch (error) {
    console.error('Error sending message:', error)

    if (error.response?.status === 429) {
      rateLimitWarning.value = true
      setTimeout(() => {
        rateLimitWarning.value = false
      }, 10000)
    } else {
      alert(error.response?.data?.error || 'Error al enviar mensaje')
    }
  } finally {
    sending.value = false
  }
}

// Subscribe to realtime updates
function subscribeToMessages() {
  realtimeChannel = subscribeToBoothMessages(props.boothId, async (newMsg) => {
    // Fetch the full message with user data
    try {
      const response = await api.get(`/messages/booth/${props.boothId}`, {
        params: { limit: 1 }
      })

      const latestMessage = response.data.messages[response.data.messages.length - 1]

      // Check if message already exists
      if (!messages.value.find(m => m.id === latestMessage.id)) {
        messages.value.push(latestMessage)
        await nextTick()
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error fetching new message:', error)
    }
  })
}

// Scroll to bottom
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // Less than 1 minute
  if (diff < 60000) {
    return 'Ahora'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `Hace ${minutes}m`
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `Hace ${hours}h`
  }

  // Show date
  return date.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })
}

// Get user initials
function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Watch for authentication changes
watch(() => authStore.isAuthenticated, (newVal) => {
  isAuthenticated.value = newVal
})

onMounted(() => {
  loadMessages()
  subscribeToMessages()
})

onUnmounted(() => {
  if (realtimeChannel) {
    unsubscribeFromChannel(realtimeChannel)
  }
})
</script>
