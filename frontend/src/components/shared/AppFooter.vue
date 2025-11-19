<template>
  <footer class="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <!-- Brand/Copyright -->
        <div class="text-sm text-gray-400">
          © {{ currentYear }} Miniferias Live. Todos los derechos reservados.
        </div>

        <!-- Legal Links -->
        <div class="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
          <router-link
            to="/privacy-policy"
            class="hover:text-white transition-colors"
          >
            Política de Privacidad
          </router-link>
          <router-link
            to="/terms-of-service"
            class="hover:text-white transition-colors"
          >
            Condiciones del servicio
          </router-link>
          <router-link
            to="/data-deletion"
            class="hover:text-white transition-colors"
          >
            Eliminación de datos
          </router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
