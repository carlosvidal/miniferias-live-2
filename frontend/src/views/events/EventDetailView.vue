<template>
  <div class="relative flex w-full flex-col min-h-screen bg-gray-900">
    <!-- Loading State -->
    <div v-if="eventsStore.loading" class="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="eventsStore.error" class="flex items-center justify-center min-h-screen">
      <div class="inline-block p-4 bg-red-500/20 text-red-400 rounded-2xl">
        {{ eventsStore.error }}
      </div>
    </div>

    <!-- Event Content -->
    <div v-else-if="event">
      <!-- Floating Header -->
      <header class="absolute top-0 z-20 flex w-full items-center justify-between p-4">
        <button
          @click="goBack"
          class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-if="webShareApiSupported"
          @click="shareEvent"
          :disabled="shareLoading"
          class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button
          v-else
          @click="copyEventLink"
          :disabled="copyLoading"
          class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors disabled:opacity-50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </header>

      <!-- Main Content -->
      <main class="flex-grow">
        <!-- Hero Image with Gradient -->
        <div class="relative h-96 w-full">
          <!-- Cover Image -->
          <div
            v-if="event.coverImage"
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${getCloudflareImageUrl(event.coverImage, 'cover')})` }"
          ></div>
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
          ></div>

          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>

          <!-- Live Badge -->
          <div
            v-if="event.isLive"
            class="absolute top-20 left-4 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-lg z-10"
          >
            <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            EN VIVO
          </div>
        </div>

        <!-- Content Over Gradient -->
        <div class="relative z-10 -mt-24 space-y-6 px-4 pb-8 max-w-4xl mx-auto">
          <!-- Title and Description -->
          <div>
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
              {{ event.name }}
            </h1>
            <p class="text-gray-300 text-base md:text-lg">
              {{ event.description }}
            </p>
          </div>

          <!-- Date/Time Card -->
          <div class="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur-sm p-4 shadow-lg">
            <svg class="w-8 h-8 md:w-10 md:h-10 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div class="flex-grow">
              <p class="font-bold text-white text-base md:text-lg">{{ formatEventDate(event.startDate) }}</p>
              <p class="text-sm text-gray-300">{{ formatEventTime(event.startDate) }}</p>
            </div>
            <button
              v-if="calendarOptions.length > 0"
              @click="addToCalendar"
              class="flex shrink-0 items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white hover:bg-pink-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">Calendario</span>
            </button>
          </div>

          <!-- Notifications and Reminders Card -->
          <div class="space-y-4 rounded-xl bg-white/5 backdrop-blur-sm p-4 md:p-6 shadow-lg">
            <h2 class="text-lg md:text-xl font-bold text-white">¡No te lo pierdas!</h2>

            <!-- Email Reminder -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-300" for="email">
                Recibir recordatorio por email
              </label>
              <form @submit.prevent="subscribeReminder" class="flex gap-2">
                <input
                  v-model="reminderEmail"
                  type="email"
                  id="email"
                  placeholder="tuemail@ejemplo.com"
                  required
                  :disabled="reminderLoading || reminderSuccess"
                  class="form-input h-12 flex-grow rounded-l-lg border-0 bg-black/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-pink-500"
                />
                <button
                  type="submit"
                  :disabled="reminderLoading || reminderSuccess"
                  class="flex h-12 items-center justify-center rounded-r-lg bg-pink-500 px-4 font-bold text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
              <p v-if="reminderError" class="text-red-400 text-xs mt-2">
                {{ reminderError }}
              </p>
              <p v-if="reminderSuccess" class="text-green-400 text-xs mt-2">
                ✓ ¡Te enviaremos un recordatorio antes del evento!
              </p>
            </div>

            <!-- Push Notifications Toggle -->
            <div
              v-if="notifications.isSupported"
              class="flex items-center justify-between rounded-lg bg-black/20 p-3 md:p-4"
            >
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p class="text-sm font-medium text-white">Activar Push Notifications</p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  :checked="isSubscribedToPush || pushSuccess"
                  @change="togglePushNotifications"
                  :disabled="pushLoading"
                  class="sr-only peer"
                />
                <div class="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-pink-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-disabled:opacity-50"></div>
              </label>
            </div>
            <p v-if="pushError" class="text-red-400 text-xs">
              {{ pushError }}
            </p>
            <p v-if="pushSuccess && !isSubscribedToPush" class="text-green-400 text-xs">
              ✓ ¡Notificaciones activadas!
            </p>
          </div>

          <!-- Sellers/Booths Section -->
          <div class="space-y-4 pt-2">
            <h2 class="text-lg md:text-xl font-bold text-white">Sellers Participantes</h2>

            <!-- Empty State -->
            <div v-if="!event.booths || event.booths.length === 0" class="text-center py-12">
              <p class="text-gray-400">No hay sellers en este evento</p>
            </div>

            <!-- Booths Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <BoothCard
                v-for="booth in event.booths"
                :key="booth.id"
                :booth="booth"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import BoothCard from '@/components/booths/BoothCard.vue'
import { useImageUpload } from '@/composables/useImageUpload'
import { useCalendar } from '@/composables/useCalendar'
import { useNotifications } from '@/composables/useNotifications'
import { eventsAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const event = ref(null)
const { getImageUrl } = useImageUpload()
const { getCalendarOptions } = useCalendar()

// Notifications functionality
const notifications = useNotifications()
const pushLoading = ref(false)
const pushSuccess = ref(false)
const pushError = ref('')
const isSubscribedToPush = ref(false)

// Calendar functionality
const calendarOptions = computed(() => {
  if (!event.value) return []
  return getCalendarOptions(event.value)
})

// Email reminder functionality
const reminderEmail = ref('')
const reminderLoading = ref(false)
const reminderSuccess = ref(false)
const reminderError = ref('')

// Share functionality
const shareLoading = ref(false)
const shareSuccess = ref(false)
const shareError = ref('')
const copyLoading = ref(false)
const copySuccess = ref(false)

// Check for Web Share API support
const webShareApiSupported = computed(() => {
  return typeof navigator !== 'undefined' && 'share' in navigator
})

// Navigation
function goBack() {
  router.push('/')
}

// Calendar
function addToCalendar() {
  if (calendarOptions.value.length > 0) {
    // Por ahora, usar la primera opción (Google Calendar)
    calendarOptions.value[0].action()
  }
}

// Push notifications functions
async function togglePushNotifications(event) {
  const isChecked = event.target.checked

  if (isChecked && !isSubscribedToPush.value) {
    await subscribeToPushNotifications()
  }
}

async function subscribeToPushNotifications() {
  if (!event.value) return

  pushLoading.value = true
  pushError.value = ''

  try {
    const result = await notifications.subscribeToEvent(event.value.id)

    if (result.success) {
      pushSuccess.value = true
      isSubscribedToPush.value = true
    } else {
      throw new Error(result.error || 'Error al suscribirse')
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    pushError.value = error.message || 'Error al activar notificaciones. Inténtalo de nuevo.'
  } finally {
    pushLoading.value = false
  }
}

async function checkPushSubscription() {
  if (!event.value) return

  await notifications.initialize()

  // Verificar si está suscrito a este evento específico
  isSubscribedToPush.value = await notifications.isSubscribedToEvent(event.value.id)
}

async function subscribeReminder() {
  if (!event.value || !reminderEmail.value) return

  reminderLoading.value = true
  reminderError.value = ''

  try {
    await eventsAPI.createReminder(event.value.id, reminderEmail.value)
    reminderSuccess.value = true
    reminderEmail.value = ''
  } catch (error) {
    console.error('Error subscribing to reminder:', error)
    reminderError.value = error.response?.data?.error || 'Error al suscribirse. Inténtalo de nuevo.'
  } finally {
    reminderLoading.value = false
  }
}

// Share event using Web Share API
async function shareEvent() {
  if (!event.value || !webShareApiSupported.value) return

  shareLoading.value = true
  shareError.value = ''
  shareSuccess.value = false

  try {
    const shareData = {
      title: event.value.name,
      text: `¡Mira este evento! ${event.value.description}`,
      url: window.location.href
    }

    await navigator.share(shareData)
    shareSuccess.value = true

    // Reset success message after 3 seconds
    setTimeout(() => {
      shareSuccess.value = false
    }, 3000)
  } catch (error) {
    // User cancelled the share dialog or error occurred
    if (error.name !== 'AbortError') {
      console.error('Error sharing:', error)
      shareError.value = 'Error al compartir. Inténtalo de nuevo.'
    }
  } finally {
    shareLoading.value = false
  }
}

// Fallback: Copy event link to clipboard
async function copyEventLink() {
  if (!event.value) return

  copyLoading.value = true
  copySuccess.value = false

  try {
    await navigator.clipboard.writeText(window.location.href)
    copySuccess.value = true

    // Reset success message after 3 seconds
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      copySuccess.value = true

      setTimeout(() => {
        copySuccess.value = false
      }, 3000)
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
    }
  } finally {
    copyLoading.value = false
  }
}

function formatEventDate(dateString) {
  const date = new Date(dateString)
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`
}

function formatEventTime(dateString) {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  // Get timezone offset
  const offset = -date.getTimezoneOffset() / 60
  const sign = offset >= 0 ? '+' : '-'
  const absOffset = Math.abs(offset)

  return `${hours}:${minutes} hs (GMT${sign}${absOffset})`
}

function getCloudflareImageUrl(imageUrl, variant = 'public') {
  if (!imageUrl) return null
  // Si ya es una URL de Cloudflare, extraer el ID y usar el variant correcto
  if (imageUrl.includes('imagedelivery.net')) {
    const matches = imageUrl.match(/imagedelivery\.net\/[^\/]+\/([^\/]+)/)
    if (matches && matches[1]) {
      return getImageUrl(matches[1], variant)
    }
  }
  return imageUrl
}

onMounted(async () => {
  event.value = await eventsStore.fetchEventBySlug(route.params.slug)

  // Verificar suscripción a notificaciones push
  if (event.value) {
    await checkPushSubscription()
  }
})
</script>

<style scoped>
/* Custom styles for the toggle switch animation */
.peer:checked ~ div {
  background-color: #ec4899;
}
</style>
