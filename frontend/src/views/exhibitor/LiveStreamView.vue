<template>
  <div class="fixed inset-0 bg-black flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-full">
      <LoadingSpinner />
    </div>

    <!-- No Booth -->
    <div v-else-if="!booth" class="flex flex-col items-center justify-center h-full p-8 text-center">
      <div class="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Sin booth asignado</h3>
      <p class="text-gray-400 text-sm">Contacta al administrador</p>
    </div>

    <!-- Main Content -->
    <div v-else class="flex flex-col h-full">
      <!-- Video Preview Area -->
      <div class="flex-1 relative bg-gray-900">
        <!-- Local Video Container -->
        <div
          v-if="isStreaming || isPublishing"
          id="local-video"
          class="w-full h-full"
        ></div>

        <!-- Placeholder -->
        <div v-else class="w-full h-full flex items-center justify-center">
          <div class="text-center p-8">
            <div class="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-xl font-bold text-white mb-2">Vista Previa</p>
            <p class="text-sm text-gray-400">Inicia la transmisión para comenzar</p>
          </div>
        </div>

        <!-- Top Overlay -->
        <div class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div class="flex items-center justify-between">
            <!-- Live Badge -->
            <div v-if="isStreaming" class="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full">
              <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span class="text-white text-sm font-bold">EN VIVO</span>
            </div>
            <div v-else class="px-4 py-2 bg-gray-800 rounded-full">
              <span class="text-gray-400 text-sm font-bold">OFFLINE</span>
            </div>

            <!-- Duration -->
            <div v-if="isStreaming" class="px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full">
              <span class="text-white text-sm font-bold font-mono">{{ streamDuration }}</span>
            </div>
          </div>
        </div>

        <!-- Stats Overlay (Bottom) -->
        <div v-if="isStreaming" class="absolute bottom-20 left-0 right-0 px-4">
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-black/50 backdrop-blur-sm rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-white">{{ viewerCount }}</div>
              <div class="text-xs text-gray-300">Espectadores</div>
            </div>
            <div class="bg-black/50 backdrop-blur-sm rounded-xl p-3 text-center">
              <div class="text-2xl font-bold text-white">{{ messageCount }}</div>
              <div class="text-xs text-gray-300">Mensajes</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Controls -->
      <div class="bg-gray-900 border-t border-gray-800">
        <!-- Error Message -->
        <div v-if="errorMessage" class="px-4 pt-3">
          <div class="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-xl text-sm font-medium">
            {{ errorMessage }}
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="p-4 space-y-3">
          <!-- Start/Stop Button -->
          <button
            v-if="!isStreaming"
            @click="startStream"
            :disabled="starting"
            class="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ starting ? 'Iniciando...' : 'Iniciar Transmisión' }}
          </button>

          <button
            v-else
            @click="stopStream"
            :disabled="stopping"
            class="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            {{ stopping ? 'Deteniendo...' : 'Detener Transmisión' }}
          </button>

          <!-- Stream Controls (when live) -->
          <div v-if="isStreaming" class="grid grid-cols-3 gap-3">
            <!-- Mute Audio -->
            <button
              @click="toggleAudio"
              :class="audioEnabled ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'"
              class="py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
            >
              <svg v-if="audioEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <span class="text-xs">{{ audioEnabled ? 'Audio' : 'Mute' }}</span>
            </button>

            <!-- Toggle Video -->
            <button
              @click="toggleVideo"
              :class="videoEnabled ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'"
              class="py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
            >
              <svg v-if="videoEnabled" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span class="text-xs">{{ videoEnabled ? 'Video' : 'Off' }}</span>
            </button>

            <!-- Switch Camera -->
            <button
              @click="switchCamera"
              class="bg-gray-800 text-white py-4 rounded-xl font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span class="text-xs">Rotar</span>
            </button>
          </div>
        </div>

        <!-- Tips (Collapsible) -->
        <div v-if="!isStreaming" class="px-4 pb-4">
          <button
            @click="showTips = !showTips"
            class="w-full py-3 bg-gray-800 text-gray-300 rounded-xl font-medium active:scale-[0.98] transition-all flex items-center justify-between px-4"
          >
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              <span class="text-sm">Consejos para tu transmisión</span>
            </div>
            <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': showTips }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <Transition name="slide-down">
            <div v-if="showTips" class="mt-3 bg-gray-800 rounded-xl p-4">
              <ul class="text-sm text-gray-300 space-y-2">
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Buena conexión a internet (mínimo 5 Mbps)</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Iluminación clara para mostrar productos</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Interactúa con la audiencia en el chat</span>
                </li>
                <li class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Muestra productos de cerca con precios</span>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
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
const showTips = ref(false)

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
    // Update store so ExhibitorLayout can react
    boothsStore.myBooth = updatedBooth

    // Join Agora channel as host
    await joinChannel(agora.appId, agora.channel, agora.token, agora.uid, 'host')

    // Start publishing
    await startPublishing('local-video')

    // Start duration counter
    streamStartTime.value = Date.now()
    startDurationCounter()

    // Reset stats
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
    // Update store so ExhibitorLayout can react
    if (boothsStore.myBooth) {
      boothsStore.myBooth.isStreaming = false
    }

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
    const response = await api.get(`/booths/${booth.value.id}/stream-token`)
    const { appId, channel, token, uid } = response.data

    // Join as host
    await joinChannel(appId, channel, token, uid, 'host')

    // Start publishing
    await startPublishing('local-video')

    // Estimate stream start time
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

<style scoped>
/* Slide down animation for tips */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
