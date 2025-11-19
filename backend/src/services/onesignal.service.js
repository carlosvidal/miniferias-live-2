import * as OneSignal from '@onesignal/node-onesignal'

class OneSignalService {
  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID
    this.apiKey = process.env.ONESIGNAL_API_KEY

    if (!this.appId || !this.apiKey) {
      console.warn('OneSignal credentials not configured. Push notifications will be disabled.')
      this.isConfigured = false
      return
    }

    // Configurar cliente de OneSignal
    const configuration = OneSignal.createConfiguration({
      restApiKey: this.apiKey,
    })

    this.client = new OneSignal.DefaultApi(configuration)
    this.isConfigured = true

    console.log('OneSignal service initialized successfully')
  }

  /**
   * Enviar notificación a usuarios suscritos a un evento específico
   * @param {string} eventId - ID del evento
   * @param {object} notification - Datos de la notificación
   * @param {string} notification.title - Título de la notificación
   * @param {string} notification.message - Mensaje de la notificación
   * @param {string} notification.url - URL de destino (opcional)
   * @param {object} notification.data - Datos adicionales (opcional)
   * @returns {Promise<object>} Resultado del envío
   */
  async sendEventNotification(eventId, notification) {
    if (!this.isConfigured) {
      throw new Error('OneSignal not configured')
    }

    try {
      const { title, message, url, data } = notification

      // Crear notificación
      const notificationPayload = new OneSignal.Notification()
      notificationPayload.app_id = this.appId
      notificationPayload.headings = { en: title, es: title }
      notificationPayload.contents = { en: message, es: message }

      // Filtrar por tag del evento
      notificationPayload.filters = [
        {
          field: 'tag',
          key: `event_${eventId}`,
          relation: '=',
          value: 'true'
        }
      ]

      // URL de destino
      if (url) {
        notificationPayload.url = url
      }

      // Datos adicionales
      if (data) {
        notificationPayload.data = data
      }

      // Enviar notificación
      const response = await this.client.createNotification(notificationPayload)

      console.log('Notification sent successfully:', response)

      return {
        success: true,
        id: response.id,
        recipients: response.recipients
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  }

  /**
   * Enviar notificación a usuarios específicos por Player IDs
   * @param {string[]} playerIds - Array de Player IDs
   * @param {object} notification - Datos de la notificación
   * @returns {Promise<object>} Resultado del envío
   */
  async sendToPlayerIds(playerIds, notification) {
    if (!this.isConfigured) {
      throw new Error('OneSignal not configured')
    }

    try {
      const { title, message, url, data } = notification

      const notificationPayload = new OneSignal.Notification()
      notificationPayload.app_id = this.appId
      notificationPayload.headings = { en: title, es: title }
      notificationPayload.contents = { en: message, es: message }
      notificationPayload.include_player_ids = playerIds

      if (url) {
        notificationPayload.url = url
      }

      if (data) {
        notificationPayload.data = data
      }

      const response = await this.client.createNotification(notificationPayload)

      console.log('Notification sent to specific players:', response)

      return {
        success: true,
        id: response.id,
        recipients: response.recipients
      }
    } catch (error) {
      console.error('Error sending notification to players:', error)
      throw error
    }
  }

  /**
   * Enviar notificación a usuarios por External User IDs
   * @param {string[]} externalUserIds - Array de External User IDs
   * @param {object} notification - Datos de la notificación
   * @returns {Promise<object>} Resultado del envío
   */
  async sendToExternalUserIds(externalUserIds, notification) {
    if (!this.isConfigured) {
      throw new Error('OneSignal not configured')
    }

    try {
      const { title, message, url, data } = notification

      const notificationPayload = new OneSignal.Notification()
      notificationPayload.app_id = this.appId
      notificationPayload.headings = { en: title, es: title }
      notificationPayload.contents = { en: message, es: message }
      notificationPayload.include_external_user_ids = externalUserIds

      if (url) {
        notificationPayload.url = url
      }

      if (data) {
        notificationPayload.data = data
      }

      const response = await this.client.createNotification(notificationPayload)

      console.log('Notification sent to external user IDs:', response)

      return {
        success: true,
        id: response.id,
        recipients: response.recipients
      }
    } catch (error) {
      console.error('Error sending notification to external users:', error)
      throw error
    }
  }

  /**
   * Enviar notificación a todos los usuarios
   * @param {object} notification - Datos de la notificación
   * @returns {Promise<object>} Resultado del envío
   */
  async sendToAll(notification) {
    if (!this.isConfigured) {
      throw new Error('OneSignal not configured')
    }

    try {
      const { title, message, url, data } = notification

      const notificationPayload = new OneSignal.Notification()
      notificationPayload.app_id = this.appId
      notificationPayload.headings = { en: title, es: title }
      notificationPayload.contents = { en: message, es: message }
      notificationPayload.included_segments = ['All']

      if (url) {
        notificationPayload.url = url
      }

      if (data) {
        notificationPayload.data = data
      }

      const response = await this.client.createNotification(notificationPayload)

      console.log('Notification sent to all users:', response)

      return {
        success: true,
        id: response.id,
        recipients: response.recipients
      }
    } catch (error) {
      console.error('Error sending notification to all:', error)
      throw error
    }
  }

  /**
   * Enviar notificación personalizada cuando un evento está por empezar
   * @param {object} event - Datos del evento
   * @param {string} minutesBefore - Minutos antes del inicio (ej: '60', '24h')
   * @returns {Promise<object>} Resultado del envío
   */
  async sendEventStartingSoon(event, minutesBefore = '60') {
    const title = '¡El evento está por empezar!'
    let message = ''

    if (minutesBefore === '24h') {
      message = `"${event.name}" empieza mañana. ¡No te lo pierdas!`
    } else if (minutesBefore === '1h') {
      message = `"${event.name}" empieza en 1 hora. ¡Prepárate!`
    } else {
      message = `"${event.name}" empieza en ${minutesBefore} minutos`
    }

    const url = `${process.env.FRONTEND_URL}/events/${event.slug}`

    return await this.sendEventNotification(event.id, {
      title,
      message,
      url,
      data: {
        eventId: event.id,
        eventSlug: event.slug,
        type: 'event_starting_soon'
      }
    })
  }

  /**
   * Enviar notificación cuando un evento está en vivo
   * @param {object} event - Datos del evento
   * @returns {Promise<object>} Resultado del envío
   */
  async sendEventLive(event) {
    const title = '🔴 ¡Evento en vivo ahora!'
    const message = `"${event.name}" está en vivo. ¡Únete ahora!`
    const url = `${process.env.FRONTEND_URL}/events/${event.slug}`

    return await this.sendEventNotification(event.id, {
      title,
      message,
      url,
      data: {
        eventId: event.id,
        eventSlug: event.slug,
        type: 'event_live'
      }
    })
  }

  /**
   * Enviar notificación de nuevo booth en un evento
   * @param {object} event - Datos del evento
   * @param {object} booth - Datos del booth
   * @returns {Promise<object>} Resultado del envío
   */
  async sendNewBoothInEvent(event, booth) {
    const title = '¡Nuevo booth disponible!'
    const message = `"${booth.name}" se unió a "${event.name}"`
    const url = `${process.env.FRONTEND_URL}/booths/${booth.id}`

    return await this.sendEventNotification(event.id, {
      title,
      message,
      url,
      data: {
        eventId: event.id,
        boothId: booth.id,
        type: 'new_booth'
      }
    })
  }

  /**
   * Enviar notificación a los miembros de un booth cuando un visitante entra
   * @param {object} booth - Datos del booth
   * @param {object} visitor - Datos del visitante
   * @param {string[]} memberUserIds - Array de User IDs de los miembros del booth
   * @returns {Promise<object>} Resultado del envío
   */
  async sendVisitorEnteredBooth(booth, visitor, memberUserIds) {
    if (!this.isConfigured) {
      throw new Error('OneSignal not configured')
    }

    if (!memberUserIds || memberUserIds.length === 0) {
      console.log('No booth members to notify')
      return { success: true, recipients: 0 }
    }

    try {
      const title = '👤 Nuevo visitante en tu booth'
      const message = `${visitor.name} acaba de ingresar a "${booth.name}"`
      const url = `${process.env.FRONTEND_URL}/booths/${booth.id}`

      return await this.sendToExternalUserIds(memberUserIds, {
        title,
        message,
        url,
        data: {
          boothId: booth.id,
          boothName: booth.name,
          visitorId: visitor.id,
          visitorName: visitor.name,
          type: 'visitor_entered_booth'
        }
      })
    } catch (error) {
      console.error('Error sending visitor entry notification:', error)
      throw error
    }
  }

  /**
   * Cancelar una notificación programada
   * @param {string} notificationId - ID de la notificación
   * @returns {Promise<object>} Resultado de la cancelación
   */
  async cancelNotification(notificationId) {
    if (!this.isConfigured) {
      throw new Error('OneSignal not configured')
    }

    try {
      await this.client.cancelNotification(this.appId, notificationId)

      return { success: true }
    } catch (error) {
      console.error('Error canceling notification:', error)
      throw error
    }
  }
}

// Exportar instancia singleton
export default new OneSignalService()
