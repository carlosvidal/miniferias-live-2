<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Mis Productos</h1>
      <button @click="showCreateModal = true" class="btn btn-primary" :disabled="!myBooth">
        + Agregar Producto
      </button>
    </div>

    <!-- No Booth Warning -->
    <div v-if="!myBooth && !loading" class="card bg-yellow-50 text-yellow-800 mb-6">
      <p>No tienes un booth asignado. Contacta al administrador para gestionar productos.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !products.length" class="text-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Products Grid -->
    <div v-else-if="products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="product in products" :key="product.id" class="card hover:shadow-lg transition-shadow">
        <div v-if="product.images?.[0]" class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
        </div>
        <div v-else class="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        <h3 class="text-lg font-semibold mb-2">{{ product.name }}</h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>

        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl font-bold text-purple-600">S/ {{ formatPrice(product.price) }}</span>
          <span class="text-sm text-gray-500">Stock: {{ product.stock }}</span>
        </div>

        <div class="flex gap-2">
          <button @click="editProduct(product)" class="flex-1 btn btn-secondary text-sm">
            Editar
          </button>
          <button @click="confirmDelete(product)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="myBooth" class="text-center py-12 card">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-gray-600 mb-4">No has agregado productos aún</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Agregar Primer Producto
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
            {{ showEditModal ? 'Editar Producto' : 'Agregar Nuevo Producto' }}
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input"
                placeholder="Ej: Alfombra tejida a mano"
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
                placeholder="Describe el producto..."
              ></textarea>
            </div>

            <!-- Price and Stock -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Precio (S/) *
                </label>
                <input
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  v-model.number="form.stock"
                  type="number"
                  min="0"
                  required
                  class="input"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Image URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                URL de Imagen
              </label>
              <input
                v-model="form.imageUrl"
                type="url"
                class="input"
                placeholder="https://ejemplo.com/producto.jpg"
              />
              <p class="text-xs text-gray-500 mt-1">
                Sube tu imagen a Imgur, Cloudinary u otro servicio y pega el enlace
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {{ errorMessage }}
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4">
              <button type="submit" :disabled="submitting" class="btn btn-primary flex-1">
                {{ submitting ? 'Guardando...' : (showEditModal ? 'Guardar Cambios' : 'Agregar Producto') }}
              </button>
              <button type="button" @click="closeModal" class="btn btn-secondary flex-1" :disabled="submitting">
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
          ¿Estás seguro de eliminar <strong>{{ productToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-3">
          <button @click="handleDelete" :disabled="deleting" class="btn bg-red-600 text-white hover:bg-red-700 flex-1">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
          <button @click="showDeleteModal = false" :disabled="deleting" class="btn btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useBoothsStore } from '@/stores/booths'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const productsStore = useProductsStore()
const boothsStore = useBoothsStore()

const loading = ref(true)
const myBooth = ref(null)
const products = ref([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const productToDelete = ref(null)
const editingProduct = ref(null)
const submitting = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  imageUrl: ''
})

onMounted(async () => {
  try {
    myBooth.value = await boothsStore.fetchMyBooth()
    if (myBooth.value) {
      const response = await productsStore.fetchProductsByBooth(myBooth.value.id)
      products.value = response.products
    }
  } catch (error) {
    console.error('Error loading products:', error)
  } finally {
    loading.value = false
  }
})

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

function editProduct(product) {
  editingProduct.value = product
  form.value = {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    imageUrl: product.images?.[0] || ''
  }
  showEditModal.value = true
}

function confirmDelete(product) {
  productToDelete.value = product
  showDeleteModal.value = true
}

async function handleSubmit() {
  submitting.value = true
  errorMessage.value = ''

  try {
    const data = {
      name: form.value.name,
      description: form.value.description,
      price: parseFloat(form.value.price),
      stock: parseInt(form.value.stock),
      images: form.value.imageUrl ? [form.value.imageUrl] : ['https://placehold.co/400x400/e5e5e5/666?text=No+Image'],
      boothId: myBooth.value.id
    }

    if (showEditModal.value) {
      await productsStore.updateProduct(editingProduct.value.id, data)
    } else {
      await productsStore.createProduct(data)
    }

    // Reload products
    const response = await productsStore.fetchProductsByBooth(myBooth.value.id)
    products.value = response.products

    closeModal()
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Error al guardar el producto'
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  deleting.value = true

  try {
    await productsStore.deleteProduct(productToDelete.value.id)
    products.value = products.value.filter(p => p.id !== productToDelete.value.id)
    showDeleteModal.value = false
    productToDelete.value = null
  } catch (error) {
    alert('Error al eliminar el producto')
  } finally {
    deleting.value = false
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingProduct.value = null
  form.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: ''
  }
  errorMessage.value = ''
}
</script>
