<template>
  <div class="min-h-screen">
    <AppHeader />

    <main class="container mx-auto px-4 py-8">
      <!-- Hero Section -->
      <section class="mb-12 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Bienvenido a Miniferias
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Descubre eventos virtuales con live shopping en tiempo real
        </p>
      </section>

      <!-- Filters -->
      <section class="mb-8 flex flex-wrap gap-4">
        <button
          @click="filter = 'all'"
          :class="[
            'btn',
            filter === 'all' ? 'btn-primary' : 'btn-secondary'
          ]"
        >
          Todos
        </button>
        <button
          @click="filter = 'live'"
          :class="[
            'btn',
            filter === 'live' ? 'btn-primary' : 'btn-secondary'
          ]"
        >
          🔴 En Vivo
        </button>
        <button
          @click="filter = 'upcoming'"
          :class="[
            'btn',
            filter === 'upcoming' ? 'btn-primary' : 'btn-secondary'
          ]"
        >
          Próximos
        </button>
      </section>

      <!-- Loading -->
      <LoadingSpinner v-if="eventsStore.loading" />

      <!-- Error -->
      <div v-else-if="eventsStore.error" class="text-center text-red-600 py-8">
        {{ eventsStore.error }}
      </div>

      <!-- Events Grid -->
      <div
        v-else-if="filteredEvents.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <EventCard
          v-for="event in filteredEvents"
          :key="event.id"
          :event="event"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500 text-lg">No hay eventos disponibles</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventsStore } from '@/stores/events'
import AppHeader from '@/components/shared/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import EventCard from '@/components/events/EventCard.vue'

const eventsStore = useEventsStore()
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
