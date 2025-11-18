import oneSignalService from '../services/onesignal.service.js'
import prisma from '../config/prisma.js'

/**
 * Enviar notificación de prueba a usuarios suscritos a un evento
 * POST /api/notifications/test/event/:eventId
 */
export async function sendTestEventNotification(req, res) {
  try {
    const { eventId } = req.params
    const { title, message } = req.body

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    const result = await oneSignalService.sendEventNotification(eventId, {
      title: title || 'Notificación de prueba',
      message: message || `Esta es una notificación de prueba del evento "${event.name}"`,
      url: `${process.env.FRONTEND_URL}/events/${event.slug}`,
      data: {
        eventId: event.id,
        type: 'test'
      }
    })

    res.json({
      message: 'Test notification sent successfully',
      result
    })
  } catch (error) {
    console.error('Send test notification error:', error)
    res.status(500).json({ error: 'Failed to send test notification' })
  }
}

/**
 * Enviar notificación cuando un evento está por empezar
 * POST /api/notifications/event/:eventId/starting-soon
 */
export async function sendEventStartingSoonNotification(req, res) {
  try {
    const { eventId } = req.params
    const { minutesBefore } = req.body // '60', '1h', '24h'

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    const result = await oneSignalService.sendEventStartingSoon(event, minutesBefore)

    res.json({
      message: 'Event starting soon notification sent successfully',
      result
    })
  } catch (error) {
    console.error('Send event starting soon notification error:', error)
    res.status(500).json({ error: 'Failed to send notification' })
  }
}

/**
 * Enviar notificación cuando un evento está en vivo
 * POST /api/notifications/event/:eventId/live
 */
export async function sendEventLiveNotification(req, res) {
  try {
    const { eventId } = req.params

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    const result = await oneSignalService.sendEventLive(event)

    // Actualizar el estado del evento a LIVE
    await prisma.event.update({
      where: { id: eventId },
      data: { isLive: true, status: 'LIVE' }
    })

    res.json({
      message: 'Event live notification sent successfully',
      result
    })
  } catch (error) {
    console.error('Send event live notification error:', error)
    res.status(500).json({ error: 'Failed to send notification' })
  }
}

/**
 * Enviar notificación de nuevo booth en un evento
 * POST /api/notifications/event/:eventId/new-booth
 */
export async function sendNewBoothNotification(req, res) {
  try {
    const { eventId } = req.params
    const { boothId } = req.body

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    const booth = await prisma.booth.findUnique({
      where: { id: boothId }
    })

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' })
    }

    const result = await oneSignalService.sendNewBoothInEvent(event, booth)

    res.json({
      message: 'New booth notification sent successfully',
      result
    })
  } catch (error) {
    console.error('Send new booth notification error:', error)
    res.status(500).json({ error: 'Failed to send notification' })
  }
}

/**
 * Enviar notificación personalizada
 * POST /api/notifications/custom
 */
export async function sendCustomNotification(req, res) {
  try {
    const { target, title, message, url, data } = req.body

    let result

    if (target.type === 'event') {
      // Enviar a usuarios suscritos a un evento
      result = await oneSignalService.sendEventNotification(target.eventId, {
        title,
        message,
        url,
        data
      })
    } else if (target.type === 'playerIds') {
      // Enviar a Player IDs específicos
      result = await oneSignalService.sendToPlayerIds(target.playerIds, {
        title,
        message,
        url,
        data
      })
    } else if (target.type === 'externalUserIds') {
      // Enviar a External User IDs
      result = await oneSignalService.sendToExternalUserIds(target.externalUserIds, {
        title,
        message,
        url,
        data
      })
    } else if (target.type === 'all') {
      // Enviar a todos
      result = await oneSignalService.sendToAll({
        title,
        message,
        url,
        data
      })
    } else {
      return res.status(400).json({ error: 'Invalid target type' })
    }

    res.json({
      message: 'Custom notification sent successfully',
      result
    })
  } catch (error) {
    console.error('Send custom notification error:', error)
    res.status(500).json({ error: 'Failed to send notification' })
  }
}

/**
 * Obtener estadísticas de OneSignal (si es necesario)
 * GET /api/notifications/stats
 */
export async function getNotificationStats(req, res) {
  try {
    // Aquí podrías implementar lógica para obtener estadísticas
    // de notificaciones enviadas, entregas, clicks, etc.
    // Por ahora devolvemos un placeholder

    res.json({
      message: 'Stats endpoint (to be implemented)',
      stats: {
        // Placeholder
      }
    })
  } catch (error) {
    console.error('Get notification stats error:', error)
    res.status(500).json({ error: 'Failed to get stats' })
  }
}
