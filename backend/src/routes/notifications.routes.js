import express from 'express'
import {
  sendTestEventNotification,
  sendEventStartingSoonNotification,
  sendEventLiveNotification,
  sendNewBoothNotification,
  sendCustomNotification,
  getNotificationStats
} from '../controllers/notifications.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/role.middleware.js'

const router = express.Router()

// Todas las rutas requieren autenticación de admin
// Solo administradores pueden enviar notificaciones

// Enviar notificación de prueba
router.post('/test/event/:eventId', authenticate, requireAdmin, sendTestEventNotification)

// Enviar notificación cuando evento está por empezar
router.post('/event/:eventId/starting-soon', authenticate, requireAdmin, sendEventStartingSoonNotification)

// Enviar notificación cuando evento está en vivo
router.post('/event/:eventId/live', authenticate, requireAdmin, sendEventLiveNotification)

// Enviar notificación de nuevo booth
router.post('/event/:eventId/new-booth', authenticate, requireAdmin, sendNewBoothNotification)

// Enviar notificación personalizada
router.post('/custom', authenticate, requireAdmin, sendCustomNotification)

// Obtener estadísticas
router.get('/stats', authenticate, requireAdmin, getNotificationStats)

export default router
