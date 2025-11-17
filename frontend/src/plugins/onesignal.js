// OneSignal Plugin for Vue 3
export default {
  install(app) {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID

    if (!appId) {
      console.warn('OneSignal App ID not configured')
      return
    }

    // Wait for OneSignal SDK to load
    if (typeof window !== 'undefined') {
      window.OneSignalDeferred = window.OneSignalDeferred || []

      window.OneSignalDeferred.push(async function(OneSignal) {
        try {
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true, // Para desarrollo local
            notifyButton: {
              enable: false, // Desactivar botón por defecto (usaremos nuestro propio UI)
            },
            welcomeNotification: {
              disable: false, // Mostrar notificación de bienvenida
              title: "¡Bienvenido a Miniferias!",
              message: "Recibirás notificaciones de tus eventos favoritos"
            }
          })

          console.log('OneSignal initialized successfully')

          // Hacer OneSignal disponible globalmente
          app.config.globalProperties.$OneSignal = OneSignal
        } catch (error) {
          console.error('Error initializing OneSignal:', error)
        }
      })
    }
  }
}
