<template>
  <div class="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative">
    <!-- Cover Image -->
    <div class="relative">
      <div class="aspect-[16/9] overflow-hidden">
        <img
          v-if="booth.bannerUrl || booth.coverPhoto"
          :src="getImageUrl(booth.bannerUrl || booth.coverPhoto)"
          :alt="booth.name"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center"
        >
          <span class="text-7xl">🏪</span>
        </div>
      </div>

      <!-- Live Badge - Floating -->
      <div
        v-if="booth.isStreaming"
        class="absolute top-3 left-3 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse"
      >
        <span class="w-2 h-2 bg-white rounded-full"></span>
        EN VIVO
      </div>

      <!-- Logo - Positioned over image -->
      <div
        v-if="booth.logo"
        class="absolute bottom-3 left-3"
      >
        <img
          :src="getImageUrl(booth.logo)"
          :alt="booth.name"
          class="w-16 h-16 object-cover rounded-full border-4 border-white shadow-lg"
        />
      </div>

      <!-- Product Count Badge -->
      <div class="absolute bottom-3 right-3 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs font-medium flex items-center gap-1.5">
        📦 {{ booth._count?.products || 0 }} productos
      </div>

      <!-- Action Buttons Overlay -->
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button
          @click="$emit('edit', booth)"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
        <button
          @click="$emit('delete', booth)"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {{ booth.name }}
      </h3>

      <p class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ booth.description }}
      </p>

      <!-- Meta Info -->
      <div class="space-y-1">
        <div v-if="booth.user" class="flex items-center gap-2 text-gray-500 text-xs">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{{ booth.user.name }}</span>
        </div>
        <div v-if="booth.event" class="flex items-center gap-2 text-gray-500 text-xs">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ booth.event.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useImageUpload } from '@/composables/useImageUpload'

const props = defineProps({
  booth: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const { getImageUrl: getCloudflareImageUrl } = useImageUpload()

function getImageUrl(imageUrl) {
  if (!imageUrl) return null

  // Si ya es una URL de Cloudflare, extraer el ID y usar el variant correcto
  if (imageUrl.includes('imagedelivery.net')) {
    const matches = imageUrl.match(/imagedelivery\.net\/[^\/]+\/([^\/]+)/)
    if (matches && matches[1]) {
      // Usar 'cover' para banners y 'logo' para logos
      const variant = imageUrl === props.booth.logo ? 'logo' : 'cover'
      return getCloudflareImageUrl(matches[1], variant)
    }
  }
  return imageUrl
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
