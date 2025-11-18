<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <AppHeader />

    <main class="max-w-lg lg:max-w-7xl mx-auto px-4 pb-8">
      <!-- Event Header with Cover -->
      <div v-if="eventsStore.loading" class="py-8">
        <LoadingSpinner />
      </div>

      <!-- Error -->
      <div v-else-if="eventsStore.error" class="text-center py-12">
        <div class="inline-block p-4 bg-red-50 text-red-600 rounded-2xl">
          {{ eventsStore.error }}
        </div>
      </div>

      <!-- Event Content -->
      <div v-else-if="event">
        <!-- Cover Image -->
        <div v-if="event.coverImage" class="mb-6 mt-6 aspect-video overflow-hidden rounded-lg">
          <img
            :src="getCloudflareImageUrl(event.coverImage, 'cover')"
            :alt="event.name"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Event Info -->
        <div class="mb-8">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {{ event.name }}
              </h1>
              <p class="text-gray-600 mb-4">{{ event.description }}</p>

              <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>📅 {{ formatDate(event.startDate) }} - {{ formatDate(event.endDate) }}</span>
                <span>🏪 {{ event.booths?.length || 0 }} booths</span>
              </div>
            </div>

            <span
              v-if="event.isLive"
              class="badge badge-live text-base"
            >
              🔴 EN VIVO
            </span>
          </div>

          <!-- Push Notification Banner -->
          <div
            v-if="showPushPrompt && !isSubscribedToPush && notifications.isSupported"
            class="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4 shadow-lg"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-2xl">🔔</span>
                  <h3 class="text-lg font-bold">¡No te pierdas este evento!</h3>
                </div>
                <p class="text-sm text-indigo-100 mb-3">
                  Activa las notificaciones push y te avisaremos cuando el evento esté por empezar.
                </p>
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="subscribeToPushNotifications"
                    :disabled="pushLoading"
                    class="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  >
                    {{ pushLoading ? 'Activando...' : '🔔 Activar Notificaciones' }}
                  </button>
                  <button
                    @click="dismissPushPrompt"
                    class="bg-transparent border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Ahora no
                  </button>
                </div>
                <p v-if="pushError" class="text-red-200 text-xs mt-2">
                  {{ pushError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Calendar and Reminder Section -->
          <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <!-- Add to Calendar -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                📅 Agregar al Calendario
              </h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in calendarOptions"
                  :key="option.name"
                  @click="option.action"
                  class="btn btn-secondary btn-sm"
                >
                  {{ option.icon }} {{ option.name }}
                </button>
              </div>
            </div>

            <!-- Email Reminder -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                📧 Recordatorio por Email
              </h3>
              <form @submit.prevent="subscribeReminder" class="flex gap-2">
                <input
                  v-model="reminderEmail"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  :disabled="reminderLoading || reminderSuccess"
                />
                <button
                  type="submit"
                  :disabled="reminderLoading || reminderSuccess"
                  class="btn btn-primary btn-sm whitespace-nowrap"
                >
                  {{ reminderSuccess ? '✓ Suscrito' : 'Suscribirse' }}
                </button>
              </form>
              <p v-if="reminderError" class="text-red-600 text-xs mt-2">
                {{ reminderError }}
              </p>
              <p v-if="reminderSuccess" class="text-green-600 text-xs mt-2">
                ¡Te enviaremos un recordatorio antes del evento!
              </p>
            </div>

            <!-- Push Notifications -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                🔔 Notificaciones Push
              </h3>

              <!-- Suscrito -->
              <div v-if="isSubscribedToPush || pushSuccess" class="text-center py-2">
                <div class="inline-flex items-center gap-2 text-green-600 mb-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-semibold">Activado</span>
                </div>
                <p class="text-xs text-gray-600">
                  Recibirás notificaciones de este evento
                </p>
              </div>

              <!-- No suscrito -->
              <div v-else>
                <button
                  @click="subscribeToPushNotifications"
                  :disabled="pushLoading || !notifications.isSupported"
                  class="w-full btn btn-primary btn-sm"
                >
                  {{ pushLoading ? 'Activando...' : '🔔 Activar' }}
                </button>
                <p v-if="pushError" class="text-red-600 text-xs mt-2">
                  {{ pushError }}
                </p>
                <p v-else-if="!notifications.isSupported" class="text-gray-500 text-xs mt-2">
                  Tu navegador no soporta notificaciones
                </p>
                <p v-else class="text-gray-500 text-xs mt-2">
                  Te avisaremos cuando empiece el evento
                </p>
              </div>
            </div>

            <!-- Share Event -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                🔗 Compartir Evento
              </h3>

              <!-- Share Button -->
              <div v-if="webShareApiSupported">
                <button
                  @click="shareEvent"
                  :disabled="shareLoading"
                  class="w-full btn btn-primary btn-sm"
                >
                  {{ shareLoading ? 'Compartiendo...' : '📤 Compartir' }}
                </button>
                <p v-if="shareSuccess" class="text-green-600 text-xs mt-2">
                  ¡Compartido exitosamente!
                </p>
                <p v-if="shareError" class="text-red-600 text-xs mt-2">
                  {{ shareError }}
                </p>
                <p v-else class="text-gray-500 text-xs mt-2">
                  Comparte este evento con tus amigos
                </p>
              </div>

              <!-- Fallback for unsupported browsers -->
              <div v-else>
                <button
                  @click="copyEventLink"
                  :disabled="copyLoading"
                  class="w-full btn btn-secondary btn-sm"
                >
                  {{ copySuccess ? '✓ Copiado' : '📋 Copiar Link' }}
                </button>
                <p v-if="copySuccess" class="text-green-600 text-xs mt-2">
                  ¡Link copiado al portapapeles!
                </p>
                <p v-else class="text-gray-500 text-xs mt-2">
                  Copia el link para compartir
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Booths Section -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Booths Participantes
          </h2>

          <!-- Empty State -->
          <div v-if="!event.booths || event.booths.length === 0" class="text-center py-12">
            <p class="text-gray-500">No hay booths en este evento</p>
          </div>

          <!-- Booths Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BoothCard
              v-for="booth in event.booths"
              :key="booth.id"
              :booth="booth"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import AppHeader from '@/components/shared/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import BoothCard from '@/components/booths/BoothCard.vue'
import { useImageUpload } from '@/composables/useImageUpload'
import { useCalendar } from '@/composables/useCalendar'
import { useNotifications } from '@/composables/useNotifications'
import { eventsAPI } from '@/services/api'

const route = useRoute()
const eventsStore = useEventsStore()
const event = ref(null)
const { getImageUrl } = useImageUpload()
const { getCalendarOptions } = useCalendar()

// Notifications functionality
const notifications = useNotifications()
const showPushPrompt = ref(false)
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

// Push notifications functions
async function subscribeToPushNotifications() {
  if (!event.value) return

  pushLoading.value = true
  pushError.value = ''

  try {
    const result = await notifications.subscribeToEvent(event.value.id)

    if (result.success) {
      pushSuccess.value = true
      isSubscribedToPush.value = true
      showPushPrompt.value = false
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

  // Si no está suscrito y el navegador soporta notificaciones, mostrar prompt
  if (!isSubscribedToPush.value && notifications.isSupported.value && notifications.notificationPermission.value !== 'denied') {
    showPushPrompt.value = true
  }
}

function dismissPushPrompt() {
  showPushPrompt.value = false
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

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
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
