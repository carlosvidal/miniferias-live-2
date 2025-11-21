<template>
  <div class="relative flex w-full flex-col min-h-screen bg-gray-900">
    <AppHeader />

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
      <!-- Floating Back/Share Buttons -->
      <header class="absolute top-16 z-20 flex w-full items-center justify-between p-4">
        <button @click="goBack"
          class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button v-if="webShareApiSupported" @click="shareEvent" :disabled="shareLoading"
          class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button v-else @click="copyEventLink" :disabled="copyLoading"
          class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 transition-colors disabled:opacity-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </header>

      <!-- Main Content -->
      <main class="flex-grow">
        <!-- Hero Image with Gradient -->
        <div class="relative h-96 w-full">
          <!-- Cover Image -->
          <div v-if="event.coverImage" class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${getCloudflareImageUrl(event.coverImage, 'cover')})` }"></div>
          <div v-else class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>

          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>

          <!-- Live Badge -->
          <div v-if="event.isLive"
            class="absolute top-20 left-4 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-lg z-10">
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
            <svg class="w-8 h-8 md:w-10 md:h-10 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div class="flex-grow">
              <p class="font-bold text-white text-base md:text-lg">{{ formatEventDate(event.startDate) }}</p>
              <p class="text-sm text-gray-300">{{ formatEventTime(event.startDate) }}</p>
            </div>
            <button v-if="calendarOptions.length > 0" @click="addToCalendar"
              class="flex shrink-0 items-center justify-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white hover:bg-pink-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">Calendario</span>
            </button>
          </div>

          <!-- Countdown Timer -->
          <div v-if="eventStatus === 'upcoming'" class="countdown-container rounded-xl bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-pink-900/80 backdrop-blur-sm p-6 shadow-lg">
            <h3 class="text-center text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">El evento comienza en</h3>
            <div class="countdown-timer">
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.days }}</span>
                <span class="countdown-label">Días</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.hours }}</span>
                <span class="countdown-label">Horas</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.minutes }}</span>
                <span class="countdown-label">Minutos</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ countdown.seconds }}</span>
                <span class="countdown-label">Segundos</span>
              </div>
            </div>
          </div>

          <!-- Event Live Banner -->
          <div v-else-if="eventStatus === 'live'" class="rounded-xl bg-gradient-to-r from-red-600/90 to-pink-600/90 backdrop-blur-sm p-6 shadow-lg text-center">
            <div class="flex items-center justify-center gap-3 mb-2">
              <span class="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <h3 class="text-2xl font-bold text-white">EN VIVO AHORA</h3>
              <span class="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            </div>
            <p class="text-white/90">El evento está en curso. ¡Explora los booths participantes!</p>
          </div>

          <!-- Event Ended Message -->
          <div v-else-if="eventStatus === 'ended'" class="rounded-xl bg-gradient-to-r from-gray-700/90 to-gray-800/90 backdrop-blur-sm p-6 shadow-lg text-center">
            <div class="mb-4">
              <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">Este evento ha finalizado</h3>
            <p class="text-gray-300 mb-6">Gracias por tu interés. El evento ya no está disponible.</p>
            <router-link to="/" class="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Ver otros eventos
            </router-link>
          </div>

          <!-- Notifications and Reminders Card (hidden when event has ended) -->
          <div v-if="eventStatus !== 'ended'" class="space-y-4 rounded-xl bg-white/5 backdrop-blur-sm p-4 md:p-6 shadow-lg">
            <h2 class="text-lg md:text-xl font-bold text-white">¡No te lo pierdas!</h2>

            <!-- Email Reminder -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-300" for="email">
                Recibir recordatorio por email
              </label>
              <form @submit.prevent="subscribeReminder" class="flex">
                <input v-model="reminderEmail" type="email" id="email" placeholder="tuemail@ejemplo.com" required
                  :disabled="reminderLoading || reminderSuccess"
                  class="form-input h-12  px-4 py-2 flex-grow rounded-l-lg border-0 bg-black/20 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-pink-500" />
                <button type="submit" :disabled="reminderLoading || reminderSuccess"
                  class="flex h-12 items-center justify-center rounded-r-lg bg-pink-500 px-4 font-bold text-white hover:bg-pink-600 transition-colors disabled:opacity-50">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
            <div v-if="notifications.isSupported"
              class="flex items-center justify-between rounded-lg bg-black/20 p-3 md:p-4">
              <div class="flex items-center gap-3">
                <svg class="w-6 h-6 text-pink-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p class="text-sm font-medium text-white">Activar Push Notifications</p>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" :checked="isSubscribedToPush || pushSuccess" @change="togglePushNotifications"
                  :disabled="pushLoading" class="sr-only peer" />
                <div
                  class="peer h-6 w-11 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-pink-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-disabled:opacity-50">
                </div>
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
              <BoothCard v-for="booth in event.booths" :key="booth.id" :booth="booth" :disabled="eventStatus === 'ended'" />
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import AppHeader from '@/components/shared/AppHeader.vue'
import AppFooter from '@/components/shared/AppFooter.vue'
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

// Polling for live status updates
let pollingInterval = null
const POLLING_INTERVAL_MS = 10000 // 10 seconds

// Countdown timer
let countdownInterval = null
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})
const eventStatus = ref('upcoming') // 'upcoming', 'live', 'ended'

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

// Update booth streaming status in real-time
async function updateBoothStatus() {
  if (!event.value) return

  try {
    // Fetch fresh event data (silently, without loading state)
    const response = await eventsAPI.getBySlug(route.params.slug)
    const freshEvent = response.data

    // Only update booth streaming status to avoid re-rendering everything
    if (freshEvent.booths && event.value.booths) {
      event.value.booths.forEach((booth, index) => {
        const freshBooth = freshEvent.booths.find(b => b.id === booth.id)
        if (freshBooth) {
          // Update only the isStreaming property
          booth.isStreaming = freshBooth.isStreaming
        }
      })
    }
  } catch (error) {
    // Silently fail - don't show errors for background polling
    console.error('Error updating booth status:', error)
  }
}

// Start polling for booth status updates
function startPolling() {
  // Clear any existing interval
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }

  // Update immediately
  updateBoothStatus()

  // Set up periodic updates
  pollingInterval = setInterval(() => {
    // Only poll if the page is visible (save resources when tab is not active)
    if (document.visibilityState === 'visible') {
      updateBoothStatus()
    }
  }, POLLING_INTERVAL_MS)
}

// Stop polling
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

// Handle page visibility changes to pause/resume polling
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // Page became visible, update immediately
    updateBoothStatus()
  }
  // When hidden, the setInterval will skip updates (checked in startPolling)
}

// Countdown timer functions
function updateCountdown() {
  if (!event.value) return

  const now = new Date()
  const startDate = new Date(event.value.startDate)
  const endDate = event.value.endDate ? new Date(event.value.endDate) : null

  // Check if event has ended
  if (endDate && now >= endDate) {
    eventStatus.value = 'ended'
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    stopCountdown()
    return
  }

  // Check if event is live (started but not ended)
  if (now >= startDate) {
    eventStatus.value = 'live'
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  // Event is upcoming - calculate countdown
  eventStatus.value = 'upcoming'
  const diff = startDate - now

  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    eventStatus.value = 'live'
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  countdown.value = { days, hours, minutes, seconds }
}

function startCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  // Update immediately
  updateCountdown()

  // Update every second
  countdownInterval = setInterval(updateCountdown, 1000)
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

onMounted(async () => {
  event.value = await eventsStore.fetchEventBySlug(route.params.slug)

  // Verificar suscripción a notificaciones push
  if (event.value) {
    await checkPushSubscription()

    // Start countdown timer
    startCountdown()

    // Start polling for booth status updates
    startPolling()

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }
})

onUnmounted(() => {
  // Clean up countdown interval
  stopCountdown()

  // Clean up polling interval when component is unmounted
  stopPolling()

  // Remove visibility change listener
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
/* Custom styles for the toggle switch animation */
.peer:checked~div {
  background-color: #ec4899;
}

/* Countdown Timer Styles */
.countdown-timer {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
  padding: 0.75rem;
}

.countdown-value {
  font-size: 2.5rem;
  font-weight: 300;
  color: white;
  text-shadow: 0 0 20px rgba(72, 200, 255, 0.5);
  line-height: 1;
}

.countdown-label {
  color: #B1CDF1;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-top: 0.5rem;
  letter-spacing: 0.05em;
}

@media (min-width: 640px) {
  .countdown-timer {
    gap: 1rem;
  }

  .countdown-item {
    min-width: 90px;
    padding: 1rem;
  }

  .countdown-value {
    font-size: 3.5rem;
  }

  .countdown-label {
    font-size: 0.875rem;
  }
}
</style>
