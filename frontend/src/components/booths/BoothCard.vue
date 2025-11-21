<template>
  <component
    :is="disabled ? 'div' : 'router-link'"
    :to="disabled ? undefined : `/booths/${booth.id}`"
    :class="[
      'block bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300',
      disabled ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:shadow-xl active:scale-[0.98]'
    ]"
  >
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
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {{ booth.name }}
      </h3>

      <p class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ booth.description }}
      </p>
    </div>
  </component>
</template>

<script setup>
import { useImageUpload } from '@/composables/useImageUpload'

const props = defineProps({
  booth: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

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
