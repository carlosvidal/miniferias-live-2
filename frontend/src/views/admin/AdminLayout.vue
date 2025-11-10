<template>
  <div class="min-h-screen bg-gray-100">
    <AppHeader />
    <div class="flex">
      <aside class="w-64 bg-white min-h-screen p-4 shadow-sm">
        <nav class="space-y-2">
          <router-link to="/admin" class="block px-4 py-2 rounded hover:bg-gray-100">
            Dashboard
          </router-link>
          <router-link to="/admin/events" class="block px-4 py-2 rounded hover:bg-gray-100">
            Eventos
          </router-link>
          <router-link to="/admin/booths" class="block px-4 py-2 rounded hover:bg-gray-100">
            Booths
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
