<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Gestión de Booths</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Crear Booth
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="boothsStore.loading && !boothsStore.booths.length" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Booths List -->
    <div v-else-if="boothsStore.booths.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="booth in boothsStore.booths"
        :key="booth.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center text-white">
          <svg v-if="!booth.bannerUrl" class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <img v-else :src="booth.bannerUrl" :alt="booth.name" class="w-full h-full object-cover rounded-lg" />
        </div>

        <h3 class="text-xl font-semibold mb-2">{{ booth.name }}</h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ booth.description }}</p>

        <div class="space-y-2 text-sm text-gray-500 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{{ booth.exhibitor?.name || 'Sin asignar' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ booth.event?.title || 'Sin evento' }}</span>
          </div>
          <div v-if="booth._count?.products" class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>{{ booth._count.products }} productos</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            :class="booth.isLive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'"
            class="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1"
          >
            <span v-if="booth.isLive" class="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            {{ booth.isLive ? 'En Vivo' : 'Offline' }}
          </span>
        </div>

        <div class="flex gap-2 mt-4 pt-4 border-t">
          <button
            @click="editBooth(booth)"
            class="flex-1 btn btn-secondary text-sm"
          >
            Editar
          </button>
          <button
            @click="confirmDelete(booth)"
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 card">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-gray-600 mb-4">No hay booths creados</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Crear Primer Booth
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-6">
            {{ showEditModal ? 'Editar Booth' : 'Crear Nuevo Booth' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Booth *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input"
                placeholder="Ej: Artesanías del Sur"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                v-model="form.description"
                required
                rows="3"
                class="input"
                placeholder="Describe el booth y sus productos..."
              ></textarea>
            </div>

            <!-- Event Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Evento *
              </label>
              <select v-model="form.eventId" required class="input">
                <option value="">Selecciona un evento</option>
                <option v-for="event in eventsStore.events" :key="event.id" :value="event.id">
                  {{ event.name }}
                </option>
              </select>
            </div>

            <!-- Exhibitor Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email del Expositor *
              </label>
              <input
                v-model="form.exhibitorEmail"
                type="email"
                required
                class="input"
                placeholder="expositor@ejemplo.com"
              />
              <p class="text-xs text-gray-500 mt-1">
                El expositor debe estar registrado con rol EXHIBITOR
              </p>
            </div>

            <!-- Banner URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                URL del Banner
              </label>
              <input
                v-model="form.bannerUrl"
                type="url"
                class="input"
                placeholder="https://ejemplo.com/banner.jpg"
              />
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {{ errorMessage }}
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                :disabled="submitting"
                class="btn btn-primary flex-1"
              >
                {{ submitting ? 'Guardando...' : (showEditModal ? 'Guardar Cambios' : 'Crear Booth') }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary flex-1"
                :disabled="submitting"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showDeleteModal = false"
    >
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">Confirmar Eliminación</h3>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de eliminar el booth <strong>{{ boothToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-3">
          <button
            @click="handleDelete"
            :disabled="deleting"
            class="btn bg-red-600 text-white hover:bg-red-700 flex-1"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
          <button
            @click="showDeleteModal = false"
            :disabled="deleting"
            class="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBoothsStore } from '@/stores/booths'
import { useEventsStore } from '@/stores/events'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const boothsStore = useBoothsStore()
const eventsStore = useEventsStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const boothToDelete = ref(null)
const editingBooth = ref(null)
const submitting = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const form = ref({
  name: '',
  description: '',
  eventId: '',
  exhibitorEmail: '',
  bannerUrl: ''
})

onMounted(async () => {
  await Promise.all([
    boothsStore.fetchBooths(),
    eventsStore.fetchEvents()
  ])
})

function editBooth(booth) {
  editingBooth.value = booth
  form.value = {
    name: booth.name,
    description: booth.description,
    eventId: booth.eventId,
    exhibitorEmail: booth.exhibitor?.email || '',
    bannerUrl: booth.bannerUrl || ''
  }
  showEditModal.value = true
}

function confirmDelete(booth) {
  boothToDelete.value = booth
  showDeleteModal.value = true
}

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    const data = {
      name: form.value.name,
      description: form.value.description,
      eventId: form.value.eventId,
      exhibitorEmail: form.value.exhibitorEmail,
      bannerUrl: form.value.bannerUrl || null
    }

    if (showEditModal.value) {
      await boothsStore.updateBooth(editingBooth.value.id, data)
    } else {
      await boothsStore.createBooth(data)
    }

    closeModal()
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Error al guardar el booth'
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  deleting.value = true

  try {
    await boothsStore.deleteBooth(boothToDelete.value.id)
    showDeleteModal.value = false
    boothToDelete.value = null
  } catch (error) {
    alert('Error al eliminar el booth')
  } finally {
    deleting.value = false
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingBooth.value = null
  form.value = {
    name: '',
    description: '',
    eventId: '',
    exhibitorEmail: '',
    bannerUrl: ''
  }
  errorMessage.value = ''
}
</script>
