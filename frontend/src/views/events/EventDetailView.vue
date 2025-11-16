<template>
  <div class="min-h-screen">
    <AppHeader />

    <main class="container mx-auto px-4 py-8">
      <!-- Loading -->
      <LoadingSpinner v-if="eventsStore.loading" />

      <!-- Error -->
      <div v-else-if="eventsStore.error" class="text-center text-red-600 py-8">
        {{ eventsStore.error }}
      </div>

      <!-- Event Content -->
      <div v-else-if="event">
        <!-- Event Header -->
        <div class="mb-8">
          <div v-if="event.coverImage" class="mb-6 aspect-video overflow-hidden rounded-lg">
            <img
              :src="getCloudflareImageUrl(event.coverImage, 'cover')"
              :alt="event.name"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="flex items-start justify-between">
            <div>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import AppHeader from '@/components/shared/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import BoothCard from '@/components/booths/BoothCard.vue'
import { useImageUpload } from '@/composables/useImageUpload'

const route = useRoute()
const eventsStore = useEventsStore()
const event = ref(null)
const { getImageUrl } = useImageUpload()

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
