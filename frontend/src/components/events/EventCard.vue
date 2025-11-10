<template>
  <router-link
    :to="`/events/${event.slug}`"
    class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
  >
    <!-- Cover Image -->
    <div class="relative mb-4">
      <img
        v-if="event.coverImage"
        :src="event.coverImage"
        :alt="event.name"
        class="w-full h-48 object-cover rounded-lg"
      />
      <div
        v-else
        class="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center"
      >
        <span class="text-6xl">🎪</span>
      </div>

      <!-- Live Badge -->
      <span
        v-if="event.isLive"
        class="absolute top-3 right-3 badge badge-live"
      >
        🔴 EN VIVO
      </span>

      <!-- Status Badge -->
      <span
        v-else
        :class="[
          'absolute top-3 right-3 badge',
          statusBadgeClass
        ]"
      >
        {{ statusText }}
      </span>
    </div>

    <!-- Content -->
    <div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">
        {{ event.name }}
      </h3>

      <p class="text-gray-600 text-sm mb-4 line-clamp-2">
        {{ event.description }}
      </p>

      <div class="flex items-center justify-between text-sm">
        <div class="text-gray-500">
          <span>📅 {{ formatDate(event.startDate) }}</span>
        </div>

        <div class="text-gray-500">
          <span>🏪 {{ event._count?.booths || 0 }} booths</span>
        </div>
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
    DRAFT: 'badge-secondary',
    SCHEDULED: 'badge-scheduled',
    LIVE: 'badge-live',
    ENDED: 'badge-ended'
  }
  return statusClasses[props.event.status] || 'badge-secondary'
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
    month: 'short',
    year: 'numeric'
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
