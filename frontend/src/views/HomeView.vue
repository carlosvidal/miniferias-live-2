<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <AppHeader />

    <main class="max-w-lg lg:max-w-7xl mx-auto px-4 pb-8">
      <!-- Hero Section - Compact -->
      <section class="py-6 text-center">
        <div class="inline-block px-4 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-3">
          ✨ Descubre eventos virtuales
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Live Shopping en tiempo real
        </h2>
        <p class="text-sm text-gray-600">
          Compra mientras ves transmisiones en vivo
        </p>
      </section>

      <!-- Horizontal Filters with Scroll -->
      <section class="mb-6 -mx-4 px-4">
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            @click="filter = 'all'"
            :class="[
              'px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              filter === 'all'
                ? 'bg-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
            ]"
          >
            Todos
          </button>
          <button
            @click="filter = 'live'"
            :class="[
              'px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              filter === 'live'
                ? 'bg-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
            ]"
          >
            <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            En Vivo
          </button>
          <button
            @click="filter = 'upcoming'"
            :class="[
              'px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              filter === 'upcoming'
                ? 'bg-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300'
            ]"
          >
            📅 Próximos
          </button>
        </div>
      </section>

      <!-- Loading -->
      <div v-if="eventsStore.loading" class="flex justify-center py-12">
        <LoadingSpinner />
      </div>

      <!-- Error -->
      <div v-else-if="eventsStore.error" class="text-center py-12">
        <div class="inline-block p-4 bg-red-50 text-red-600 rounded-2xl">
          {{ eventsStore.error }}
        </div>
      </div>

      <!-- Events Grid (Responsive) -->
      <div v-else-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <EventCard
          v-for="event in filteredEvents"
          :key="event.id"
          :event="event"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">🎪</div>
        <p class="text-gray-500 text-lg font-medium mb-2">No hay eventos</p>
        <p class="text-gray-400 text-sm">Vuelve pronto para ver nuevos eventos</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import AppHeader from '@/components/shared/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import EventCard from '@/components/events/EventCard.vue'

const eventsStore = useEventsStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const filter = ref('all')

const filteredEvents = computed(() => {
  if (filter.value === 'live') {
    return eventsStore.events.filter(e => e.isLive)
  } else if (filter.value === 'upcoming') {
    return eventsStore.events.filter(e => {
      const startDate = new Date(e.startDate)
      return startDate > new Date() && !e.isLive
    })
  }
  return eventsStore.events
})

onMounted(async () => {
  await eventsStore.fetchEvents()
})
</script>

<style scoped>
/* Hide scrollbar for horizontal scroll */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
