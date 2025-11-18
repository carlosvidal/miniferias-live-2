import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const showModal = ref(false)
const modalConfig = ref({
  title: 'Inicia sesión para continuar',
  message: 'Accede con tus redes sociales en segundos'
})

export function useAuthPrompt() {
  const authStore = useAuthStore()

  /**
   * Check if user is authenticated, if not show login modal
   * @param {Object} options - Configuration options
   * @param {string} options.title - Modal title
   * @param {string} options.message - Modal message
   * @returns {boolean} - Returns true if authenticated, false otherwise
   */
  function requireAuth(options = {}) {
    if (authStore.isAuthenticated) {
      return true
    }

    // Update modal config if provided
    if (options.title) modalConfig.value.title = options.title
    if (options.message) modalConfig.value.message = options.message

    // Show modal
    showModal.value = true
    return false
  }

  /**
   * Prompt for authentication with custom message
   * @param {string} title - Modal title
   * @param {string} message - Modal message
   */
  function promptAuth(title, message) {
    modalConfig.value.title = title
    modalConfig.value.message = message
    showModal.value = true
  }

  /**
   * Close the authentication modal
   */
  function closeModal() {
    showModal.value = false
  }

  return {
    showModal,
    modalConfig,
    requireAuth,
    promptAuth,
    closeModal
  }
}
