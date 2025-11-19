<template>
  <div class="relative flex w-full flex-col min-h-screen bg-gray-900">
    <AppHeader />

    <!-- Hero Section with Gradient -->
    <div class="relative w-full h-96">
      <!-- Background Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>

      <!-- Hero Content -->
      <div class="relative z-10 h-full flex items-center justify-center px-4">
        <div class="text-center max-w-3xl">
          <div class="inline-block px-4 py-2 bg-pink-500/20 backdrop-blur-sm text-pink-300 rounded-full text-sm font-bold mb-4 shadow-lg">
            ✨ Descubre eventos virtuales
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Live Shopping en tiempo real
          </h1>
          <p class="text-lg md:text-xl text-gray-200">
            Compra mientras ves transmisiones en vivo
          </p>
        </div>
      </div>
    </div>

    <main class="relative z-10 -mt-16 max-w-7xl mx-auto px-4 pb-8 w-full">
      <!-- Filters Card -->
      <section class="mb-6">
        <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4 shadow-lg">
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              @click="filter = 'all'"
              :class="[
                'px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                filter === 'all'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              ]"
            >
              Todos
            </button>
            <button
              @click="filter = 'live'"
              :class="[
                'px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
                filter === 'live'
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
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
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              ]"
            >
              📅 Próximos
            </button>
          </div>
        </div>
      </section>

      <!-- Loading -->
      <div v-if="eventsStore.loading" class="flex justify-center py-12">
        <LoadingSpinner />
      </div>

      <!-- Error -->
      <div v-else-if="eventsStore.error" class="text-center py-12">
        <div class="inline-block p-4 bg-red-500/20 text-red-400 rounded-2xl">
          {{ eventsStore.error }}
        </div>
      </div>

      <!-- Events Grid (Responsive) -->
      <div v-else-if="filteredEvents.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <EventCard
          v-for="event in filteredEvents"
          :key="event.id"
          :event="event"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">🎪</div>
        <p class="text-gray-200 text-lg font-medium mb-2">No hay eventos</p>
        <p class="text-gray-400 text-sm">Vuelve pronto para ver nuevos eventos</p>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import AppHeader from '@/components/shared/AppHeader.vue'
import AppFooter from '@/components/shared/AppFooter.vue'
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
