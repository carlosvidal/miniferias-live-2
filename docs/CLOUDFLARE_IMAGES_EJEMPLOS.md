# Cloudflare Images - Ejemplos Prácticos de Uso

Esta guía muestra ejemplos concretos de cómo usar el sistema de upload de imágenes en tu aplicación.

## Variantes Disponibles

Tu cuenta de Cloudflare tiene estas variantes configuradas:

| Variante | Tamaño | Uso Recomendado |
|----------|--------|-----------------|
| `avatar` | 200x200 | Profile pictures de usuarios (circular) |
| `logo` | 400x400 | Logos de expositores (circular) |
| `cover` | 1280x720 | Portadas de eventos y booths (16:9) |
| `small` | 360x360 | Imágenes pequeñas |
| `medium` | 720x720 | Imágenes de productos |
| `large` | 1440x1440 | Imágenes grandes |
| `xlarge` | 2880x2880 | Imágenes extra grandes |
| `micro` | 160x160 | Thumbnails muy pequeños |
| `public` | 1366x768 | Tamaño público general |

---

## 1. Upload de Avatar (Profile Picture)

### Ejemplo: ProfileView.vue

```vue
<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Mi Perfil</h1>

      <div class="card max-w-2xl">
        <form @submit.prevent="saveProfile" class="space-y-6">

          <!-- Upload de Avatar -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Foto de Perfil
            </label>
            <ImageUpload
              type="avatar"
              v-model="form.profilePicture"
              alt="Mi foto de perfil"
              @uploaded="handleAvatarUploaded"
              @error="handleUploadError"
            />
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              v-model="form.name"
              type="text"
              class="input"
              required
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              disabled
            />
          </div>

          <!-- Teléfono -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              v-model="form.phone"
              type="tel"
              class="input"
            />
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/shared/AppHeader.vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const saving = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  profilePicture: null
})

onMounted(async () => {
  // Cargar datos del usuario actual
  const response = await authAPI.getMe()
  form.value = {
    name: response.data.user.name,
    email: response.data.user.email,
    phone: response.data.user.phone || '',
    profilePicture: response.data.user.profilePicture
  }
})

const handleAvatarUploaded = (result) => {
  console.log('Avatar subido:', result)
  // La URL ya está en form.value.profilePicture gracias a v-model
}

const handleUploadError = (error) => {
  console.error('Error subiendo avatar:', error)
  alert('Error al subir la imagen. Por favor intenta de nuevo.')
}

const saveProfile = async () => {
  try {
    saving.value = true
    await authAPI.updateProfile({
      name: form.value.name,
      phone: form.value.phone,
      profilePicture: form.value.profilePicture
    })

    // Actualizar el store
    await authStore.fetchUser()

    alert('Perfil actualizado correctamente')
  } catch (error) {
    console.error('Error guardando perfil:', error)
    alert('Error al guardar el perfil')
  } finally {
    saving.value = false
  }
}
</script>
```

---

## 2. Upload de Logo y Cover en Booth Setup

### Ejemplo: BoothSetupView.vue (fragmento)

```vue
<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Configuración de Mi Booth</h1>

    <!-- Modal de Edición -->
    <div v-if="editMode" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Editar Booth</h2>

        <form @submit.prevent="saveBooth" class="space-y-6">

          <!-- Upload de Logo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Logo del Booth
            </label>
            <p class="text-xs text-gray-500 mb-2">
              El logo se mostrará circular. Sube una imagen cuadrada para mejores resultados.
            </p>
            <ImageUpload
              type="logo"
              v-model="editForm.logo"
              :entity-id="booth.id"
              alt="Logo del booth"
            />
          </div>

          <!-- Upload de Cover/Banner -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Banner del Booth
            </label>
            <p class="text-xs text-gray-500 mb-2">
              Imagen de portada en formato 16:9 (1280x720px recomendado)
            </p>
            <ImageUpload
              type="cover"
              entity-type="booth"
              :entity-id="booth.id"
              v-model="editForm.bannerUrl"
              alt="Banner del booth"
            />
          </div>

          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Booth
            </label>
            <input
              v-model="editForm.name"
              type="text"
              class="input"
              required
            />
          </div>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              v-model="editForm.description"
              rows="4"
              class="input"
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button type="submit" class="btn btn-primary flex-1" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <button type="button" @click="cancelEdit" class="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Vista del Booth -->
    <div v-if="booth" class="space-y-6">
      <div class="card">
        <!-- Logo circular -->
        <div v-if="booth.logo" class="mb-4">
          <img
            :src="booth.logo"
            :alt="booth.name"
            class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>

        <!-- Banner -->
        <div class="mb-6">
          <img
            v-if="booth.bannerUrl"
            :src="booth.bannerUrl"
            :alt="booth.name"
            class="w-full aspect-video object-cover rounded-lg"
          />
        </div>

        <h2 class="text-2xl font-semibold mb-2">{{ booth.name }}</h2>
        <p class="text-gray-600 mb-4">{{ booth.description }}</p>

        <button @click="editMode = true" class="btn btn-primary">
          Editar Booth
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { boothsAPI } from '@/services/api'

const editMode = ref(false)
const saving = ref(false)
const booth = ref(null)
const editForm = ref({
  name: '',
  description: '',
  logo: null,
  bannerUrl: null
})

const saveBooth = async () => {
  try {
    saving.value = true
    await boothsAPI.update(booth.value.id, editForm.value)

    // Recargar booth
    const response = await boothsAPI.getMyBooth()
    booth.value = response.data.booth

    editMode.value = false
    alert('Booth actualizado correctamente')
  } catch (error) {
    console.error('Error guardando booth:', error)
    alert('Error al guardar el booth')
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  editMode.value = false
  // Restaurar valores originales
  editForm.value = {
    name: booth.value.name,
    description: booth.value.description,
    logo: booth.value.logo,
    bannerUrl: booth.value.bannerUrl
  }
}
</script>
```

---

## 3. Upload de Imágenes de Producto (Múltiples)

### Ejemplo: ProductFormModal.vue

```vue
<template>
  <div class="modal">
    <div class="modal-content">
      <h2 class="text-2xl font-bold mb-4">
        {{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}
      </h2>

      <form @submit.prevent="saveProduct" class="space-y-6">

        <!-- Upload de Imágenes del Producto -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Imágenes del Producto
          </label>
          <p class="text-xs text-gray-500 mb-2">
            Puedes subir hasta 5 imágenes. Las imágenes deben ser cuadradas para mejores resultados.
          </p>

          <!-- Imágenes actuales -->
          <div v-if="form.images && form.images.length > 0" class="grid grid-cols-3 gap-4 mb-4">
            <div
              v-for="(image, index) in form.images"
              :key="index"
              class="relative aspect-square"
            >
              <img
                :src="image"
                alt="Producto"
                class="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Upload de nuevas imágenes -->
          <ImageUpload
            v-if="!form.images || form.images.length < 5"
            type="product"
            multiple
            :entity-id="boothId"
            @uploaded="handleProductImagesUploaded"
            alt="Imágenes del producto"
          />
        </div>

        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto
          </label>
          <input
            v-model="form.name"
            type="text"
            class="input"
            required
          />
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="input"
          ></textarea>
        </div>

        <!-- Precio y Stock -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Precio (S/)
            </label>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              class="input"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              class="input"
              required
            />
          </div>
        </div>

        <!-- Categoría -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <input
            v-model="form.category"
            type="text"
            class="input"
            placeholder="Ej: Ropa, Accesorios, Tecnología"
          />
        </div>

        <div class="flex gap-3">
          <button type="submit" class="btn btn-primary flex-1" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar Producto' }}
          </button>
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { productsAPI } from '@/services/api'

const props = defineProps({
  product: Object,
  boothId: String
})

const emit = defineEmits(['close', 'saved'])

const isEditing = ref(!!props.product)
const saving = ref(false)

const form = ref({
  name: props.product?.name || '',
  description: props.product?.description || '',
  price: props.product?.price || 0,
  stock: props.product?.stock || 0,
  category: props.product?.category || '',
  images: props.product?.images || []
})

const handleProductImagesUploaded = (results) => {
  // results es un array de objetos con URLs
  const newImages = Array.isArray(results)
    ? results.map(r => r.url)
    : [results.url]

  // Agregar las nuevas imágenes a las existentes
  form.value.images = [...(form.value.images || []), ...newImages]
}

const removeImage = (index) => {
  form.value.images.splice(index, 1)
}

const saveProduct = async () => {
  try {
    saving.value = true

    const productData = {
      ...form.value,
      boothId: props.boothId
    }

    if (isEditing.value) {
      await productsAPI.update(props.product.id, productData)
    } else {
      await productsAPI.create(productData)
    }

    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Error guardando producto:', error)
    alert('Error al guardar el producto')
  } finally {
    saving.value = false
  }
}
</script>
```

---

## 4. Upload de Comprobante de Pago en Checkout

### Ejemplo: CheckoutOverlay.vue (fragmento)

```vue
<template>
  <div class="checkout-overlay">
    <!-- ... otros campos del checkout ... -->

    <!-- Paso 3: Método de Pago -->
    <div v-if="currentStep === 3" class="space-y-6">
      <h3 class="text-xl font-semibold mb-4">Método de Pago</h3>

      <!-- Selección de método -->
      <div class="space-y-3">
        <label class="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            v-model="paymentMethod"
            value="yape"
            class="form-radio"
          />
          <div>
            <div class="font-medium">Yape</div>
            <div class="text-sm text-gray-600">Transferencia por Yape</div>
          </div>
        </label>

        <label class="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            v-model="paymentMethod"
            value="plin"
            class="form-radio"
          />
          <div>
            <div class="font-medium">Plin</div>
            <div class="text-sm text-gray-600">Transferencia por Plin</div>
          </div>
        </label>
      </div>

      <!-- Instrucciones de pago -->
      <div v-if="paymentMethod" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-semibold mb-2">Instrucciones de Pago</h4>
        <ol class="list-decimal list-inside space-y-2 text-sm">
          <li>Realiza la transferencia por {{ paymentMethod.toUpperCase() }}</li>
          <li>Número: {{ booth[`${paymentMethod}Number`] }}</li>
          <li>Monto: S/ {{ orderTotal.toFixed(2) }}</li>
          <li>Sube una captura de pantalla del comprobante abajo</li>
        </ol>
      </div>

      <!-- Upload de Comprobante -->
      <div v-if="paymentMethod">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Comprobante de Pago *
        </label>
        <p class="text-xs text-gray-500 mb-2">
          Sube una captura de pantalla del comprobante de pago
        </p>
        <ImageUpload
          type="paymentProof"
          v-model="paymentProof"
          alt="Comprobante de pago"
          @uploaded="handlePaymentProofUploaded"
        />
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          @click="currentStep = 2"
          class="btn btn-secondary flex-1"
        >
          Atrás
        </button>
        <button
          type="button"
          @click="confirmOrder"
          :disabled="!paymentProof || submitting"
          class="btn btn-primary flex-1"
        >
          {{ submitting ? 'Procesando...' : 'Confirmar Pedido' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { ordersAPI } from '@/services/api'

const currentStep = ref(1)
const paymentMethod = ref('')
const paymentProof = ref(null)
const submitting = ref(false)

const handlePaymentProofUploaded = (result) => {
  console.log('Comprobante subido:', result)
  // paymentProof.value ya tiene la URL gracias a v-model
}

const confirmOrder = async () => {
  if (!paymentProof.value) {
    alert('Por favor sube el comprobante de pago')
    return
  }

  try {
    submitting.value = true

    const orderData = {
      // ... otros datos del pedido
      paymentMethod: paymentMethod.value,
      paymentProof: paymentProof.value
    }

    await ordersAPI.create(orderData)

    // Redirigir a página de confirmación
    router.push('/order-confirmed')
  } catch (error) {
    console.error('Error creando pedido:', error)
    alert('Error al procesar el pedido')
  } finally {
    submitting.value = false
  }
}
</script>
```

---

## 5. Mostrar Imágenes con Diferentes Variantes

### Ejemplo: Uso de variantes según contexto

```vue
<template>
  <div>
    <!-- Avatar en header (micro) -->
    <img
      :src="getImageUrl(user.profilePicture, 'micro')"
      alt="Avatar"
      class="w-8 h-8 rounded-full"
    />

    <!-- Avatar en perfil (avatar) -->
    <img
      :src="getImageUrl(user.profilePicture, 'avatar')"
      alt="Avatar"
      class="w-20 h-20 rounded-full"
    />

    <!-- Logo del booth (logo) -->
    <img
      :src="getImageUrl(booth.logo, 'logo')"
      alt="Logo"
      class="w-32 h-32 rounded-full"
    />

    <!-- Cover del booth (cover) -->
    <img
      :src="getImageUrl(booth.bannerUrl, 'cover')"
      alt="Banner"
      class="w-full aspect-video object-cover"
    />

    <!-- Producto en grid (medium) -->
    <img
      :src="getImageUrl(product.images[0], 'medium')"
      alt="Producto"
      class="w-full aspect-square object-cover"
    />

    <!-- Producto en detalle (large) -->
    <img
      :src="getImageUrl(product.images[0], 'large')"
      alt="Producto"
      class="w-full aspect-square object-cover"
    />

    <!-- Thumbnail en carrito (small) -->
    <img
      :src="getImageUrl(product.images[0], 'small')"
      alt="Producto"
      class="w-16 h-16 object-cover rounded"
    />

    <!-- Imagen full size para zoom (xlarge) -->
    <img
      :src="getImageUrl(product.images[0], 'xlarge')"
      alt="Producto"
      class="w-full"
    />
  </div>
</template>

<script setup>
import { useImageUpload } from '@/composables/useImageUpload'

const { getImageUrl } = useImageUpload()

// También puedes usarlo directamente
const getUrl = (imageId, variant = 'public') => {
  const accountHash = import.meta.env.VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
}
</script>
```

---

## 6. Helper para Imágenes Responsivas

### Composable personalizado

```javascript
// composables/useResponsiveImage.js
import { useImageUpload } from './useImageUpload'

export function useResponsiveImage() {
  const { getImageUrl } = useImageUpload()

  /**
   * Obtiene la URL de imagen apropiada según el ancho de pantalla
   */
  const getResponsiveImageUrl = (imageId, screenWidth = window.innerWidth) => {
    if (screenWidth < 640) {
      // Mobile - usar small
      return getImageUrl(imageId, 'small')
    } else if (screenWidth < 1024) {
      // Tablet - usar medium
      return getImageUrl(imageId, 'medium')
    } else if (screenWidth < 1920) {
      // Desktop - usar large
      return getImageUrl(imageId, 'large')
    } else {
      // 4K - usar xlarge
      return getImageUrl(imageId, 'xlarge')
    }
  }

  return {
    getResponsiveImageUrl
  }
}
```

---

## 7. Validaciones Personalizadas

Si necesitas validaciones adicionales:

```vue
<script setup>
import { useImageUpload } from '@/composables/useImageUpload'

const { uploading, error, uploadAvatar } = useImageUpload()

const handleCustomUpload = async (file) => {
  // Validar dimensiones mínimas
  const img = new Image()
  img.src = URL.createObjectURL(file)

  img.onload = async () => {
    if (img.width < 200 || img.height < 200) {
      alert('La imagen debe ser de al menos 200x200 píxeles')
      return
    }

    // Validar aspect ratio para productos (cuadrada)
    if (Math.abs(img.width - img.height) > 50) {
      const confirm = window.confirm(
        'La imagen no es cuadrada. Cloudflare la recortará automáticamente. ¿Continuar?'
      )
      if (!confirm) return
    }

    // Subir imagen
    try {
      const result = await uploadAvatar(file)
      console.log('Imagen subida:', result.url)
    } catch (err) {
      console.error('Error:', error.value)
    }
  }
}
</script>
```

---

## Resumen de Mejores Prácticas

✅ **Usa el variant correcto para cada caso:**
- `micro` (160x160) - Avatares en headers/listas
- `avatar` (200x200) - Avatares en perfiles
- `small` (360x360) - Thumbnails en carritos/listas
- `medium` (720x720) - Productos en grids
- `logo` (400x400) - Logos de expositores
- `cover` (1280x720) - Banners y covers
- `large` (1440x1440) - Vista detallada de productos
- `xlarge` (2880x2880) - Zoom de imágenes

✅ **Siempre muestra loading state:**
```vue
<div v-if="uploading" class="loading">Subiendo imagen...</div>
```

✅ **Maneja errores apropiadamente:**
```vue
<p v-if="error" class="text-red-600">{{ error }}</p>
```

✅ **Usa lazy loading para mejor performance:**
```vue
<img :src="imageUrl" loading="lazy" />
```

✅ **Aplica estilos circulares con CSS para avatares/logos:**
```css
.avatar {
  border-radius: 50%;
}
```
