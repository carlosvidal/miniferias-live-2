<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Gestión de Usuarios</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        + Crear Usuario
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            v-model="searchQuery"
            type="text"
            class="input"
            placeholder="Buscar por nombre o email..."
            @input="handleSearch"
          />
        </div>

        <!-- Role Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Rol
          </label>
          <select v-model="roleFilter" @change="fetchUsers" class="input">
            <option value="">Todos los roles</option>
            <option value="VISITOR">Visitantes</option>
            <option value="EXHIBITOR">Expositores</option>
            <option value="ADMIN">Administradores</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !users.length" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Users Table -->
    <div v-else-if="users.length" class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Registro
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                  <div v-if="user.phone" class="text-sm text-gray-500">📱 {{ user.phone }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  :value="user.role"
                  @change="handleRoleChange(user, $event.target.value)"
                  :disabled="updatingRoleId === user.id"
                  class="text-sm rounded-lg px-3 py-1 border"
                  :class="getRoleClass(user.role)"
                >
                  <option value="VISITOR">Visitante</option>
                  <option value="EXHIBITOR">Expositor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="space-y-1">
                  <div v-if="user._count.booths > 0">
                    🏪 {{ user._count.booths }} booth(s)
                  </div>
                  <div v-if="user._count.orders > 0">
                    📦 {{ user._count.orders }} pedido(s)
                  </div>
                  <div v-if="user._count.booths === 0 && user._count.orders === 0" class="text-gray-400">
                    Sin actividad
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="confirmDelete(user)"
                  :disabled="deletingId === user.id"
                  class="text-red-600 hover:text-red-900 disabled:opacity-50"
                  title="Eliminar usuario"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 card">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <p class="text-gray-600 mb-4">No hay usuarios registrados</p>
    </div>

    <!-- Create User Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input"
                placeholder="Juan Pérez"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="input"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                v-model="form.phone"
                type="tel"
                pattern="9\d{8}"
                maxlength="9"
                class="input"
                placeholder="987654321"
              />
              <p class="text-xs text-gray-500 mt-1">Formato: 9 dígitos comenzando con 9</p>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="6"
                class="input"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select v-model="form.role" required class="input">
                <option value="VISITOR">Visitante</option>
                <option value="EXHIBITOR">Expositor</option>
                <option value="ADMIN">Administrador</option>
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
                {{ submitting ? 'Creando...' : 'Crear Usuario' }}
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
        <p class="text-gray-600 mb-2">
          ¿Estás seguro de eliminar al usuario <strong>{{ userToDelete?.name }}</strong>?
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Email: {{ userToDelete?.email }}
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
import { usersAPI } from '@/services/api'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const users = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const userToDelete = ref(null)
const submitting = ref(false)
const deleting = ref(false)
const deletingId = ref(null)
const updatingRoleId = ref(null)
const errorMessage = ref('')
const searchQuery = ref('')
const roleFilter = ref('')

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'VISITOR'
})

onMounted(() => {
  fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  try {
    const params = {}
    if (roleFilter.value) params.role = roleFilter.value
    if (searchQuery.value) params.search = searchQuery.value

    const response = await usersAPI.getAll(params)
    users.value = response.data.users
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

let searchTimeout
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchUsers()
  }, 500)
}

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    await usersAPI.create(form.value)
    closeModal()
    await fetchUsers()
  } catch (error) {
    console.error('Error creating user:', error)
    errorMessage.value = error.response?.data?.error || 'Error al crear el usuario'
  } finally {
    submitting.value = false
  }
}

async function handleRoleChange(user, newRole) {
  if (user.role === newRole) return

  const confirm = window.confirm(
    `¿Cambiar el rol de ${user.name} de ${getRoleText(user.role)} a ${getRoleText(newRole)}?`
  )

  if (!confirm) {
    // Reset select to original value
    const select = event.target
    select.value = user.role
    return
  }

  updatingRoleId.value = user.id
  try {
    await usersAPI.updateRole(user.id, newRole)
    user.role = newRole
  } catch (error) {
    console.error('Error updating role:', error)
    alert(error.response?.data?.error || 'Error al actualizar el rol')
    // Reset select to original value
    const select = event.target
    select.value = user.role
  } finally {
    updatingRoleId.value = null
  }
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!userToDelete.value) return

  deleting.value = true
  deletingId.value = userToDelete.value.id

  try {
    await usersAPI.delete(userToDelete.value.id)
    showDeleteModal.value = false
    userToDelete.value = null
    await fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    alert(error.response?.data?.error || 'Error al eliminar el usuario')
  } finally {
    deleting.value = false
    deletingId.value = null
  }
}

function closeModal() {
  showCreateModal.value = false
  form.value = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'VISITOR'
  }
  errorMessage.value = ''
}

function getRoleClass(role) {
  const classes = {
    VISITOR: 'bg-blue-50 text-blue-700 border-blue-200',
    EXHIBITOR: 'bg-purple-50 text-purple-700 border-purple-200',
    ADMIN: 'bg-red-50 text-red-700 border-red-200'
  }
  return classes[role] || 'bg-gray-50 text-gray-700 border-gray-200'
}

function getRoleText(role) {
  const texts = {
    VISITOR: 'Visitante',
    EXHIBITOR: 'Expositor',
    ADMIN: 'Administrador'
  }
  return texts[role] || role
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>
