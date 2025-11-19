<template>
  <!-- Mobile-First Header -->
  <header class="sticky top-0 z-20 bg-gray-900 backdrop-blur-lg border-b border-gray-800">
    <div class="max-w-lg lg:max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <router-link to="/" class="flex items-center">
        <div>
          <h1 class="text-xl font-bold text-white">Miniferias</h1>
          <p class="text-xs text-gray-400">Live Shopping</p>
        </div>
      </router-link>
      <div class="flex items-center gap-3">
        <!-- Login button for non-authenticated users -->
        <button
          v-if="!authStore.isAuthenticated"
          @click="$router.push('/login')"
          class="px-4 py-1.5 bg-pink-500 text-white text-sm font-medium rounded-full hover:bg-pink-600 transition-colors"
        >
          Ingresar
        </button>

        <!-- User Menu for authenticated users -->
        <div v-else class="relative" ref="userMenuRef">
          <!-- User Avatar/Button -->
          <button
            @click="toggleUserMenu"
            class="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <!-- Avatar -->
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              <img
                v-if="authStore.user?.profilePicture"
                :src="authStore.user.profilePicture"
                :alt="authStore.user.name"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ userInitials }}</span>
            </div>
            <!-- Name (hidden on mobile) -->
            <span class="hidden sm:block text-white text-sm font-medium max-w-[120px] truncate">
              {{ authStore.user?.name }}
            </span>
            <!-- Chevron -->
            <svg
              class="w-4 h-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showUserMenu }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2 overflow-hidden"
            >
              <!-- User Info -->
              <div class="px-4 py-3 border-b border-gray-700">
                <p class="text-sm font-medium text-white truncate">{{ authStore.user?.name }}</p>
                <p class="text-xs text-gray-400 truncate">{{ authStore.user?.email }}</p>
                <span
                  class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="roleColorClass"
                >
                  {{ roleLabel }}
                </span>
              </div>

              <!-- Menu Items -->
              <div class="py-1">
                <router-link
                  to="/profile"
                  @click="closeUserMenu"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Mi Perfil
                </router-link>

                <router-link
                  to="/orders"
                  @click="closeUserMenu"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  Mis Órdenes
                </router-link>

                <!-- Exhibitor Dashboard (if exhibitor) -->
                <router-link
                  v-if="authStore.isExhibitor"
                  to="/exhibitor"
                  @click="closeUserMenu"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  Panel Expositor
                </router-link>

                <!-- Admin Dashboard (if admin) -->
                <router-link
                  v-if="authStore.isAdmin"
                  to="/admin"
                  @click="closeUserMenu"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Panel Admin
                </router-link>
              </div>

              <!-- Logout -->
              <div class="border-t border-gray-700 pt-1">
                <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// User menu state
const showUserMenu = ref(false)
const userMenuRef = ref(null)

// Toggle user menu
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

// Close user menu
function closeUserMenu() {
  showUserMenu.value = false
}

// Get user initials for avatar
const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U'
  const names = authStore.user.name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return authStore.user.name.substring(0, 2).toUpperCase()
})

// Role label
const roleLabel = computed(() => {
  const roles = {
    'ADMIN': 'Administrador',
    'EXHIBITOR': 'Expositor',
    'VISITOR': 'Visitante'
  }
  return roles[authStore.user?.role] || 'Usuario'
})

// Role color class
const roleColorClass = computed(() => {
  const colors = {
    'ADMIN': 'bg-red-500/20 text-red-300',
    'EXHIBITOR': 'bg-blue-500/20 text-blue-300',
    'VISITOR': 'bg-green-500/20 text-green-300'
  }
  return colors[authStore.user?.role] || 'bg-gray-500/20 text-gray-300'
})

// Handle logout
async function handleLogout() {
  closeUserMenu()
  await authStore.logout()
  router.push('/')
}

// Close menu when clicking outside
function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    closeUserMenu()
  }
}

// Add/remove click listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
