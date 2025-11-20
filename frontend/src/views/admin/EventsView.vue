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
    <div v-else-if="eventsStore.events.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AdminEventCard
        v-for="event in eventsStore.events"
        :key="event.id"
        :event="event"
        @edit="editEvent"
        @delete="confirmDelete"
      />
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

            <!-- Banner Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Banner del Evento
              </label>
              <p class="text-xs text-gray-500 mb-3">
                Imagen de portada en formato 16:9 (1280x720px recomendado)
              </p>
              <ImageUpload
                type="cover"
                entity-type="event"
                :entity-id="editingEvent?.id"
                v-model="form.bannerUrl"
                alt="Banner del evento"
                @uploaded="handleBannerUploaded"
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

            <!-- Capacity and Budget Section -->
            <div class="border-t pt-4 mt-4">
              <h3 class="text-lg font-semibold mb-4">Configuración de Capacidad y Presupuesto</h3>

              <!-- Stream Provider -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor de Streaming
                </label>
                <select v-model="form.streamProvider" class="input">
                  <option value="AGORA">Agora.io</option>
                  <option value="HUNDREDMS">100ms</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">
                  Proveedor de streaming de video en vivo
                </p>
              </div>

              <!-- Budget and Currency -->
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Presupuesto
                  </label>
                  <input
                    v-model.number="form.budget"
                    type="number"
                    step="0.01"
                    min="0"
                    class="input"
                    placeholder="0.00"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Presupuesto total para el evento
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Moneda
                  </label>
                  <select v-model="form.currency" class="input">
                    <option value="USD">USD</option>
                    <option value="PEN">PEN</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <!-- Viewer Capacity -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de Viewers Concurrentes
                  </label>
                  <input
                    v-model.number="form.maxConcurrentViewers"
                    type="number"
                    min="0"
                    class="input"
                    placeholder="1000"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Límite total de viewers en todo el evento
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Estimación de Pico de Viewers
                  </label>
                  <input
                    v-model.number="form.estimatedPeakViewers"
                    type="number"
                    min="0"
                    class="input"
                    placeholder="500"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Para cálculo de costos estimados
                  </p>
                </div>
              </div>

              <!-- Max Booths -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Booths
                </label>
                <input
                  v-model.number="form.maxBooths"
                  type="number"
                  min="1"
                  class="input"
                  placeholder="10"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Número máximo de booths permitidos en el evento
                </p>
              </div>
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
import ImageUpload from '@/components/shared/ImageUpload.vue'
import AdminEventCard from '@/components/admin/AdminEventCard.vue'
import { useImageUpload } from '@/composables/useImageUpload'

const eventsStore = useEventsStore()
const { getImageUrl } = useImageUpload()

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
  status: 'DRAFT',
  streamProvider: 'AGORA',
  budget: null,
  currency: 'USD',
  maxConcurrentViewers: null,
  estimatedPeakViewers: null,
  maxBooths: null
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
    status: event.status,
    streamProvider: event.streamProvider || 'AGORA',
    budget: event.budget || null,
    currency: event.currency || 'USD',
    maxConcurrentViewers: event.maxConcurrentViewers || null,
    estimatedPeakViewers: event.estimatedPeakViewers || null,
    maxBooths: event.maxBooths || null
  }
  showEditModal.value = true
}

function confirmDelete(event) {
  eventToDelete.value = event
  showDeleteModal.value = true
}

function handleBannerUploaded(result) {
  console.log('Banner subido:', result)
  // La URL ya se actualiza automáticamente en form.bannerUrl por el v-model
}

function getCoverImageUrl(imageUrl) {
  if (!imageUrl) return null
  // Si ya es una URL de Cloudflare, extraer el ID y usar el variant 'cover'
  if (imageUrl.includes('imagedelivery.net')) {
    const matches = imageUrl.match(/imagedelivery\.net\/[^\/]+\/([^\/]+)/)
    if (matches && matches[1]) {
      return getImageUrl(matches[1], 'cover')
    }
  }
  return imageUrl
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
      status: form.value.status,
      streamProvider: form.value.streamProvider
    }

    // Solo agregar coverImage si tiene valor
    if (form.value.bannerUrl && form.value.bannerUrl.trim()) {
      data.coverImage = form.value.bannerUrl
    }

    // Agregar campos de capacidad y presupuesto si tienen valor
    if (form.value.budget !== null && form.value.budget > 0) {
      data.budget = parseFloat(form.value.budget)
    }
    if (form.value.currency) {
      data.currency = form.value.currency
    }
    if (form.value.maxConcurrentViewers !== null && form.value.maxConcurrentViewers > 0) {
      data.maxConcurrentViewers = parseInt(form.value.maxConcurrentViewers)
    }
    if (form.value.estimatedPeakViewers !== null && form.value.estimatedPeakViewers > 0) {
      data.estimatedPeakViewers = parseInt(form.value.estimatedPeakViewers)
    }
    if (form.value.maxBooths !== null && form.value.maxBooths > 0) {
      data.maxBooths = parseInt(form.value.maxBooths)
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
    status: 'DRAFT',
    streamProvider: 'AGORA',
    budget: null,
    currency: 'USD',
    maxConcurrentViewers: null,
    estimatedPeakViewers: null,
    maxBooths: null
  }
  errorMessage.value = ''
}
</script>
