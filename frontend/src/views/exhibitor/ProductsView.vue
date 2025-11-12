<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Loading State -->
    <div v-if="loading && !products.length" class="flex items-center justify-center py-12">
      <LoadingSpinner />
    </div>

    <!-- No Booth Warning -->
    <div v-else-if="!myBooth" class="p-4">
      <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
        <div class="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-yellow-800 text-sm font-medium">No tienes un booth asignado</p>
        <p class="text-yellow-700 text-xs mt-1">Contacta al administrador</p>
      </div>
    </div>

    <!-- Products List -->
    <div v-else-if="products.length" class="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex gap-3 p-3">
          <!-- Product Image -->
          <div class="flex-shrink-0">
            <div v-if="product.images?.[0]" class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
              <img :src="product.images[0]" :alt="product.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-gray-900 text-sm truncate mb-1">{{ product.name }}</h3>
            <p class="text-xs text-gray-600 line-clamp-2 mb-2">{{ product.description }}</p>
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-purple-600">S/ {{ formatPrice(product.price) }}</span>
              <span class="text-xs px-2 py-1 rounded-full" :class="product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <button @click="editProduct(product)" class="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 active:scale-95 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="confirmDelete(product)" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="myBooth" class="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">No tienes productos</h3>
      <p class="text-gray-600 text-sm mb-6">Comienza agregando tu primer producto</p>
      <button @click="showCreateModal = true" class="px-6 py-3 bg-purple-600 text-white rounded-full font-bold shadow-lg shadow-purple-500/30 active:scale-95 transition-transform">
        + Agregar Producto
      </button>
    </div>

    <!-- Floating Action Button (FAB) -->
    <button
      v-if="myBooth && products.length"
      @click="showCreateModal = true"
      class="fixed bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-500/40 flex items-center justify-center active:scale-95 hover:scale-105 transition-transform z-30"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Create/Edit Modal - Fullscreen on mobile, centered on desktop -->
    <Transition name="slide-up">
      <div
        v-if="showCreateModal || showEditModal"
        class="fixed inset-0 z-50 flex items-start md:items-center justify-center md:bg-black/50 md:p-4"
      >
        <div class="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl bg-white md:rounded-2xl md:shadow-2xl flex flex-col overflow-hidden"
        >
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button @click="closeModal" :disabled="submitting" class="p-2 -ml-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-lg font-bold">
            {{ showEditModal ? 'Editar Producto' : 'Nuevo Producto' }}
          </h2>
          <div class="w-10"></div>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-4">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">
                Nombre *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Alfombra tejida a mano"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">
                Descripción *
              </label>
              <textarea
                v-model="form.description"
                required
                rows="4"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Describe el producto..."
              ></textarea>
            </div>

            <!-- Price and Stock -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">
                  Precio (S/) *
                </label>
                <input
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-900 mb-2">
                  Stock *
                </label>
                <input
                  v-model.number="form.stock"
                  type="number"
                  min="0"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Image URL -->
            <div>
              <label class="block text-sm font-bold text-gray-900 mb-2">
                URL de Imagen
              </label>
              <input
                v-model="form.imageUrl"
                type="url"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://ejemplo.com/producto.jpg"
              />
              <p class="text-xs text-gray-500 mt-2">
                Sube tu imagen a Imgur, Cloudinary u otro servicio y pega el enlace
              </p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
              {{ errorMessage }}
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
          <button
            @click="handleSubmit"
            :disabled="submitting"
            class="w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? 'Guardando...' : (showEditModal ? 'Guardar Cambios' : 'Agregar Producto') }}
          </button>
          <button
            type="button"
            @click="closeModal"
            :disabled="submitting"
            class="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="bg-white rounded-2xl max-w-sm w-full p-6 scale-100 transition-transform">
          <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-center mb-2">¿Eliminar producto?</h3>
          <p class="text-gray-600 text-center mb-6">
            Se eliminará <strong>{{ productToDelete?.name }}</strong>. Esta acción no se puede deshacer.
          </p>
          <div class="space-y-3">
            <button
              @click="handleDelete"
              :disabled="deleting"
              class="w-full py-3 bg-red-600 text-white rounded-xl font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {{ deleting ? 'Eliminando...' : 'Sí, Eliminar' }}
            </button>
            <button
              @click="showDeleteModal = false"
              :disabled="deleting"
              class="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>
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

<style scoped>
/* Slide up animation for modal */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

/* Fade animation for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
