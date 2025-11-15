import { ref } from 'vue'
import { uploadAPI } from '../services/api'

/**
 * Composable para manejar el upload de imágenes a Cloudflare
 *
 * Tipos de imágenes:
 * - avatar: Profile picture (cuadrada, se muestra circular)
 * - logo: Logo de expositor (cuadrada)
 * - cover: Cover image de evento o booth (rectangular 16:9)
 * - product: Imagen de producto (cuadrada)
 * - paymentProof: Comprobante de pago
 */
export function useImageUpload() {
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)
  const uploadedImage = ref(null)

  /**
   * Valida que el archivo sea una imagen válida
   */
  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten JPEG, PNG, WebP y GIF.')
    }

    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. El tamaño máximo es 10MB.')
    }

    return true
  }

  /**
   * Upload avatar (profile picture)
   */
  const uploadAvatar = async (file) => {
    try {
      uploading.value = true
      error.value = null
      uploadProgress.value = 0

      validateImage(file)

      const response = await uploadAPI.uploadAvatar(file)
      uploadedImage.value = response.data.data
      uploadProgress.value = 100

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      uploading.value = false
    }
  }

  /**
   * Upload logo de expositor
   */
  const uploadLogo = async (file, boothId = null) => {
    try {
      uploading.value = true
      error.value = null
      uploadProgress.value = 0

      validateImage(file)

      const response = await uploadAPI.uploadLogo(file, boothId)
      uploadedImage.value = response.data.data
      uploadProgress.value = 100

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      uploading.value = false
    }
  }

  /**
   * Upload cover image (evento o booth)
   */
  const uploadCover = async (file, entityType, entityId = null) => {
    try {
      uploading.value = true
      error.value = null
      uploadProgress.value = 0

      validateImage(file)

      const response = await uploadAPI.uploadCover(file, entityType, entityId)
      uploadedImage.value = response.data.data
      uploadProgress.value = 100

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      uploading.value = false
    }
  }

  /**
   * Upload imagen de producto (una sola)
   */
  const uploadProductImage = async (file, productId = null, boothId = null) => {
    try {
      uploading.value = true
      error.value = null
      uploadProgress.value = 0

      validateImage(file)

      const response = await uploadAPI.uploadProductImage(file, productId, boothId)
      uploadedImage.value = response.data.data
      uploadProgress.value = 100

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      uploading.value = false
    }
  }

  /**
   * Upload múltiples imágenes de producto
   */
  const uploadProductImages = async (files) => {
    try {
      uploading.value = true
      error.value = null
      uploadProgress.value = 0

      // Validar todos los archivos
      files.forEach(file => validateImage(file))

      if (files.length > 5) {
        throw new Error('Máximo 5 imágenes por vez')
      }

      const response = await uploadAPI.uploadProductImages(files)
      uploadedImage.value = response.data.data
      uploadProgress.value = 100

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      uploading.value = false
    }
  }

  /**
   * Upload comprobante de pago
   */
  const uploadPaymentProof = async (file, orderId = null, userName = null) => {
    try {
      uploading.value = true
      error.value = null
      uploadProgress.value = 0

      validateImage(file)

      const response = await uploadAPI.uploadPaymentProof(file, orderId, userName)
      uploadedImage.value = response.data.data
      uploadProgress.value = 100

      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      uploading.value = false
    }
  }

  /**
   * Eliminar imagen
   */
  const deleteImage = async (imageId) => {
    try {
      error.value = null
      await uploadAPI.deleteImage(imageId)
      uploadedImage.value = null
      return true
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    }
  }

  /**
   * Reset del estado
   */
  const reset = () => {
    uploading.value = false
    uploadProgress.value = 0
    error.value = null
    uploadedImage.value = null
  }

  /**
   * Helper para obtener URL con variant específico
   * @param {string} imageId - ID de la imagen
   * @param {string} variant - Variant (avatar, logo, product, cover, thumbnail, public)
   */
  const getImageUrl = (imageId, variant = 'public') => {
    const accountHash = import.meta.env.VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH
    if (!accountHash || !imageId) return null
    return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
  }

  /**
   * Helper para extraer el ID de una URL de Cloudflare
   */
  const extractImageId = (url) => {
    if (!url) return null
    if (!url.includes('/')) return url // Ya es un ID

    const matches = url.match(/imagedelivery\.net\/[^\/]+\/([^\/]+)/)
    return matches?.[1] || null
  }

  return {
    // Estado
    uploading,
    uploadProgress,
    error,
    uploadedImage,

    // Métodos de upload
    uploadAvatar,
    uploadLogo,
    uploadCover,
    uploadProductImage,
    uploadProductImages,
    uploadPaymentProof,

    // Métodos de utilidad
    deleteImage,
    reset,
    validateImage,
    getImageUrl,
    extractImageId
  }
}
