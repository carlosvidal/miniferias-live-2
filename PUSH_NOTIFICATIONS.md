# 🔔 Web Push Notifications - OneSignal

Documentación completa para configurar e implementar notificaciones push en Miniferias usando OneSignal.

## 📋 Tabla de Contenido

1. [Configuración Inicial](#configuración-inicial)
2. [Configuración del Frontend](#configuración-del-frontend)
3. [Configuración del Backend](#configuración-del-backend)
4. [Uso en el Frontend](#uso-en-el-frontend)
5. [API Endpoints](#api-endpoints)
6. [Casos de Uso](#casos-de-uso)
7. [Testing](#testing)

---

## 🚀 Configuración Inicial

### 1. Crear cuenta en OneSignal

1. Visita [https://onesignal.com](https://onesignal.com) y crea una cuenta gratuita
2. Crea una nueva aplicación de tipo **Web Push**
3. Sigue el wizard de configuración:
   - **Site Name**: Miniferias
   - **Site URL**: Tu URL de producción (ej: https://miniferias.pe)
   - **Auto Resubscribe**: Habilitado (recomendado)
   - **Default Notification Icon**: Logo de Miniferias

### 2. Obtener credenciales

Después de crear la app, obtendrás:

- **App ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **REST API Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (Settings → Keys & IDs)

---

## ⚙️ Configuración del Frontend

### 1. Variables de entorno

Agrega a tu `.env` (frontend):

```env
VITE_ONESIGNAL_APP_ID=tu-app-id-de-onesignal
```

### 2. Archivos creados

La integración ya está lista en:

- `/frontend/src/plugins/onesignal.js` - Plugin de inicialización
- `/frontend/src/composables/useNotifications.js` - Composable para usar en componentes
- `/frontend/src/views/events/EventDetailView.vue` - Implementación en vista de eventos

### 3. Estructura del plugin

```javascript
// El plugin se inicializa automáticamente en main.js
import oneSignalPlugin from './plugins/onesignal'
app.use(oneSignalPlugin)
```

---

## 🔧 Configuración del Backend

### 1. Instalación

```bash
cd backend
npm install @onesignal/node-onesignal
```

### 2. Variables de entorno

Agrega a tu `.env` (backend):

```env
ONESIGNAL_APP_ID=tu-app-id-de-onesignal
ONESIGNAL_API_KEY=tu-rest-api-key-de-onesignal
```

### 3. Migración de base de datos

Ejecuta la migración para crear la tabla `PushSubscription`:

```bash
cd backend
npx prisma migrate dev --name add_push_subscriptions
```

O si prefieres solo sincronizar sin migración:

```bash
npx prisma db push
```

### 4. Archivos creados

- `/backend/src/services/onesignal.service.js` - Servicio para enviar notificaciones
- `/backend/src/controllers/notifications.controller.js` - Controlador de endpoints
- `/backend/src/routes/notifications.routes.js` - Rutas de la API

---

## 💻 Uso en el Frontend

### Composable `useNotifications()`

```javascript
import { useNotifications } from '@/composables/useNotifications'

const notifications = useNotifications()

// Inicializar
await notifications.initialize()

// Verificar soporte
if (notifications.isSupported.value) {
  // El navegador soporta notificaciones
}

// Suscribir usuario
const result = await notifications.subscribe()
if (result.success) {
  console.log('Player ID:', result.playerId)
}

// Suscribir a un evento específico
await notifications.subscribeToEvent(eventId)

// Verificar si está suscrito a un evento
const isSubscribed = await notifications.isSubscribedToEvent(eventId)

// Desuscribirse de un evento
await notifications.unsubscribeFromEvent(eventId)

// Agregar tags personalizados
await notifications.addTag('preferencia', 'tecnologia')
await notifications.addTags({ ciudad: 'Lima', edad: '25-35' })

// Vincular con usuario de la BD (opcional)
await notifications.setExternalUserId(userId)
```

### Estados disponibles

```javascript
notifications.isSupported        // Boolean: Navegador soporta push
notifications.isSubscribed       // Boolean: Usuario suscrito
notifications.notificationPermission  // 'default' | 'granted' | 'denied'
notifications.playerId           // String: OneSignal Player ID
```

---

## 🌐 API Endpoints

### Autenticación

Todos los endpoints requieren autenticación de **Admin** (`Authorization: Bearer <token>`).

### 1. Enviar notificación de prueba

```http
POST /api/notifications/test/event/:eventId
Content-Type: application/json

{
  "title": "Título de prueba",
  "message": "Mensaje de prueba"
}
```

### 2. Notificación de evento próximo a empezar

```http
POST /api/notifications/event/:eventId/starting-soon
Content-Type: application/json

{
  "minutesBefore": "60"  // "60", "1h", "24h"
}
```

### 3. Notificación de evento en vivo

```http
POST /api/notifications/event/:eventId/live
```

### 4. Notificación de nuevo booth

```http
POST /api/notifications/event/:eventId/new-booth
Content-Type: application/json

{
  "boothId": "booth-uuid"
}
```

### 5. Notificación personalizada

```http
POST /api/notifications/custom
Content-Type: application/json

{
  "target": {
    "type": "event",           // "event" | "playerIds" | "externalUserIds" | "all"
    "eventId": "event-uuid"    // Requerido si type = "event"
  },
  "title": "Título personalizado",
  "message": "Mensaje personalizado",
  "url": "https://miniferias.pe/events/slug",
  "data": {
    "custom": "data"
  }
}
```

### Ejemplo con cURL

```bash
# Enviar notificación de evento en vivo
curl -X POST http://localhost:3000/api/notifications/event/123/live \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📖 Casos de Uso

### 1. Usuario visita página de evento

**Flujo automático:**

1. Usuario llega a `/events/evento-slug`
2. Se verifica si está suscrito al evento
3. Si no está suscrito y el navegador soporta push, se muestra banner promocional
4. Usuario hace click en "Activar Notificaciones"
5. Se solicita permiso del navegador
6. Si acepta, se suscribe con tag `event_{eventId}=true`
7. Se muestra confirmación

**Código en EventDetailView.vue:**

```javascript
// Al montar el componente
onMounted(async () => {
  event.value = await eventsStore.fetchEventBySlug(route.params.slug)

  if (event.value) {
    await checkPushSubscription()
  }
})

// La función checkPushSubscription verifica si está suscrito
// y muestra el banner promocional si no lo está
```

### 2. Usuario cierra el prompt por error

**Solución implementada:**

- Si el usuario cierra el banner promocional, puede volver a suscribirse usando el botón en la tarjeta de "Notificaciones Push"
- La tarjeta siempre está visible en la sección de calendario/recordatorios
- Si ya está suscrito, muestra un checkmark verde

### 3. Administrador programa notificación

**Desde el backend:**

```javascript
// En el controlador de eventos, cuando se marca como LIVE
import oneSignalService from '../services/onesignal.service.js'

// Cuando evento va en vivo
await oneSignalService.sendEventLive(event)

// 24 horas antes del evento (usar cron job)
await oneSignalService.sendEventStartingSoon(event, '24h')

// 1 hora antes
await oneSignalService.sendEventStartingSoon(event, '1h')
```

### 4. Notificaciones automáticas con Cron

**Recomendación:** Usar un cron job para enviar notificaciones programadas.

Ejemplo con `node-cron`:

```javascript
import cron from 'node-cron'
import prisma from './config/prisma.js'
import oneSignalService from './services/onesignal.service.js'

// Cada hora, verificar eventos que empiezan pronto
cron.schedule('0 * * * *', async () => {
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  const upcomingEvents = await prisma.event.findMany({
    where: {
      startDate: {
        gte: now,
        lte: oneHourFromNow
      },
      status: 'SCHEDULED'
    }
  })

  for (const event of upcomingEvents) {
    await oneSignalService.sendEventStartingSoon(event, '1h')
  }
})
```

---

## 🧪 Testing

### 1. Desarrollo local

OneSignal requiere HTTPS en producción, pero permite `localhost` para desarrollo:

```javascript
// En el plugin de OneSignal
await OneSignal.init({
  appId: appId,
  allowLocalhostAsSecureOrigin: true  // ✅ Permite localhost
})
```

### 2. Testing de suscripción

1. Inicia el frontend: `npm run dev`
2. Navega a un evento: `http://localhost:5173/events/evento-slug`
3. Acepta el permiso de notificaciones del navegador
4. Verifica que se muestre "✓ Activado" en la tarjeta de notificaciones

### 3. Testing de envío desde backend

```bash
# 1. Obtén tu JWT token de admin
TOKEN="tu-jwt-token"

# 2. Obtén el ID de un evento
EVENT_ID="event-uuid"

# 3. Envía notificación de prueba
curl -X POST http://localhost:3000/api/notifications/test/event/$EVENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "message": "Hola desde API"}'
```

### 4. Verificar en OneSignal Dashboard

1. Ve a [https://dashboard.onesignal.com](https://dashboard.onesignal.com)
2. Selecciona tu app
3. Ve a **Delivery** → **Messages** para ver notificaciones enviadas
4. Ve a **Audience** → **All Users** para ver suscriptores

---

## 🎯 Sistema de Tags

Las notificaciones usan **tags** para segmentar usuarios:

### Tags por evento

```javascript
// Formato: event_{eventId} = "true"
event_123abc = "true"
event_456def = "true"
```

### Tags personalizados (opcional)

```javascript
// Ejemplo: segmentar por preferencias
preferencia = "tecnologia"
ciudad = "Lima"
notificaciones_booth = "true"
```

---

## 📊 Modelo de datos (Prisma)

```prisma
model PushSubscription {
  id              String   @id @default(uuid())
  playerId        String   @unique        // OneSignal Player ID
  eventId         String
  event           Event    @relation(...)
  userId          String?                 // Opcional
  user            User?    @relation(...)
  isActive        Boolean  @default(true)
  userAgent       String?
  ipAddress       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([playerId, eventId])
}
```

**Nota:** Este modelo es opcional. OneSignal ya maneja las suscripciones, pero esto te permite tener un registro propio en tu BD.

---

## 🔐 Seguridad

### 1. Permisos del navegador

- El usuario debe dar permiso explícito para recibir notificaciones
- Si bloquea el permiso, la app maneja el error gracefully
- El permiso se puede resetear en la configuración del navegador

### 2. Autenticación de endpoints

- Todos los endpoints de envío requieren autenticación de Admin
- El REST API Key nunca se expone al frontend
- Solo el App ID es público (seguro)

### 3. Rate limiting

Los endpoints de notificaciones están protegidos por rate limiting general de Express (100 req/15min por IP).

---

## 📈 Mejoras futuras

### 1. Tracking de estadísticas

Implementar endpoint para obtener stats:

```javascript
// GET /api/notifications/stats
{
  totalSent: 1234,
  totalDelivered: 1100,
  totalClicked: 450,
  clickRate: 0.36
}
```

### 2. Notificaciones programadas

Usar OneSignal scheduled notifications:

```javascript
notificationPayload.send_after = "2024-01-15 10:00:00 GMT-0500"
```

### 3. Imágenes en notificaciones

```javascript
notificationPayload.big_picture = "https://..."
notificationPayload.chrome_web_image = "https://..."
```

### 4. Botones de acción

```javascript
notificationPayload.buttons = [
  { id: "ver", text: "Ver Evento" },
  { id: "recordar", text: "Recordarme después" }
]
```

---

## 🐛 Troubleshooting

### Notificaciones no llegan

1. Verificar que OneSignal esté configurado correctamente
2. Verificar permisos del navegador (no bloqueado)
3. Verificar que el usuario esté suscrito al evento
4. Verificar logs del backend

### Error "OneSignal not configured"

- Verificar que `ONESIGNAL_APP_ID` y `ONESIGNAL_API_KEY` estén en `.env`
- Reiniciar el servidor backend

### Banner no aparece

- Verificar que el navegador soporte notificaciones
- Verificar que no esté ya suscrito
- Verificar que el permiso no esté en "denied"

---

## 📚 Recursos

- [OneSignal Documentation](https://documentation.onesignal.com/docs)
- [OneSignal Web SDK Reference](https://documentation.onesignal.com/docs/web-push-sdk)
- [OneSignal REST API](https://documentation.onesignal.com/reference/create-notification)
- [OneSignal Dashboard](https://dashboard.onesignal.com)

---

## ✅ Checklist de implementación

- [x] Configurar cuenta de OneSignal
- [x] Instalar SDKs (frontend y backend)
- [x] Configurar variables de entorno
- [x] Implementar composable `useNotifications`
- [x] Agregar UI en EventDetailView
- [x] Crear servicio de backend
- [x] Crear endpoints de API
- [x] Crear modelo de BD (opcional)
- [ ] Ejecutar migración de Prisma
- [ ] Testing en desarrollo
- [ ] Configurar dominio en OneSignal (producción)
- [ ] Testing en producción
- [ ] Implementar cron jobs (opcional)

---

¡Listo para recibir notificaciones push! 🎉
