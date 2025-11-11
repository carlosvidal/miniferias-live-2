<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Gestión de Eventos</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Crear Evento
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="eventsStore.loading && !eventsStore.events.length" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Events List -->
    <div v-else-if="eventsStore.events.length" class="space-y-4">
      <div
        v-for="event in eventsStore.events"
        :key="event.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-semibold">{{ event.name }}</h3>
              <span
                :class="getStatusBadgeClass(event.status)"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ getStatusLabel(event.status) }}
              </span>
            </div>
            <p class="text-gray-600 mb-3">{{ event.description }}</p>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ formatDate(event.startDate) }}
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}
              </div>
              <div v-if="event._count?.booths" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {{ event._count.booths }} booths
              </div>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button
              @click="editEvent(event)"
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="confirmDelete(event)"
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
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 card">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-600 mb-4">No hay eventos creados</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Crear Primer Evento
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
            {{ showEditModal ? 'Editar Evento' : 'Crear Nuevo Evento' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Título del Evento *
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                class="input"
                placeholder="Ej: Miniferias de Navidad 2025"
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
                placeholder="Describe el evento..."
              ></textarea>
            </div>

            <!-- Date and Time -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Inicio *
                </label>
                <input
                  v-model="form.startDate"
                  type="datetime-local"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora de Fin *
                </label>
                <input
                  v-model="form.endDate"
                  type="datetime-local"
                  required
                  class="input"
                />
              </div>
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

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select v-model="form.status" class="input">
                <option value="DRAFT">Borrador</option>
                <option value="SCHEDULED">Programado</option>
                <option value="LIVE">En Vivo</option>
                <option value="ENDED">Finalizado</option>
              </select>
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
                {{ submitting ? 'Guardando...' : (showEditModal ? 'Guardar Cambios' : 'Crear Evento') }}
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
          ¿Estás seguro de eliminar el evento <strong>{{ eventToDelete?.name }}</strong>?
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
import { useEventsStore } from '@/stores/events'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const eventsStore = useEventsStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const eventToDelete = ref(null)
const editingEvent = ref(null)
const submitting = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const form = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  bannerUrl: '',
  status: 'DRAFT'
})

onMounted(() => {
  eventsStore.fetchEvents()
})

function getStatusLabel(status) {
  const labels = {
    DRAFT: 'Borrador',
    SCHEDULED: 'Programado',
    LIVE: 'En Vivo',
    ENDED: 'Finalizado'
  }
  return labels[status] || status
}

function getStatusBadgeClass(status) {
  const classes = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    LIVE: 'bg-green-100 text-green-700',
    ENDED: 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function editEvent(event) {
  editingEvent.value = event
  form.value = {
    title: event.name,
    description: event.description,
    startDate: new Date(event.startDate).toISOString().slice(0, 16),
    endDate: new Date(event.endDate).toISOString().slice(0, 16),
    bannerUrl: event.coverImage || '',
    status: event.status
  }
  showEditModal.value = true
}

function confirmDelete(event) {
  eventToDelete.value = event
  showDeleteModal.value = true
}

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    const data = {
      name: form.value.title,
      description: form.value.description,
      startDate: new Date(form.value.startDate).toISOString(),
      endDate: new Date(form.value.endDate).toISOString(),
      coverImage: form.value.bannerUrl || null,
      status: form.value.status
    }

    console.log('Enviando datos:', data) // Debug

    if (showEditModal.value) {
      await eventsStore.updateEvent(editingEvent.value.id, data)
    } else {
      await eventsStore.createEvent(data)
    }

    closeModal()
  } catch (error) {
    console.error('Error completo:', error.response?.data) // Debug
    if (error.response?.data?.details) {
      // Mostrar errores de validación específicos
      const errorMessages = error.response.data.details.map(d => `${d.field}: ${d.message}`).join(', ')
      errorMessage.value = errorMessages
    } else {
      errorMessage.value = error.response?.data?.error || 'Error al guardar el evento'
    }
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  deleting.value = true

  try {
    await eventsStore.deleteEvent(eventToDelete.value.id)
    showDeleteModal.value = false
    eventToDelete.value = null
  } catch (error) {
    alert('Error al eliminar el evento')
  } finally {
    deleting.value = false
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingEvent.value = null
  form.value = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    bannerUrl: '',
    status: 'DRAFT'
  }
  errorMessage.value = ''
}
</script>
