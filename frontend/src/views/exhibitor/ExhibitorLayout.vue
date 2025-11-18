<template>
  <!-- Responsive Exhibitor Layout -->
  <div class="flex h-screen w-full bg-gray-50">

    <!-- Desktop Sidebar Navigation (Hidden on Mobile) -->
    <aside v-if="!isLiveStreamRoute || !isStreaming" class="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
      <!-- Booth Info Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            {{ boothInitial }}
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900 leading-tight">{{ boothName }}</p>
            <p class="text-xs text-gray-500 leading-tight">Panel de Control</p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto">
        <div class="space-y-1">
          <!-- Dashboard -->
          <router-link
            to="/exhibitor"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
            :class="isActive('') ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-sm">Inicio</span>
          </router-link>

          <!-- Products -->
          <router-link
            to="/exhibitor/products"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
            :class="isActive('products') ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="text-sm">Productos</span>
          </router-link>

          <!-- Orders -->
          <router-link
            to="/exhibitor/orders"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative"
            :class="isActive('orders') ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm">Pedidos</span>
            <span v-if="pendingOrdersCount > 0" class="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {{ pendingOrdersCount }}
            </span>
          </router-link>

          <!-- Live Stream -->
          <a
            href="/exhibitor/live"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative"
            :class="isActive('live') ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span class="text-sm">En Vivo</span>
            <span v-if="isStreaming" class="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </a>
        </div>
      </nav>

      <!-- Bottom Actions -->
      <div class="p-3 border-t border-gray-200 space-y-1">
        <router-link
          to="/exhibitor/booth"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span class="text-sm">Mi Booth</span>
        </router-link>

        <router-link
          to="/profile"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-sm">Mi Perfil</span>
        </router-link>

        <button
          @click="handleLogout"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- Top Header - Mobile Only -->
      <header v-if="!isLiveStreamRoute || !isStreaming" class="md:hidden sticky top-0 z-40 bg-white shadow-sm">
        <div class="flex items-center justify-between px-4 h-14">
          <!-- Booth Info -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {{ boothInitial }}
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900 leading-tight">{{ boothName }}</p>
              <p class="text-xs text-gray-500 leading-tight">Panel de Control</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Notifications -->
            <button class="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span v-if="notificationCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <!-- Settings Menu -->
            <button @click="showMenu = !showMenu" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Dropdown Menu -->
        <Transition name="slide-down">
          <div v-if="showMenu" class="absolute right-4 top-16 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <router-link
              to="/exhibitor/booth"
              class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              @click="showMenu = false"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Mi Booth
            </router-link>
            <router-link
              to="/profile"
              class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              @click="showMenu = false"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Mi Perfil
            </router-link>
            <hr class="my-2 border-gray-200">
            <button
              @click="handleLogout"
              class="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </Transition>
      </header>

      <!-- Desktop Top Header (Optional - for notifications, user info) -->
      <header v-if="!isLiveStreamRoute || !isStreaming" class="hidden md:flex items-center justify-end px-6 h-16 bg-white border-b border-gray-200">
        <div class="flex items-center gap-4">
          <!-- Notifications -->
          <button class="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="notificationCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <RouterView />
      </main>

      <!-- Bottom Navigation Bar - Mobile Only -->
      <nav v-if="!isLiveStreamRoute || !isStreaming" class="md:hidden sticky bottom-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
        <div class="grid grid-cols-4 h-16">
          <!-- Dashboard -->
          <router-link
            to="/exhibitor"
            class="flex flex-col items-center justify-center gap-1 transition-colors"
            :class="isActive('') ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-xs font-medium">Inicio</span>
          </router-link>

          <!-- Products -->
          <router-link
            to="/exhibitor/products"
            class="flex flex-col items-center justify-center gap-1 transition-colors"
            :class="isActive('products') ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span class="text-xs font-medium">Productos</span>
          </router-link>

          <!-- Orders -->
          <router-link
            to="/exhibitor/orders"
            class="flex flex-col items-center justify-center gap-1 transition-colors relative"
            :class="isActive('orders') ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-xs font-medium">Pedidos</span>
            <span v-if="pendingOrdersCount > 0" class="absolute top-1 right-6 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {{ pendingOrdersCount }}
            </span>
          </router-link>

          <!-- Live Stream -->
          <a
            href="/exhibitor/live"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-col items-center justify-center gap-1 transition-colors relative"
            :class="isActive('live') ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span class="text-xs font-medium">En Vivo</span>
            <span v-if="isStreaming" class="absolute top-1 right-6 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </a>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBoothsStore } from '@/stores/booths'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const boothsStore = useBoothsStore()

const showMenu = ref(false)
const notificationCount = ref(0)
const pendingOrdersCount = ref(0)

// Use booth directly from store for reactivity
const booth = computed(() => boothsStore.myBooth)
const boothName = computed(() => booth.value?.name || 'Mi Booth')
const boothInitial = computed(() => {
  const name = booth.value?.name || 'B'
  return name.charAt(0).toUpperCase()
})

const isStreaming = computed(() => booth.value?.isStreaming || false)
const isLiveStreamRoute = computed(() => route.path.includes('/exhibitor/live'))

function isActive(path) {
  if (path === '') {
    return route.path === '/exhibitor'
  }
  return route.path.includes(`/exhibitor/${path}`)
}

async function handleLogout() {
  await authStore.logout()
  showMenu.value = false
  router.push('/')
}

onMounted(async () => {
  try {
    await boothsStore.fetchMyBooth()
  } catch (error) {
    console.error('Error loading booth:', error)
  }
})
</script>

<style scoped>
/* Safe area for mobile devices with notches */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Slide down animation for dropdown */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
