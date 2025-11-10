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
          <div v-if="event.coverImage" class="mb-6">
            <img
              :src="event.coverImage"
              :alt="event.name"
              class="w-full h-64 md:h-96 object-cover rounded-lg"
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
            <router-link
              v-for="booth in event.booths"
              :key="booth.id"
              :to="`/booths/${booth.id}`"
              class="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <!-- Cover Photo -->
              <div class="relative mb-4">
                <img
                  v-if="booth.coverPhoto"
                  :src="booth.coverPhoto"
                  :alt="booth.name"
                  class="w-full h-48 object-cover rounded-lg"
                />
                <div
                  v-else
                  class="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center"
                >
                  <span class="text-6xl">🏪</span>
                </div>

                <!-- Streaming Badge -->
                <span
                  v-if="booth.isStreaming"
                  class="absolute top-3 right-3 badge badge-live"
                >
                  🔴 EN VIVO
                </span>
              </div>

              <!-- Booth Info -->
              <div class="flex items-start space-x-4">
                <!-- Logo -->
                <img
                  v-if="booth.logo"
                  :src="booth.logo"
                  :alt="booth.name"
                  class="w-16 h-16 object-cover rounded-lg"
                />

                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-1">
                    {{ booth.name }}
                  </h3>
                  <p class="text-sm text-gray-600 line-clamp-2 mb-2">
                    {{ booth.description }}
                  </p>
                  <div class="text-sm text-gray-500">
                    📦 {{ booth._count?.products || 0 }} productos
                  </div>
                </div>
              </div>
            </router-link>
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

const route = useRoute()
const eventsStore = useEventsStore()
const event = ref(null)

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(async () => {
  event.value = await eventsStore.fetchEventBySlug(route.params.slug)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
