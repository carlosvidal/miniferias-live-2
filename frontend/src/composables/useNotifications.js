import { ref } from 'vue'

export function useNotifications() {
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const notificationPermission = ref('default') // 'default', 'granted', 'denied'
  const playerId = ref(null)

  // Verificar si OneSignal está disponible
  const getOneSignal = () => {
    return new Promise((resolve) => {
      if (window.OneSignal) {
        resolve(window.OneSignal)
      } else {
        window.OneSignalDeferred = window.OneSignalDeferred || []
        window.OneSignalDeferred.push((OneSignal) => {
          resolve(OneSignal)
        })
      }
    })
  }

  // Inicializar el estado
  const initialize = async () => {
    try {
      const OneSignal = await getOneSignal()

      // Verificar si el navegador soporta notificaciones
      isSupported.value = OneSignal.Notifications.isPushSupported()

      if (!isSupported.value) {
        console.warn('Push notifications are not supported in this browser')
        return false
      }

      // Obtener el estado actual del permiso
      notificationPermission.value = await OneSignal.Notifications.permissionNative

      // Verificar si el usuario ya está suscrito
      isSubscribed.value = await OneSignal.User.PushSubscription.optedIn

      // Obtener el player ID si está suscrito
      if (isSubscribed.value) {
        playerId.value = await OneSignal.User.PushSubscription.id
      }

      return true
    } catch (error) {
      console.error('Error initializing notifications:', error)
      return false
    }
  }

  // Solicitar permiso y suscribir al usuario
  const subscribe = async () => {
    try {
      const OneSignal = await getOneSignal()

      if (!isSupported.value) {
        throw new Error('Las notificaciones push no están soportadas en este navegador')
      }

      // Solicitar permiso
      const permission = await OneSignal.Notifications.requestPermission()
      notificationPermission.value = permission

      if (permission === 'denied') {
        throw new Error('El usuario ha bloqueado las notificaciones')
      }

      // Opt-in al usuario
      await OneSignal.User.PushSubscription.optIn()

      // Actualizar estado
      isSubscribed.value = true
      playerId.value = await OneSignal.User.PushSubscription.id

      console.log('User subscribed successfully. Player ID:', playerId.value)

      return {
        success: true,
        playerId: playerId.value
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Desuscribir al usuario
  const unsubscribe = async () => {
    try {
      const OneSignal = await getOneSignal()

      await OneSignal.User.PushSubscription.optOut()

      isSubscribed.value = false
      playerId.value = null

      console.log('User unsubscribed successfully')

      return { success: true }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Agregar tag (ej: event_123)
  const addTag = async (key, value) => {
    try {
      const OneSignal = await getOneSignal()

      await OneSignal.User.addTag(key, value)

      console.log(`Tag added: ${key} = ${value}`)

      return { success: true }
    } catch (error) {
      console.error('Error adding tag:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Eliminar tag
  const removeTag = async (key) => {
    try {
      const OneSignal = await getOneSignal()

      await OneSignal.User.removeTag(key)

      console.log(`Tag removed: ${key}`)

      return { success: true }
    } catch (error) {
      console.error('Error removing tag:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Agregar múltiples tags
  const addTags = async (tags) => {
    try {
      const OneSignal = await getOneSignal()

      await OneSignal.User.addTags(tags)

      console.log('Tags added:', tags)

      return { success: true }
    } catch (error) {
      console.error('Error adding tags:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Suscribirse a un evento específico
  const subscribeToEvent = async (eventId) => {
    try {
      // Primero suscribirse si no está suscrito
      if (!isSubscribed.value) {
        const result = await subscribe()
        if (!result.success) {
          return result
        }
      }

      // Agregar tag del evento
      const tagResult = await addTag(`event_${eventId}`, 'true')

      return tagResult
    } catch (error) {
      console.error('Error subscribing to event:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Desuscribirse de un evento específico
  const unsubscribeFromEvent = async (eventId) => {
    try {
      const result = await removeTag(`event_${eventId}`)
      return result
    } catch (error) {
      console.error('Error unsubscribing from event:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Verificar si está suscrito a un evento específico
  const isSubscribedToEvent = async (eventId) => {
    try {
      const OneSignal = await getOneSignal()
      const tags = await OneSignal.User.getTags()

      return !!tags[`event_${eventId}`]
    } catch (error) {
      console.error('Error checking event subscription:', error)
      return false
    }
  }

  // Establecer external user ID (para vincular con tu BD)
  const setExternalUserId = async (userId) => {
    try {
      const OneSignal = await getOneSignal()

      await OneSignal.login(userId)

      console.log('External user ID set:', userId)

      return { success: true }
    } catch (error) {
      console.error('Error setting external user ID:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Limpiar external user ID (logout)
  const clearExternalUserId = async () => {
    try {
      const OneSignal = await getOneSignal()

      await OneSignal.logout()

      console.log('External user ID cleared')

      return { success: true }
    } catch (error) {
      console.error('Error clearing external user ID:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  return {
    // Estado
    isSupported,
    isSubscribed,
    notificationPermission,
    playerId,

    // Métodos generales
    initialize,
    subscribe,
    unsubscribe,

    // Tags
    addTag,
    removeTag,
    addTags,

    // Eventos
    subscribeToEvent,
    unsubscribeFromEvent,
    isSubscribedToEvent,

    // Usuario
    setExternalUserId,
    clearExternalUserId
  }
}
