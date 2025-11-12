<template>
  <router-link
    :to="`/events/${event.slug}`"
    class="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
  >
    <!-- Cover Image -->
    <div class="relative">
      <div class="aspect-[16/9] overflow-hidden">
        <img
          v-if="event.coverImage"
          :src="event.coverImage"
          :alt="event.name"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center"
        >
          <span class="text-7xl">🎪</span>
        </div>
      </div>

      <!-- Live Badge - Floating -->
      <div
        v-if="event.isLive"
        class="absolute top-3 left-3 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse"
      >
        <span class="w-2 h-2 bg-white rounded-full"></span>
        EN VIVO
      </div>

      <!-- Status Badge -->
      <div
        v-else
        :class="[
          'absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg',
          statusBadgeClass
        ]"
      >
        {{ statusText }}
      </div>

      <!-- Booth Count Badge -->
      <div class="absolute bottom-3 right-3 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs font-medium flex items-center gap-1.5">
        🏪 {{ event._count?.booths || 0 }} booths
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {{ event.name }}
      </h3>

      <p class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ event.description }}
      </p>

      <!-- Date -->
      <div class="flex items-center gap-2 text-gray-500 text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ formatDate(event.startDate) }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const statusBadgeClass = computed(() => {
  const statusClasses = {
    DRAFT: 'bg-gray-200 text-gray-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    LIVE: 'bg-red-500 text-white',
    ENDED: 'bg-gray-400 text-white'
  }
  return statusClasses[props.event.status] || 'bg-gray-200 text-gray-700'
})

const statusText = computed(() => {
  const statusTexts = {
    DRAFT: 'Borrador',
    SCHEDULED: 'Programado',
    LIVE: 'En Vivo',
    ENDED: 'Finalizado'
  }
  return statusTexts[props.event.status] || props.event.status
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
