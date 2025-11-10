# PRD: Miniferias Live Shopping Experience - MVP

## 📋 Documento de Requisitos del Producto

**Versión:** 1.0
**Fecha:** 2025-11-10
**Tipo:** MVP - Producto Mínimo Viable
**Autor:** Claude Code

---

## 🎯 Visión del Producto

Plataforma web mobile-first que permite a expositores vender productos mediante live streaming durante eventos virtuales, con chat en tiempo real y sistema de pedidos simplificado integrado con métodos de pago locales peruanos (Yape/Plin).

### Propuesta de Valor

**Para Expositores:**
- Vender productos en vivo con alcance nacional
- Interacción directa con compradores vía chat
- Gestión simple de catálogo y pedidos
- Aceptación de pagos locales (Yape/Plin)

**Para Visitantes:**
- Experiencia de compra interactiva y entretenida
- Explorar múltiples booths en un solo lugar
- Comunicación directa con vendedores
- Proceso de compra simplificado

**Para Organizadores:**
- Gestión centralizada de eventos y expositores
- Monitoreo de actividad en tiempo real
- Moderación de contenido

---

## 👥 Roles y Permisos

### 1. Super Admin (Organizador)
**Capacidades:**
- Crear y gestionar eventos (CRUD)
- Crear y gestionar booths virtuales (CRUD)
- Asignar expositores a eventos
- Ver todos los chats de todos los booths
- Moderar contenido (eliminar comentarios)
- Ver dashboard con métricas globales

### 2. Expositor (Booth Owner)
**Capacidades:**
- Gestionar perfil (nombre, descripción, logo, QR de Yape/Plin)
- Crear y gestionar productos en catálogo (CRUD)
- Iniciar/detener live stream durante eventos asignados
- Ver y responder comentarios en tiempo real
- Ver pedidos recibidos
- Actualizar estado de pedidos

### 3. Visitante (Comprador)
**Capacidades:**
- Navegar eventos activos
- Explorar booths (live stream + catálogo)
- Ver productos y detalles
- Hacer comentarios en tiempo real
- Crear pedidos simples
- Guardar datos de envío y contacto para reutilizar
- Ver historial de pedidos propios

---

## 🏗️ Arquitectura del Sistema

### Opción Recomendada: Stack Híbrido

**Frontend:**
- Vue 3 (Composition API)
- Vite
- Pinia (state management)
- Tailwind CSS (mobile-first)
- Agora SDK (live streaming)
- Deploy: Netlify

**Backend:**
- Node.js + Express
- Prisma ORM
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- Deploy: Render.com

### ¿Por qué este stack?

#### ✅ Ventajas sobre Firebase
1. **Queries SQL complejas**: Reportes, filtros, búsquedas
2. **Costos predecibles**: ~$25-50/mes vs Firebase que escala impredeciblemente
3. **Type safety**: Prisma genera tipos automáticos
4. **Flexibilidad**: Control total del backend
5. **No vendor lock-in**: Postgres es estándar, fácil migración

#### ✅ Mejor para el MVP
1. **Pedidos complejos**: Relaciones entre órdenes, productos, usuarios
2. **Reportes**: Ventas por booth, productos más vendidos, etc.
3. **Escalabilidad**: Fácil optimizar queries SQL
4. **Testing**: Más fácil testear lógica de negocio

---

## 📊 Schema de Base de Datos

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  ADMIN
  EXHIBITOR
  VISITOR
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum EventStatus {
  DRAFT
  SCHEDULED
  LIVE
  ENDED
}

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  name              String
  phone             String?
  role              UserRole  @default(VISITOR)
  profilePicture    String?

  // Visitor data
  shippingAddress   Json?     // Reutilizable

  // Exhibitor data
  booth             Booth?

  orders            Order[]
  messages          Message[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([email])
}

model Event {
  id              String      @id @default(uuid())
  name            String
  slug            String      @unique
  description     String      @db.Text
  coverImage      String?
  startDate       DateTime
  endDate         DateTime
  status          EventStatus @default(DRAFT)
  isLive          Boolean     @default(false)

  booths          Booth[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([slug])
  @@index([startDate, endDate])
  @@index([status])
}

model Booth {
  id              String    @id @default(uuid())
  name            String
  description     String    @db.Text
  logo            String?
  coverPhoto      String?

  // Payment info (Peru)
  yapeNumber      String?
  yapeQR          String?   // URL to QR image
  plinNumber      String?
  plinQR          String?   // URL to QR image

  // Agora streaming
  isStreaming     Boolean   @default(false)
  streamStarted   DateTime?

  // Relations
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  eventId         String
  event           Event     @relation(fields: [eventId], references: [id])

  products        Product[]
  orders          Order[]
  messages        Message[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([eventId])
  @@index([userId])
}

model Product {
  id              String    @id @default(uuid())
  name            String
  description     String    @db.Text
  price           Decimal   @db.Decimal(10, 2)
  stock           Int       @default(0)
  images          String[]  // Array of image URLs
  category        String?
  isActive        Boolean   @default(true)

  boothId         String
  booth           Booth     @relation(fields: [boothId], references: [id], onDelete: Cascade)

  orderItems      OrderItem[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([boothId])
  @@index([category])
  @@index([isActive])
}

model Order {
  id              String      @id @default(uuid())
  orderNumber     String      @unique // ORD-2025-XXXXX

  // Customer info
  userId          String
  user            User        @relation(fields: [userId], references: [id])

  // Booth info
  boothId         String
  booth           Booth       @relation(fields: [boothId], references: [id])

  // Shipping info
  shippingAddress Json        // { name, phone, address, city, district, reference }

  // Order details
  items           OrderItem[]
  subtotal        Decimal     @db.Decimal(10, 2)
  shipping        Decimal     @db.Decimal(10, 2) @default(0)
  total           Decimal     @db.Decimal(10, 2)

  // Payment info
  paymentMethod   String      // 'yape' | 'plin' | 'other'
  paymentProof    String?     // URL to uploaded payment screenshot

  // Status
  status          OrderStatus @default(PENDING)
  notes           String?     @db.Text

  // Timestamps
  createdAt       DateTime    @default(now())
  confirmedAt     DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?

  @@index([userId])
  @@index([boothId])
  @@index([status])
  @@index([createdAt])
}

model OrderItem {
  id          String    @id @default(uuid())

  orderId     String
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId   String
  product     Product   @relation(fields: [productId], references: [id])

  quantity    Int
  unitPrice   Decimal   @db.Decimal(10, 2)
  subtotal    Decimal   @db.Decimal(10, 2)

  // Snapshot of product at time of order
  productName String
  productImage String?

  @@index([orderId])
  @@index([productId])
}

model Message {
  id          String    @id @default(uuid())

  userId      String
  user        User      @relation(fields: [userId], references: [id])

  boothId     String
  booth       Booth     @relation(fields: [boothId], references: [id], onDelete: Cascade)

  content     String    @db.Text
  isDeleted   Boolean   @default(false)

  createdAt   DateTime  @default(now())

  @@index([boothId, createdAt])
  @@index([userId])
}
```

---

## 🎨 User Stories & Features

### Epic 1: Gestión de Eventos (Admin)

#### US1.1: Crear Evento
**Como** super admin
**Quiero** crear un nuevo evento
**Para** organizar una feria virtual

**Criterios de Aceptación:**
- [ ] Formulario con campos: nombre, descripción, fecha inicio/fin, imagen cover
- [ ] Generación automática de slug URL-friendly
- [ ] Validación de fechas (fin > inicio)
- [ ] Upload de imagen cover con preview
- [ ] Estado inicial: DRAFT

**UI Mobile-First:**
- Formulario vertical con campos apilados
- Date picker nativo móvil
- Upload de imagen con botón grande (mín 48px)
- Preview de imagen responsive

#### US1.2: Asignar Expositores a Evento
**Como** super admin
**Quiero** asignar booths a un evento
**Para** definir quiénes participarán

**Criterios de Aceptación:**
- [ ] Lista de booths disponibles (no asignados a otros eventos activos)
- [ ] Búsqueda de booths por nombre
- [ ] Selección múltiple con checkboxes
- [ ] Confirmación visual de asignación
- [ ] Notificación al expositor (email/in-app)

#### US1.3: Ver Dashboard de Evento
**Como** super admin
**Quiero** ver métricas del evento
**Para** monitorear su desempeño

**Criterios de Aceptación:**
- [ ] Total de visitantes únicos
- [ ] Total de pedidos generados
- [ ] Total de ventas (suma)
- [ ] Booths más visitados
- [ ] Gráfico de actividad en tiempo real

---

### Epic 2: Gestión de Booth (Expositor)

#### US2.1: Configurar Perfil de Booth
**Como** expositor
**Quiero** configurar mi booth
**Para** presentar mi negocio profesionalmente

**Criterios de Aceptación:**
- [ ] Campos: nombre, descripción, logo, cover photo
- [ ] Campos de pago: número Yape, QR Yape, número Plin, QR Plin
- [ ] Upload de imágenes con compresión automática
- [ ] Preview del booth antes de guardar
- [ ] Validación de número de teléfono peruano (9 dígitos)

**UI Mobile-First:**
- Formulario con secciones colapsables
- Upload de QR con crop cuadrado
- Preview de cómo se verá en móvil

#### US2.2: Gestionar Catálogo de Productos
**Como** expositor
**Quiero** crear y editar productos
**Para** mostrar lo que vendo

**Criterios de Aceptación:**
- [ ] CRUD completo de productos
- [ ] Campos: nombre, descripción, precio, stock, imágenes (múltiples), categoría
- [ ] Drag & drop para ordenar imágenes
- [ ] Toggle para activar/desactivar producto
- [ ] Vista previa del producto

**UI Mobile-First:**
- Lista de productos en cards
- Botón FAB para agregar producto
- Swipe actions para editar/eliminar
- Gallery slider para múltiples imágenes

#### US2.3: Iniciar Live Stream
**Como** expositor
**Quiero** iniciar un live stream
**Para** vender mis productos en vivo

**Criterios de Aceptación:**
- [ ] Botón "Go Live" visible solo durante evento activo
- [ ] Pre-check de permisos de cámara y micrófono
- [ ] Configuración de calidad de video (auto/HD/SD)
- [ ] Contador de viewers en tiempo real
- [ ] Botones: mute, camera on/off, switch camera, end stream
- [ ] Confirmación antes de terminar stream

**Integración Agora:**
```javascript
// Expositor = host/broadcaster
agoraClient.setClientRole('host');
await agoraClient.join(appId, channelName, token, uid);

// Publicar video y audio
const localVideo = await AgoraRTC.createCameraVideoTrack();
const localAudio = await AgoraRTC.createMicrophoneAudioTrack();
await agoraClient.publish([localVideo, localAudio]);
```

#### US2.4: Ver y Gestionar Pedidos
**Como** expositor
**Quiero** ver los pedidos recibidos
**Para** procesarlos y enviarlos

**Criterios de Aceptación:**
- [ ] Lista de pedidos con filtros (pending, confirmed, shipped, delivered)
- [ ] Detalle de pedido: productos, cantidades, total, dirección, contacto
- [ ] Ver comprobante de pago (si fue subido)
- [ ] Botones para cambiar estado: confirmar, marcar enviado, marcar entregado
- [ ] Agregar notas al pedido
- [ ] Notificación al cliente cuando cambia estado

**UI Mobile-First:**
- Lista de pedidos en cards con badges de estado
- Swipe para acciones rápidas
- Bottom sheet para ver detalles
- Botones grandes para cambiar estado

---

### Epic 3: Experiencia del Visitante

#### US3.1: Explorar Eventos Activos
**Como** visitante
**Quiero** ver eventos disponibles
**Para** elegir dónde navegar

**Criterios de Aceptación:**
- [ ] Grid de eventos con imagen, nombre, fechas
- [ ] Badge "LIVE" en eventos que tienen streams activos
- [ ] Filtros: próximos, en vivo, finalizados
- [ ] Búsqueda por nombre
- [ ] Click lleva a página del evento

**UI Mobile-First:**
- Grid de 1 columna en móvil, 2-3 en tablet/desktop
- Cards grandes con imagen destacada
- Badge "LIVE" animado y visible

#### US3.2: Navegar Booths en Evento
**Como** visitante
**Quiero** recorrer los booths del evento
**Para** ver qué se vende

**Criterios de Aceptación:**
- [ ] Lista horizontal de booths (carrusel)
- [ ] Badge "LIVE" en booths con stream activo
- [ ] Preview de productos destacados
- [ ] Contador de personas viendo (si hay stream)
- [ ] Click en booth abre vista completa

**UI Mobile-First:**
- Carrusel horizontal con scroll touch
- Cards de booth con imagen cover
- Skeleton loaders mientras carga

#### US3.3: Ver Live Stream y Productos
**Como** visitante
**Quiero** ver el stream y productos simultáneamente
**Para** comprar mientras miro

**Criterios de Aceptación:**
- [ ] Layout: video arriba, productos abajo (en móvil)
- [ ] Tabs: "Stream" | "Productos" | "Info" (en móvil)
- [ ] Chat lateral (en desktop) o sticky bottom (en móvil)
- [ ] Grid de productos con imagen, nombre, precio
- [ ] Botón "Agregar al pedido" en cada producto
- [ ] Badge de cantidad en botón de pedido

**Layout Mobile:**
```
┌─────────────────┐
│   Live Video    │ 16:9
├─────────────────┤
│   Chat Input    │ sticky bottom
├─────────────────┤
│   Tabs          │
│  [Stream | Productos | Info]
├─────────────────┤
│                 │
│   Tab Content   │
│                 │
└─────────────────┘
```

**Integración Agora:**
```javascript
// Visitante = audience
agoraClient.setClientRole('audience');
await agoraClient.join(appId, channelName, token, uid);

// Subscribe to remote stream
agoraClient.on('user-published', async (user, mediaType) => {
  await agoraClient.subscribe(user, mediaType);
  if (mediaType === 'video') {
    const remoteTrack = user.videoTrack;
    remoteTrack.play('video-container');
  }
});
```

#### US3.4: Hacer Comentarios en Tiempo Real
**Como** visitante
**Quiero** comentar durante el stream
**Para** interactuar con el expositor

**Criterios de Aceptación:**
- [ ] Input siempre visible (sticky bottom)
- [ ] Lista de mensajes con auto-scroll
- [ ] Mostrar nombre del usuario y hora relativa
- [ ] Limite de 500 caracteres por mensaje
- [ ] Rate limiting: máx 5 mensajes por minuto
- [ ] Emoji picker (opcional para MVP)

**Realtime con Supabase:**
```javascript
// Subscribe to new messages
supabase
  .channel(`booth:${boothId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'Message',
    filter: `boothId=eq.${boothId}`
  }, (payload) => {
    appendMessage(payload.new);
  })
  .subscribe();
```

#### US3.5: Crear Pedido Simple
**Como** visitante
**Quiero** hacer un pedido
**Para** comprar productos

**Criterios de Aceptación:**
- [ ] Vista de resumen con productos agregados
- [ ] Editar cantidades o eliminar items
- [ ] Formulario de envío: nombre, teléfono, dirección completa (calle, ciudad, distrito, referencia)
- [ ] Checkbox "Guardar datos para futuros pedidos"
- [ ] Mostrar QR de Yape/Plin del expositor
- [ ] Botón para subir comprobante de pago (opcional)
- [ ] Confirmación: "Pedido enviado al vendedor"
- [ ] Email/SMS de confirmación

**Flujo:**
1. Visitante agrega productos al pedido
2. Click en "Hacer pedido"
3. Formulario con datos de envío (pre-llenado si existe)
4. Mostrar total + opciones de pago (Yape/Plin QRs)
5. Campo para subir comprobante (opcional)
6. "Confirmar pedido"
7. Pedido creado con estado PENDING
8. Notificación al expositor

**UI Mobile-First:**
- Bottom sheet para carrito
- Formulario con validación inline
- Botones grandes para confirmar
- Gallery para subir comprobante

---

## 🎨 Wireframes Conceptuales

### Mobile Views

```
┌─────────────────┐
│    [HEADER]     │
│  ☰  Logo  🛒    │
├─────────────────┤
│  Eventos Live   │
│ ┌─────────────┐ │
│ │  LIVE 🔴    │ │
│ │  Evento 1   │ │
│ │  [imagen]   │ │
│ │  10 booths  │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │  Próximo    │ │
│ │  Evento 2   │ │
│ └─────────────┘ │
└─────────────────┘

┌─────────────────┐
│  Evento: Feria X│
├─────────────────┤
│ <Booths Scroll> │
│ ┌───┬───┬───┐   │
│ │🔴1│ 2 │ 3 │→  │
│ └───┴───┴───┘   │
├─────────────────┤
│ Booth: "Tienda" │
│ ┌─────────────┐ │
│ │             │ │
│ │   [VIDEO]   │ │
│ │             │ │
│ └─────────────┘ │
│ 👥 125 viendo   │
├─────────────────┤
│ [Chat]  💬      │
│ Juan: Hola!     │
│ María: Precio?  │
├─────────────────┤
│ [Comentar...]   │
└─────────────────┘

┌─────────────────┐
│ ← Booth Productos
├─────────────────┤
│ ┌────┬────────┐ │
│ │img │Prod 1  │ │
│ │    │S/50    │ │
│ │    │[Agregar│ │
│ └────┴────────┘ │
│ ┌────┬────────┐ │
│ │img │Prod 2  │ │
│ │    │S/35    │ │
│ └────┴────────┘ │
├─────────────────┤
│ Mi Pedido (3) 💰│
└─────────────────┘
```

---

## 🔧 Stack Técnico Detallado

### Frontend (Vue 3)

```javascript
// Project Structure
src/
├── assets/
├── components/
│   ├── admin/
│   │   ├── EventForm.vue
│   │   ├── BoothManager.vue
│   │   └── Dashboard.vue
│   ├── booth/
│   │   ├── BoothSetup.vue
│   │   ├── ProductForm.vue
│   │   ├── LiveControls.vue
│   │   └── OrderList.vue
│   ├── visitor/
│   │   ├── EventGrid.vue
│   │   ├── BoothCarousel.vue
│   │   ├── LiveView.vue
│   │   ├── ProductGrid.vue
│   │   ├── ChatBox.vue
│   │   └── OrderForm.vue
│   └── shared/
│       ├── ImageUpload.vue
│       ├── VideoPlayer.vue
│       └── QRDisplay.vue
├── composables/
│   ├── useAgora.js
│   ├── useSupabaseRealtime.js
│   └── useAuth.js
├── stores/
│   ├── auth.js
│   ├── events.js
│   ├── booths.js
│   ├── products.js
│   ├── orders.js
│   └── chat.js
├── views/
├── router/
└── services/
    ├── api.js
    ├── agora.js
    └── supabase.js
```

**Dependencias principales:**
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.0.0",
    "pinia": "^2.1.0",
    "@vueuse/core": "^10.0.0",
    "agora-rtc-sdk-ng": "^4.20.0",
    "@supabase/supabase-js": "^2.39.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.4.0",
    "vee-validate": "^4.12.0",
    "yup": "^1.3.0"
  }
}
```

### Backend (Express + Prisma)

```javascript
// Project Structure
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── events.controller.js
│   │   ├── booths.controller.js
│   │   ├── products.controller.js
│   │   └── orders.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── events.routes.js
│   │   ├── booths.routes.js
│   │   ├── products.routes.js
│   │   └── orders.routes.js
│   ├── services/
│   │   ├── agora.service.js      // Generate tokens
│   │   ├── email.service.js
│   │   ├── storage.service.js
│   │   └── notification.service.js
│   ├── utils/
│   │   ├── validators.js
│   │   └── helpers.js
│   └── app.js
├── tests/
├── .env.example
└── package.json
```

**Dependencias principales:**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "@prisma/client": "^5.8.0",
    "@supabase/supabase-js": "^2.39.0",
    "agora-access-token": "^2.0.4",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "joi": "^17.11.0",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "prisma": "^5.8.0",
    "nodemon": "^3.0.0"
  }
}
```

### Agora Configuration

```javascript
// services/agora.service.js
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export function generateAgoraToken(channelName, uid, role) {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const agoraRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    agoraRole,
    privilegeExpiredTs
  );
}
```

---

## 📱 Diseño Mobile-First

### Principios de Diseño

1. **Touch targets mínimo 48x48px**
2. **Textos legibles sin zoom (16px mínimo)**
3. **Navegación con pulgares (bottom nav)**
4. **Scroll vertical infinito**
5. **Forms con input types nativos**
6. **Imágenes optimizadas (WebP, lazy loading)**
7. **Offline-first donde sea posible**

### Breakpoints
```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Performance
- **Core Web Vitals**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- **Bundle size** < 200KB gzipped
- **Images**: WebP con fallback, lazy loading
- **Code splitting** por rutas
- **Prefetch** de rutas críticas

---

## 🚀 Plan de Implementación

### Fase 1: Fundamentos (2 semanas)

#### Sprint 1 (Semana 1)
**Backend Setup**
- [ ] Setup proyecto Express + Prisma
- [ ] Configurar Supabase (DB + Auth + Storage)
- [ ] Definir y ejecutar schema de Prisma
- [ ] Setup Render.com deployment
- [ ] Implementar autenticación (JWT + Supabase Auth)
- [ ] Endpoints básicos de usuarios

**Frontend Setup**
- [ ] Setup proyecto Vue 3 + Vite
- [ ] Configurar Tailwind CSS
- [ ] Setup Pinia stores
- [ ] Implementar router con guards
- [ ] Layouts base (Admin, Exhibitor, Visitor)
- [ ] Configurar Netlify deployment

**Estimación:** 40 horas

#### Sprint 2 (Semana 2)
**Gestión de Eventos (Admin)**
- [ ] API: CRUD de eventos
- [ ] Frontend: EventForm component
- [ ] Frontend: EventList component
- [ ] Frontend: Event dashboard
- [ ] Upload de imágenes a Supabase Storage
- [ ] Generación de slugs

**Gestión de Booths (Admin)**
- [ ] API: CRUD de booths
- [ ] Frontend: BoothForm component
- [ ] Frontend: Asignación de booths a eventos
- [ ] Frontend: Lista de booths

**Estimación:** 40 horas

---

### Fase 2: Catálogo y Perfil (2 semanas)

#### Sprint 3 (Semana 3)
**Perfil de Expositor**
- [ ] API: Update de perfil de booth
- [ ] Frontend: BoothSetup component
- [ ] Upload de logo y cover photo
- [ ] Configuración de Yape/Plin (números + QRs)
- [ ] Preview del booth

**Catálogo de Productos**
- [ ] API: CRUD de productos
- [ ] Frontend: ProductForm component (múltiples imágenes)
- [ ] Frontend: ProductList component
- [ ] Drag & drop para ordenar imágenes
- [ ] Toggle activar/desactivar producto

**Estimación:** 40 horas

#### Sprint 4 (Semana 4)
**Vista de Visitante - Explorar**
- [ ] Frontend: EventGrid component (home)
- [ ] Frontend: EventDetailPage
- [ ] Frontend: BoothCarousel component
- [ ] Frontend: ProductGrid component
- [ ] Badges "LIVE" (mock por ahora)
- [ ] Navegación smooth entre vistas

**Estimación:** 40 horas

---

### Fase 3: Live Streaming (2 semanas)

#### Sprint 5 (Semana 5)
**Configuración de Agora**
- [ ] Obtener App ID y Certificate de Agora
- [ ] Backend: Servicio para generar tokens
- [ ] Frontend: Composable `useAgora.js`
- [ ] API endpoint: POST /api/stream/token
- [ ] Testing de conexión básica

**Expositor - Iniciar Stream**
- [ ] Frontend: LiveControls component
- [ ] Check de permisos de cámara/micro
- [ ] Botón "Go Live"
- [ ] Publicar video + audio local
- [ ] Controles: mute, camera, switch, end
- [ ] Actualizar estado `isStreaming` en DB

**Estimación:** 40 horas

#### Sprint 6 (Semana 6)
**Visitante - Ver Stream**
- [ ] Frontend: LiveView component
- [ ] Subscribe a stream remoto
- [ ] Auto-play de video
- [ ] Contador de viewers (realtime)
- [ ] Detección de stream terminado
- [ ] Fallback cuando no hay stream

**Layout Responsive**
- [ ] Mobile: Stack vertical (video arriba, productos abajo)
- [ ] Desktop: Video izquierda, chat derecha, productos abajo
- [ ] Tabs en móvil (Stream | Productos | Info)

**Estimación:** 40 horas

---

### Fase 4: Chat y Pedidos (2 semanas)

#### Sprint 7 (Semana 7)
**Chat en Tiempo Real**
- [ ] API: POST /api/messages (crear mensaje)
- [ ] Frontend: ChatBox component
- [ ] Supabase Realtime subscription
- [ ] Auto-scroll a nuevos mensajes
- [ ] Rate limiting (5 msg/min)
- [ ] Mostrar nombre + timestamp relativo
- [ ] Admin: eliminar mensajes

**Estimación:** 40 horas

#### Sprint 8 (Semana 8)
**Sistema de Pedidos**
- [ ] Frontend: Agregar productos a pedido (mini-cart)
- [ ] Frontend: OrderForm component
- [ ] Formulario de envío con validación
- [ ] Guardar datos de envío para reutilizar
- [ ] Mostrar QR de Yape/Plin del booth
- [ ] Upload de comprobante de pago
- [ ] API: POST /api/orders (crear pedido)
- [ ] Confirmación y notificación

**Vista de Expositor**
- [ ] Frontend: OrderList component
- [ ] Filtros por estado
- [ ] Detalle de pedido
- [ ] Cambiar estado de pedido
- [ ] Agregar notas

**Estimación:** 40 horas

---

### Fase 5: Pulido y Testing (1 semana)

#### Sprint 9 (Semana 9)
**Testing y Bug Fixes**
- [ ] Testing de flujos completos
- [ ] Verificar responsive en múltiples dispositivos
- [ ] Testing de performance (Lighthouse)
- [ ] Optimización de imágenes
- [ ] Testing de Agora en diferentes conexiones
- [ ] Testing de realtime chat con múltiples usuarios
- [ ] Bug fixes

**Documentación**
- [ ] README con instrucciones de setup
- [ ] Documentación de API
- [ ] Guías de usuario (Admin, Expositor, Visitante)

**Estimación:** 40 horas

---

## 📊 Estimación Total

**Tiempo total:** 9 semanas (360 horas)
**Equipo:** 1 desarrollador full-time
**O:** 2 desarrolladores part-time (20h/semana c/u) = 4.5 semanas

---

## 💰 Costos Estimados (Mensual)

### Servicios Cloud
- **Supabase Pro:** $25/mes (8GB DB, 100GB storage, 50GB bandwidth)
- **Render.com:** $7-25/mes (Starter/Pro)
- **Netlify:** $0 (Free tier suficiente para MVP)
- **Agora:** $0.99/1000 minutos (10,000 min gratis/mes)
  - Estimado: 50 eventos/mes × 2h = 100h = 6,000 min = $6/mes
- **SendGrid:** $0 (100 emails/día gratis)

**Total:** ~$40-60/mes

### Dominios y SSL
- Dominio: $10-20/año
- SSL: Gratis (Let's Encrypt)

---

## 🎯 Métricas de Éxito del MVP

### Métricas Técnicas
- [ ] 100% de features del MVP implementadas
- [ ] < 3s tiempo de carga (LCP)
- [ ] 99% uptime en primer mes
- [ ] 0 errores críticos en producción
- [ ] Responsive en 100% de dispositivos testeados

### Métricas de Negocio
- [ ] 10+ eventos creados
- [ ] 50+ booths registrados
- [ ] 500+ visitantes únicos
- [ ] 200+ pedidos generados
- [ ] 80%+ satisfacción de expositores (survey)

---

## ⚠️ Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Latencia de Agora en Perú | Media | Alto | Testing con VPN peruana, usar servidor más cercano |
| Costos de Agora superiores | Baja | Medio | Monitorear uso, límite de 2h por stream |
| Ancho de banda de visitantes | Alta | Alto | Ofrecer calidad adaptativa (SD/HD), pre-grabar streams |
| Problemas de pago (Yape/Plin) | Media | Medio | Permitir upload de comprobante, manual verification |
| Baja adopción inicial | Alta | Alto | Marketing, eventos demo, onboarding guiado |

---

## 📄 Anexos

### A. Flujos de Usuario Completos

#### Flujo: Expositor hace su primer stream
1. Admin crea evento y asigna booth al expositor
2. Expositor recibe notificación
3. Expositor configura su perfil (logo, QRs de pago)
4. Expositor agrega productos al catálogo
5. Día del evento: click en "Go Live"
6. Sistema solicita permisos de cámara/micro
7. Vista previa del video
8. Confirmar "Iniciar transmisión"
9. Stream visible para visitantes
10. Chat activo en tiempo real
11. Recibe pedidos durante el stream
12. Termina stream, revisa pedidos

#### Flujo: Visitante compra durante stream
1. Entra a la plataforma (home)
2. Ve grid de eventos, filtra "En vivo"
3. Entra a un evento
4. Ve carrusel de booths, identifica uno con badge "LIVE"
5. Entra al booth
6. Ve el stream, explora productos
7. Agrega 2 productos al pedido
8. Click en "Mi pedido" (bottom badge)
9. Revisa items, edita cantidad
10. Click "Hacer pedido"
11. Completa formulario de envío
12. Ve QR de Yape del expositor
13. Hace transferencia, sube screenshot
14. "Confirmar pedido"
15. Recibe confirmación en pantalla + email
16. Expositor ve el pedido en su panel

### B. Alternativas Consideradas

#### ¿Por qué no Firebase para este MVP?

**Considerado pero descartado por:**
1. **Queries complejas**: Reportes y filtros SQL son más fáciles
2. **Costos**: Con muchos reads/writes, Firebase puede ser más caro
3. **Flexibilidad**: Necesitamos lógica backend custom (Agora tokens, etc.)
4. **Vendor lock-in**: Postgres es estándar, fácil migración futura

**Sin embargo**, Firebase podría ser válido si:
- Quieres setup más rápido (pero menos flexible)
- No te preocupa vendor lock-in
- Prefieres no manejar backend

### C. Roadmap Post-MVP

**Versión 1.1 (1-2 meses post-MVP):**
- [ ] Sistema de notificaciones push
- [ ] Analytics dashboard para expositores
- [ ] Reviews y ratings de productos
- [ ] Múltiples métodos de envío con costos variables
- [ ] Integración con pasarelas de pago (Culqi, Niubiz)

**Versión 1.2 (3-4 meses):**
- [ ] App móvil nativa (React Native)
- [ ] Grabación automática de streams
- [ ] Replay de eventos pasados
- [ ] Sistema de cupones y descuentos
- [ ] Multi-idioma (inglés)

**Versión 2.0 (6+ meses):**
- [ ] Marketplace multi-país
- [ ] Sistema de afiliados
- [ ] Integración con logística (tracking)
- [ ] BI dashboard para admins
- [ ] WhatsApp Business API integration

---

## ✅ Checklist de Inicio

Antes de comenzar el desarrollo, asegúrate de tener:

**Cuentas y Servicios:**
- [ ] Cuenta de Supabase (supabase.com)
- [ ] Cuenta de Render.com (render.com)
- [ ] Cuenta de Netlify (netlify.com)
- [ ] Cuenta de Agora (agora.io) - obtener App ID y Certificate
- [ ] Cuenta de GitHub (para repos)
- [ ] SendGrid API key (opcional para MVP, puede ser después)

**Herramientas Locales:**
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado (para desarrollo local)
- [ ] VS Code o editor preferido
- [ ] Postman o Insomnia (para testing de API)

**Dominio:**
- [ ] Registrar dominio (ej: miniferias.pe)
- [ ] Configurar DNS

---

**¿Listo para comenzar?** 🚀

Este PRD debe ser suficiente para que cualquier desarrollador pueda implementar el MVP completo.
