<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Transmisión en Vivo</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <!-- No Booth -->
    <div v-else-if="!booth" class="card text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <h3 class="text-xl font-semibold mb-2">No tienes un booth asignado</h3>
      <p class="text-gray-600">Contacta al administrador para que te asigne un booth.</p>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Stream Controls Card -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-semibold mb-1">{{ booth.name }}</h2>
            <div class="flex items-center gap-2">
              <span
                :class="isStreaming ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'"
                class="px-3 py-1 text-sm font-medium rounded-full flex items-center gap-2"
              >
                <span v-if="isStreaming" class="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                {{ isStreaming ? 'Transmitiendo' : 'Desconectado' }}
              </span>
            </div>
          </div>

          <!-- Stream Control Button -->
          <button
            v-if="!isStreaming"
            @click="startStream"
            :disabled="starting"
            class="btn btn-primary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ starting ? 'Iniciando...' : 'Iniciar Transmisión' }}
          </button>

          <button
            v-else
            @click="stopStream"
            :disabled="stopping"
            class="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            {{ stopping ? 'Deteniendo...' : 'Detener Transmisión' }}
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Video Preview -->
        <div class="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
          <!-- Local Video -->
          <div
            v-if="isStreaming || isPublishing"
            id="local-video"
            class="w-full h-full"
          ></div>

          <!-- Placeholder -->
          <div v-else class="w-full h-full flex items-center justify-center text-white">
            <div class="text-center">
              <svg class="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p class="text-xl font-semibold text-gray-400">Vista Previa de Cámara</p>
              <p class="text-sm text-gray-500 mt-2">Haz clic en "Iniciar Transmisión" para comenzar</p>
            </div>
          </div>

          <!-- Live Indicator -->
          <div v-if="isStreaming" class="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium flex items-center gap-2">
            <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            EN VIVO
          </div>

          <!-- Duration Counter -->
          <div v-if="isStreaming" class="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-50 text-white rounded-full text-sm font-medium">
            {{ streamDuration }}
          </div>
        </div>

        <!-- Stream Controls (when live) -->
        <div v-if="isStreaming" class="grid grid-cols-3 gap-4 mt-4">
          <!-- Mute Audio -->
          <button
            @click="toggleAudio"
            class="btn btn-secondary flex items-center justify-center gap-2"
          >
            <svg v-if="audioEnabled" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            {{ audioEnabled ? 'Silenciar' : 'Activar Audio' }}
          </button>

          <!-- Pause Video -->
          <button
            @click="toggleVideo"
            class="btn btn-secondary flex items-center justify-center gap-2"
          >
            <svg v-if="videoEnabled" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            {{ videoEnabled ? 'Pausar Video' : 'Activar Video' }}
          </button>

          <!-- Switch Camera -->
          <button
            @click="switchCamera"
            class="btn btn-secondary flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Cambiar Cámara
          </button>
        </div>
      </div>

      <!-- Statistics Card -->
      <div v-if="isStreaming" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card text-center">
          <div class="text-3xl font-bold text-purple-600 mb-1">{{ viewerCount }}</div>
          <div class="text-sm text-gray-600">Espectadores</div>
        </div>

        <div class="card text-center">
          <div class="text-3xl font-bold text-blue-600 mb-1">{{ messageCount }}</div>
          <div class="text-sm text-gray-600">Mensajes en Chat</div>
        </div>

        <div class="card text-center">
          <div class="text-3xl font-bold text-green-600 mb-1">{{ streamDuration }}</div>
          <div class="text-sm text-gray-600">Duración</div>
        </div>
      </div>

      <!-- Tips Card -->
      <div class="card bg-blue-50">
        <h3 class="font-semibold text-blue-900 mb-2">💡 Consejos para una buena transmisión</h3>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• Asegúrate de tener una buena conexión a internet (mínimo 5 Mbps de subida)</li>
          <li>• Usa buena iluminación para que los productos se vean claramente</li>
          <li>• Mantén la cámara estable y a un ángulo adecuado</li>
          <li>• Interactúa con tus espectadores a través del chat</li>
          <li>• Muestra tus productos de cerca y menciona precios y características</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useBoothsStore } from '@/stores/booths'
import { useAgora } from '@/composables/useAgora'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import api from '@/services/api'

const boothsStore = useBoothsStore()

const loading = ref(true)
const booth = ref(null)
const starting = ref(false)
const stopping = ref(false)
const errorMessage = ref('')

// Agora streaming
const {
  localVideoTrack,
  localAudioTrack,
  isJoined,
  isPublishing,
  joinChannel,
  leaveChannel,
  startPublishing,
  stopPublishing,
  toggleAudio: toggleAudioTrack,
  toggleVideo: toggleVideoTrack,
  switchCamera: switchCameraDevice
} = useAgora()

const isStreaming = computed(() => booth.value?.isStreaming || false)
const audioEnabled = ref(true)
const videoEnabled = ref(true)

// Statistics
const viewerCount = ref(0)
const messageCount = ref(0)
const streamStartTime = ref(null)
const streamDuration = ref('00:00')
let durationInterval = null

onMounted(async () => {
  try {
    const response = await boothsStore.fetchMyBooth()
    booth.value = response

    // If already streaming, rejoin
    if (booth.value.isStreaming) {
      await rejoinStream()
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Error al cargar el booth'
  } finally {
    loading.value = false
  }
})

onUnmounted(async () => {
  if (durationInterval) {
    clearInterval(durationInterval)
  }
  if (isJoined.value) {
    await leaveChannel()
  }
})

async function startStream() {
  starting.value = true
  errorMessage.value = ''

  try {
    // Start streaming on backend
    const response = await api.post(`/booths/${booth.value.id}/stream/start`)
    const { booth: updatedBooth, agora } = response.data

    booth.value = updatedBooth

    // Join Agora channel as host
    await joinChannel(agora.appId, agora.channel, agora.token, agora.uid, 'host')

    // Start publishing
    await startPublishing('local-video')

    // Start duration counter
    streamStartTime.value = Date.now()
    startDurationCounter()

    // Update mock stats
    viewerCount.value = 0
    messageCount.value = 0
  } catch (error) {
    console.error('Start stream error:', error)
    errorMessage.value = error.response?.data?.error || 'Error al iniciar la transmisión'
  } finally {
    starting.value = false
  }
}

async function stopStream() {
  stopping.value = true
  errorMessage.value = ''

  try {
    // Stop publishing
    await stopPublishing()

    // Leave channel
    await leaveChannel()

    // Stop streaming on backend
    await api.post(`/booths/${booth.value.id}/stream/stop`)
    booth.value.isStreaming = false

    // Stop duration counter
    if (durationInterval) {
      clearInterval(durationInterval)
      durationInterval = null
    }
    streamDuration.value = '00:00'
  } catch (error) {
    console.error('Stop stream error:', error)
    errorMessage.value = error.response?.data?.error || 'Error al detener la transmisión'
  } finally {
    stopping.value = false
  }
}

async function rejoinStream() {
  try {
    // Get stream token
    const response = await api.get(`/booths/${booth.value.id}/stream/token`)
    const { appId, channel, token, uid } = response.data

    // Join as host
    await joinChannel(appId, channel, token, uid, 'host')

    // Start publishing
    await startPublishing('local-video')

    // Estimate stream start time (rough estimate)
    if (booth.value.streamStarted) {
      streamStartTime.value = new Date(booth.value.streamStarted).getTime()
      startDurationCounter()
    }
  } catch (error) {
    console.error('Rejoin stream error:', error)
    errorMessage.value = 'Error al reconectar con la transmisión'
  }
}

async function toggleAudio() {
  audioEnabled.value = !audioEnabled.value
  await toggleAudioTrack(!audioEnabled.value)
}

async function toggleVideo() {
  videoEnabled.value = !videoEnabled.value
  await toggleVideoTrack(videoEnabled.value)
}

async function switchCamera() {
  try {
    await switchCameraDevice()
  } catch (error) {
    console.error('Switch camera error:', error)
  }
}

function startDurationCounter() {
  if (durationInterval) {
    clearInterval(durationInterval)
  }

  durationInterval = setInterval(() => {
    if (!streamStartTime.value) return

    const elapsed = Date.now() - streamStartTime.value
    const seconds = Math.floor(elapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    const displayMinutes = minutes % 60
    const displaySeconds = seconds % 60

    if (hours > 0) {
      streamDuration.value = `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`
    } else {
      streamDuration.value = `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`
    }

    // Mock viewer count increase
    if (seconds % 5 === 0 && viewerCount.value < 100) {
      viewerCount.value += Math.floor(Math.random() * 3)
    }

    // Mock message count increase
    if (seconds % 10 === 0) {
      messageCount.value += Math.floor(Math.random() * 2)
    }
  }, 1000)
}
</script>
