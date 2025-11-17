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

          <!-- Calendar and Reminder Section -->
          <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                🔔 Recordatorio por Email
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
import { eventsAPI } from '@/services/api'

const route = useRoute()
const eventsStore = useEventsStore()
const event = ref(null)
const { getImageUrl } = useImageUpload()
const { getCalendarOptions } = useCalendar()

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
})
</script>
