<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-primary-600">🎪</span>
          <span class="text-xl font-bold text-gray-900">Miniferias</span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="text-gray-700 hover:text-primary-600">
            Eventos
          </router-link>

          <template v-if="authStore.isAuthenticated">
            <router-link
              v-if="authStore.isAdmin"
              to="/admin"
              class="text-gray-700 hover:text-primary-600"
            >
              Admin
            </router-link>

            <router-link
              v-if="authStore.isExhibitor"
              to="/exhibitor"
              class="text-gray-700 hover:text-primary-600"
            >
              Mi Booth
            </router-link>

            <router-link
              to="/orders"
              class="text-gray-700 hover:text-primary-600"
            >
              Mis Pedidos
            </router-link>

            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
              >
                <span>{{ authStore.user?.name }}</span>
                <span>▾</span>
              </button>

              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showUserMenu = false"
                >
                  Perfil
                </router-link>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <router-link to="/login" class="text-gray-700 hover:text-primary-600">
              Iniciar Sesión
            </router-link>
            <router-link to="/register" class="btn btn-primary">
              Registrarse
            </router-link>
          </template>

          <!-- Cart Badge -->
          <router-link
            v-if="cartStore.totalItems > 0"
            to="/checkout"
            class="relative"
          >
            <span class="text-2xl">🛒</span>
            <span
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartStore.totalItems }}
            </span>
          </router-link>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          @click="showMobileMenu = !showMobileMenu"
          class="md:hidden text-gray-700"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden py-4 border-t">
        <router-link
          to="/"
          class="block py-2 text-gray-700 hover:text-primary-600"
          @click="showMobileMenu = false"
        >
          Eventos
        </router-link>

        <template v-if="authStore.isAuthenticated">
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="block py-2 text-gray-700 hover:text-primary-600"
            @click="showMobileMenu = false"
          >
            Admin
          </router-link>

          <router-link
            v-if="authStore.isExhibitor"
            to="/exhibitor"
            class="block py-2 text-gray-700 hover:text-primary-600"
            @click="showMobileMenu = false"
          >
            Mi Booth
          </router-link>

          <router-link
            to="/orders"
            class="block py-2 text-gray-700 hover:text-primary-600"
            @click="showMobileMenu = false"
          >
            Mis Pedidos
          </router-link>

          <router-link
            to="/profile"
            class="block py-2 text-gray-700 hover:text-primary-600"
            @click="showMobileMenu = false"
          >
            Perfil
          </router-link>

          <button
            @click="handleLogout"
            class="block w-full text-left py-2 text-gray-700 hover:text-primary-600"
          >
            Cerrar Sesión
          </button>
        </template>

        <template v-else>
          <router-link
            to="/login"
            class="block py-2 text-gray-700 hover:text-primary-600"
            @click="showMobileMenu = false"
          >
            Iniciar Sesión
          </router-link>
          <router-link
            to="/register"
            class="block py-2 text-gray-700 hover:text-primary-600"
            @click="showMobileMenu = false"
          >
            Registrarse
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)

async function handleLogout() {
  await authStore.logout()
  showUserMenu.value = false
  showMobileMenu.value = false
  router.push('/login')
}
</script>
