<template>
  <div class="image-upload">
    <!-- Preview de la imagen actual -->
    <div v-if="imageUrl || previewUrl" class="image-preview-container">
      <div
        :class="[
          'image-preview',
          {
            'rounded-full': type === 'avatar' || type === 'logo',
            'aspect-square': type === 'avatar' || type === 'logo' || type === 'product',
            'aspect-video': type === 'cover'
          }
        ]"
      >
        <img
          :src="previewUrl || imageUrl"
          :alt="alt || 'Imagen'"
          class="w-full h-full object-cover"
        />

        <!-- Botón para eliminar -->
        <button
          v-if="!disabled && (imageUrl || previewUrl)"
          @click="removeImage"
          type="button"
          class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
          :disabled="uploading"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Overlay de loading -->
        <div
          v-if="uploading"
          class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div class="text-white text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
            <p class="text-sm">{{ uploadProgress }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Área de upload -->
    <div
      v-else
      @click="triggerFileInput"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="handleDrop"
      :class="[
        'upload-area',
        {
          'drag-over': dragOver,
          'disabled': disabled,
          'rounded-full': type === 'avatar' || type === 'logo',
          'aspect-square': type === 'avatar' || type === 'logo' || type === 'product',
          'aspect-video': type === 'cover'
        }
      ]"
    >
      <div class="upload-content">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p class="upload-text">{{ uploadText }}</p>
        <p class="upload-hint">{{ uploadHint }}</p>
      </div>
    </div>

    <!-- Input de archivo oculto -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
      :multiple="multiple"
      @change="handleFileSelect"
      class="hidden"
      :disabled="disabled"
    />

    <!-- Mensaje de error -->
    <p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>

    <!-- Descripción del tipo de imagen -->
    <p v-if="description" class="text-gray-500 text-xs mt-2">{{ description }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useImageUpload } from '../../composables/useImageUpload'

const props = defineProps({
  /**
   * Tipo de imagen: 'avatar', 'logo', 'cover', 'product', 'paymentProof'
   */
  type: {
    type: String,
    required: true,
    validator: (value) => ['avatar', 'logo', 'cover', 'product', 'paymentProof'].includes(value)
  },

  /**
   * URL de la imagen actual (para edición)
   */
  modelValue: {
    type: String,
    default: null
  },

  /**
   * Permitir múltiples archivos (solo para productos)
   */
  multiple: {
    type: Boolean,
    default: false
  },

  /**
   * Tipo de entidad para cover (event o booth)
   */
  entityType: {
    type: String,
    default: null
  },

  /**
   * ID de la entidad relacionada
   */
  entityId: {
    type: String,
    default: null
  },

  /**
   * Deshabilitar el upload
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * Texto alternativo para la imagen
   */
  alt: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded', 'error'])

const {
  uploading,
  uploadProgress,
  error,
  uploadedImage,
  uploadAvatar,
  uploadLogo,
  uploadCover,
  uploadProductImage,
  uploadProductImages,
  uploadPaymentProof,
  deleteImage,
  reset,
  getImageUrl,
  extractImageId
} = useImageUpload()

const fileInput = ref(null)
const previewUrl = ref(null)
const dragOver = ref(false)
const imageUrl = ref(props.modelValue)

// Watch para actualizar cuando cambie el modelValue
watch(() => props.modelValue, (newValue) => {
  imageUrl.value = newValue
})

// Textos según el tipo de imagen
const uploadText = computed(() => {
  const texts = {
    avatar: 'Subir foto de perfil',
    logo: 'Subir logo',
    cover: 'Subir imagen de portada',
    product: props.multiple ? 'Subir imágenes de producto' : 'Subir imagen de producto',
    paymentProof: 'Subir comprobante de pago'
  }
  return texts[props.type] || 'Subir imagen'
})

const uploadHint = computed(() => {
  const hints = {
    avatar: 'Imagen cuadrada (se mostrará circular)',
    logo: 'Imagen cuadrada',
    cover: 'Imagen rectangular 16:9',
    product: props.multiple ? 'Máximo 5 imágenes cuadradas' : 'Imagen cuadrada',
    paymentProof: 'Captura de pantalla del pago'
  }
  return hints[props.type] || 'JPG, PNG, WebP o GIF (máx. 10MB)'
})

const description = computed(() => {
  const descriptions = {
    avatar: 'Las fotos de perfil se muestran circulares con border-radius 50%',
    logo: 'Los logos se muestran circulares con border-radius 50%',
    cover: 'Las imágenes de portada deben tener proporción 16:9',
    product: 'Las imágenes de producto deben ser cuadradas',
    paymentProof: null
  }
  return descriptions[props.type]
})

// Trigger del input de archivo
const triggerFileInput = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

// Manejo de selección de archivo
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    await uploadFiles(files)
  }
}

// Manejo de drag & drop
const handleDrop = async (event) => {
  dragOver.value = false
  if (props.disabled) return

  const files = Array.from(event.dataTransfer.files).filter(file =>
    file.type.startsWith('image/')
  )

  if (files.length > 0) {
    await uploadFiles(files)
  }
}

// Upload de archivos
const uploadFiles = async (files) => {
  try {
    reset()

    // Crear preview local
    if (files.length === 1) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target.result
      }
      reader.readAsDataURL(files[0])
    }

    let result

    // Subir según el tipo
    switch (props.type) {
      case 'avatar':
        result = await uploadAvatar(files[0])
        break
      case 'logo':
        result = await uploadLogo(files[0], props.entityId)
        break
      case 'cover':
        result = await uploadCover(files[0], props.entityType, props.entityId)
        break
      case 'product':
        result = props.multiple
          ? await uploadProductImages(files)
          : await uploadProductImage(files[0], props.entityId)
        break
      case 'paymentProof':
        result = await uploadPaymentProof(files[0], props.entityId)
        break
    }

    // Emitir el resultado
    const uploadedUrl = Array.isArray(result)
      ? result.map(r => r.url)
      : result.url

    emit('update:modelValue', uploadedUrl)
    emit('uploaded', result)

    // Limpiar preview
    previewUrl.value = null
  } catch (err) {
    console.error('Error uploading image:', err)
    emit('error', err)
    previewUrl.value = null
  }
}

// Eliminar imagen
const removeImage = async () => {
  if (imageUrl.value || previewUrl.value) {
    try {
      // Si hay una imagen en Cloudflare, eliminarla
      if (imageUrl.value) {
        const imageId = extractImageId(imageUrl.value)
        if (imageId) {
          await deleteImage(imageId)
        }
      }

      imageUrl.value = null
      previewUrl.value = null
      emit('update:modelValue', null)
    } catch (err) {
      console.error('Error deleting image:', err)
    }
  }
}
</script>

<style scoped>
.image-upload {
  @apply w-full;
}

.image-preview-container {
  @apply relative w-full;
}

.image-preview {
  @apply relative w-full overflow-hidden bg-gray-100;
  max-width: 400px;
}

.upload-area {
  @apply relative w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-500 bg-gray-50;
  max-width: 400px;
}

.upload-area.drag-over {
  @apply border-blue-500 bg-blue-50;
}

.upload-area.disabled {
  @apply cursor-not-allowed opacity-50;
}

.upload-content {
  @apply flex flex-col items-center justify-center;
}

.upload-icon {
  @apply w-12 h-12 text-gray-400 mb-3;
}

.upload-text {
  @apply text-sm font-medium text-gray-700 mb-1;
}

.upload-hint {
  @apply text-xs text-gray-500;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
