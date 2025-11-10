<template>
  <div class="min-h-screen bg-gray-100">
    <AppHeader />
    <div class="flex">
      <aside class="w-64 bg-white min-h-screen p-4 shadow-sm">
        <nav class="space-y-2">
          <router-link to="/exhibitor" class="block px-4 py-2 rounded hover:bg-gray-100">
            Dashboard
          </router-link>
          <router-link to="/exhibitor/booth" class="block px-4 py-2 rounded hover:bg-gray-100">
            Mi Booth
          </router-link>
          <router-link to="/exhibitor/products" class="block px-4 py-2 rounded hover:bg-gray-100">
            Productos
          </router-link>
          <router-link to="/exhibitor/orders" class="block px-4 py-2 rounded hover:bg-gray-100">
            Pedidos
          </router-link>
          <router-link to="/exhibitor/live" class="block px-4 py-2 rounded hover:bg-gray-100">
            En Vivo
          </router-link>
        </nav>
      </aside>
      <main class="flex-1 p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '@/components/shared/AppHeader.vue'
</script>
