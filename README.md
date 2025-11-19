# Miniferias - Live Shopping Platform

Plataforma web mobile-first que permite a expositores vender productos mediante live streaming durante eventos virtuales, con chat en tiempo real, autenticación social multi-proveedor, notificaciones push y sistema de pedidos simplificado integrado con métodos de pago locales peruanos (Yape/Plin).

**Estado:** MVP Completo | **Líneas de código:** ~8,815 | **Vistas:** 27 | **Rutas API:** 10

## 🎯 Características Principales

### Para Expositores
- 📺 Transmisión en vivo durante eventos (Agora SDK)
- 💬 Chat en tiempo real con compradores (Supabase Realtime)
- 📦 Gestión de catálogo de productos con múltiples imágenes
- 📋 Gestión completa de pedidos con estados
- 💰 Aceptación de pagos locales (Yape/Plin con QR)
- 👥 Sistema multi-usuario (Owner, Operator, Moderator)
- 🖼️ Upload de imágenes optimizado (Cloudflare CDN)

### Para Visitantes
- 🎪 Exploración de eventos virtuales
- 🏪 Navegación de booths con transmisión en vivo
- 🛒 Carrito de compras reactivo
- 📱 Proceso de compra simplificado (con/sin registro)
- 📦 Historial de pedidos
- 🔔 Notificaciones push personalizadas (OneSignal)
- 🔐 Login social (Google, Facebook, TikTok)
- 💬 Chat interactivo durante transmisiones

### Para Administradores
- 🎛️ Gestión completa de eventos y booths
- 📊 Dashboard con métricas en tiempo real
- 👥 Asignación de expositores a eventos
- 🔍 Moderación de contenido y mensajes
- 👤 Gestión de usuarios y roles
- 📧 Sistema de recordatorios por email

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- Node.js 18+ + Express 4.18
- Prisma ORM 5.8 (PostgreSQL)
- JWT + Passport.js (Multi-provider OAuth)
- Agora Token Generation
- Resend (Email service)
- Multer (File upload)
- Helmet + CORS (Security)
- Express Rate Limit

**Frontend:**
- Vue 3.4 (Composition API)
- Vite 5.0 (Build tool)
- Tailwind CSS 3.4 (Mobile-first)
- Pinia 2.1 (State Management)
- Vue Router 4.2 (con guards de autenticación)
- VeeValidate + Yup (Form validation)
- Agora RTC SDK 4.20 (Live Streaming)
- Supabase Realtime (Chat)
- Axios 1.6 (HTTP client)

**Servicios Cloud:**
- Supabase (Database + Realtime + Storage)
- Agora (Live Streaming con SDK oficial)
- OneSignal (Push Notifications)
- Cloudflare Images (CDN optimizado)
- Resend (Servicio de email transaccional)
- OAuth Providers (Google, Facebook, TikTok)
- Render.com (Backend deployment)
- Netlify (Frontend deployment)

## 📂 Estructura del Proyecto

```
miniferias-live-2/
├── backend/                        # API REST con Express + Prisma (~5,472 líneas)
│   ├── src/
│   │   ├── config/                 # Passport strategies (Google, Facebook, TikTok)
│   │   ├── controllers/            # 10 controladores de API
│   │   ├── middleware/             # Auth, roles, validación, upload
│   │   ├── routes/                 # 10 archivos de rutas
│   │   ├── services/               # Agora, email, storage, OneSignal, Cloudflare
│   │   ├── utils/                  # Validadores Joi y helpers
│   │   └── app.js                  # Entry point
│   ├── prisma/
│   │   ├── schema.prisma           # Schema de BD (9 modelos principales)
│   │   ├── migrations/             # Migraciones de BD
│   │   └── seed.js                 # Datos iniciales
│   ├── scripts/                    # Scripts de setup (Linux/Windows)
│   └── package.json
│
├── frontend/                       # App Vue 3 (~3,343 líneas)
│   ├── src/
│   │   ├── assets/                 # CSS y recursos estáticos
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── admin/              # Componentes de admin
│   │   │   ├── booths/             # BoothChat, BoothCard, Cart
│   │   │   ├── events/             # EventCard, etc.
│   │   │   └── shared/             # Navbar, Footer, etc.
│   │   ├── composables/            # useAgora, useNotifications
│   │   ├── plugins/                # OneSignal plugin
│   │   ├── router/                 # Vue Router con guards
│   │   ├── services/               # API client + Supabase
│   │   ├── stores/                 # 6 Pinia stores
│   │   └── views/                  # 27 vistas organizadas
│   │       ├── admin/              # Panel admin (5 vistas)
│   │       ├── auth/               # Login, registro, OAuth (3 vistas)
│   │       ├── booths/             # Detalle de booth
│   │       ├── events/             # Detalle de evento
│   │       ├── exhibitor/          # Panel expositor (7 vistas)
│   │       ├── legal/              # Páginas legales (4 vistas)
│   │       └── orders/             # Checkout y pedidos (4 vistas)
│   └── package.json
│
├── docs/                           # Documentación completa
│   ├── PRD.md                      # Documento de requisitos (1,177 líneas)
│   ├── SOCIAL_LOGIN_SETUP.md       # Guía OAuth (Google, Facebook, TikTok)
│   ├── PUSH_NOTIFICATIONS.md       # Guía OneSignal
│   ├── DATABASE_SETUP.md           # Setup de base de datos
│   └── MIGRATION_*.md              # Guías de migraciones
│
└── README.md                       # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL (o cuenta de Supabase)
- Cuenta de Agora (para live streaming)
- Cuenta de OneSignal (para notificaciones push)
- Cuenta de Cloudflare Images (para CDN de imágenes)
- Cuenta de Resend (para emails transaccionales)
- OAuth Apps configuradas:
  - Google Cloud Console (Google OAuth)
  - Meta for Developers (Facebook Login)
  - TikTok for Developers (opcional)

### 🗄️ Setup de Base de Datos (IMPORTANTE)

**Para configuración automática:**
```bash
cd backend
./setup-db.sh  # macOS/Linux
# o
setup-db.bat   # Windows
```

**Para configuración manual, ver:** [DATABASE_SETUP.md](./DATABASE_SETUP.md)

**Guía rápida:**
1. Crear proyecto en Supabase
2. Copiar credenciales al `.env`
3. Ejecutar `npm run prisma:push`
4. Ejecutar `npm run prisma:seed`

Ver [DATABASE_SETUP.md](./DATABASE_SETUP.md) para troubleshooting.

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run prisma:generate
npm run prisma:push
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con la URL del backend y credenciales
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📖 Documentación Detallada

### Guías de Setup
- [DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) - Setup completo de base de datos
- [SOCIAL_LOGIN_SETUP.md](./docs/SOCIAL_LOGIN_SETUP.md) - Configuración OAuth (Google, Facebook, TikTok)
- [PUSH_NOTIFICATIONS.md](./docs/PUSH_NOTIFICATIONS.md) - Configuración OneSignal

### Documentación del Proyecto
- [Backend README](./backend/README.md) - Documentación del API
- [Frontend README](./frontend/README.md) - Documentación de la app
- [PRD.md](./docs/PRD.md) - Documento de Requisitos del Producto completo (1,177 líneas)

## 🔑 Variables de Entorno

### Backend (.env)

```env
# Base de datos
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# JWT
JWT_SECRET=tu-secreto-seguro-aqui
JWT_EXPIRES_IN=7d

# Agora (Live Streaming)
AGORA_APP_ID=xxxxx
AGORA_APP_CERTIFICATE=xxxxx

# OneSignal (Push Notifications)
ONESIGNAL_APP_ID=xxxxx
ONESIGNAL_REST_API_KEY=xxxxx

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_API_TOKEN=xxxxx

# Resend (Email)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@tudominio.com

# OAuth - Google
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# OAuth - Facebook
FACEBOOK_APP_ID=xxxxx
FACEBOOK_APP_SECRET=xxxxx
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

# OAuth - TikTok (opcional)
TIKTOK_CLIENT_KEY=xxxxx
TIKTOK_CLIENT_SECRET=xxxxx
TIKTOK_CALLBACK_URL=http://localhost:3000/api/auth/tiktok/callback

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=tu-session-secret-aqui
```

### Frontend (.env)

```env
# API Backend
VITE_API_URL=http://localhost:3000/api

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Agora
VITE_AGORA_APP_ID=xxxxx

# OneSignal
VITE_ONESIGNAL_APP_ID=xxxxx
```

## 📊 Modelo de Datos

Ver el schema completo en [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)

**Modelos principales (9 modelos):**

1. **User** - Sistema multi-proveedor
   - Roles: ADMIN, EXHIBITOR, VISITOR
   - Providers: LOCAL, GOOGLE, FACEBOOK, TIKTOK
   - Múltiples proveedores vinculados (UserAuthProvider)

2. **Event** - Eventos virtuales
   - Estados: DRAFT, SCHEDULED, LIVE, ENDED
   - Fechas de inicio/fin
   - Cover image y slug

3. **Booth** - Stands virtuales
   - Métodos de pago (Yape, Plin, banco)
   - Estado de streaming
   - Canal de Agora
   - Sistema multi-usuario (BoothMember)

4. **BoothMember** - Gestión multi-usuario
   - Roles: OWNER, OPERATOR, MODERATOR

5. **Product** - Catálogo de productos
   - Múltiples imágenes (array)
   - Stock y precio
   - Categorías

6. **Order** - Sistema de pedidos
   - Número único (ORD-2025-XXXXX)
   - Estados: PENDING, CONFIRMED, PREPARING, SHIPPED, DELIVERED, CANCELLED
   - Dirección de envío (JSON)

7. **OrderItem** - Items de pedidos

8. **Message** - Chat en tiempo real
   - Marca de eliminación (moderación)

9. **PushSubscription** - Notificaciones push
   - Player ID de OneSignal
   - Suscripción por evento

10. **EventReminder** - Recordatorios por email
    - Estado de envío

## 🎨 Características Implementadas

### ✅ Backend Completo (100%)
- ✅ Autenticación JWT multi-proveedor
- ✅ OAuth integrado (Google, Facebook, TikTok)
- ✅ Vinculación de múltiples proveedores
- ✅ CRUD completo de Eventos, Booths, Productos, Pedidos
- ✅ Generación de tokens Agora con expiración
- ✅ API de Chat con moderación
- ✅ Sistema de notificaciones push (OneSignal)
- ✅ Upload de imágenes a Cloudflare
- ✅ Envío de emails con Resend
- ✅ Validación exhaustiva con Joi
- ✅ Middleware de roles y autenticación
- ✅ Rate limiting y seguridad (Helmet, CORS)
- ✅ API de administración completa

### ✅ Frontend Completo (100%)
- ✅ Sistema de autenticación con login social
- ✅ Navegación responsive mobile-first
- ✅ Home con grid de eventos
- ✅ Detalle de eventos con carrusel de booths
- ✅ Vista de booth con streaming en vivo (Agora)
- ✅ Chat en tiempo real (Supabase Realtime)
- ✅ Catálogo de productos con imágenes
- ✅ Carrito de compras reactivo
- ✅ Checkout completo con upload de comprobante
- ✅ Sistema de pedidos con estados
- ✅ Panel de administración completo
- ✅ Panel de expositor completo
- ✅ Dashboard con métricas
- ✅ Gestión de perfiles
- ✅ Notificaciones push con suscripción
- ✅ Páginas legales (Privacy, Terms, Data Deletion)
- ✅ Routing con guards por rol
- ✅ 6 Pinia stores
- ✅ 27 vistas organizadas
- ✅ Composables (useAgora, useNotifications)

## 🛠️ Scripts Disponibles

### Backend
```bash
npm run dev               # Desarrollo con nodemon (auto-reload)
npm start                 # Producción
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:migrate    # Crear migración
npm run prisma:push       # Push schema a DB (sin migración)
npm run prisma:studio     # Abrir Prisma Studio (UI para BD)
npm run prisma:seed       # Seed de datos iniciales
```

### Frontend
```bash
npm run dev      # Servidor de desarrollo (http://localhost:5173)
npm run build    # Build para producción (dist/)
npm run preview  # Preview del build
npm run lint     # Linting de código
```

## 🚀 Deployment

### Backend (Render.com)
1. Crear Web Service en Render
2. Conectar repositorio
3. Build: `npm install && npx prisma generate`
4. Start: `npm start`
5. Agregar variables de entorno

### Frontend (Netlify)
1. Conectar repositorio
2. Build: `npm run build`
3. Publish directory: `dist`
4. Agregar variables de entorno

## 💰 Costos Estimados (Mensual)

**Servicios Cloud:**
- Supabase Pro: $25/mes (Database + Realtime + Storage)
- Render.com: $7-25/mes (Backend hosting)
- Netlify: $0 (Free tier para Frontend)
- Agora: ~$6-10/mes (Live streaming - gratis hasta 10K min/mes)
- OneSignal: $0 (Free tier - hasta 10K suscriptores)
- Cloudflare Images: ~$5/mes (100K imágenes + optimización)
- Resend: $0 (Free tier - 3,000 emails/mes)

**OAuth (Gratis):**
- Google Cloud Platform: $0
- Meta for Developers: $0
- TikTok for Developers: $0

**Total estimado: ~$43-65/mes**

💡 *Nota: Todos los servicios tienen tiers gratuitos generosos para desarrollo y MVPs*

## 🎯 Flujos de Usuario Implementados

### Flujo de Visitante
1. Ingresa a la home (sin login requerido)
2. Ve grid de eventos activos/próximos
3. Opcionalmente se registra con email o login social
4. Entra a un evento específico
5. Ve carrusel de booths del evento
6. Se suscribe a notificaciones push (opcional)
7. Entra a un booth con stream en vivo
8. Ve el stream y productos simultáneamente
9. Chatea con el expositor
10. Agrega productos al carrito
11. Hace checkout (con/sin registro)
12. Sube comprobante de pago
13. Recibe confirmación por email

### Flujo de Expositor
1. Se registra con email o login social (rol EXHIBITOR)
2. Accede a su panel de expositor
3. Configura su booth (logo, descripción, QR de pagos)
4. Agrega productos al catálogo
5. Espera asignación a un evento (por Admin)
6. Durante el evento: inicia live stream
7. Interactúa con visitantes en chat
8. Recibe pedidos en tiempo real
9. Gestiona pedidos (confirma, envía, entrega)
10. Ve dashboard con métricas

### Flujo de Administrador
1. Inicia sesión como ADMIN
2. Crea un nuevo evento
3. Asigna booths al evento
4. Publica el evento (SCHEDULED → LIVE)
5. Monitorea actividad en dashboard
6. Gestiona usuarios y permisos

## 🔒 Seguridad Implementada

1. **Helmet** - Headers de seguridad HTTP
2. **CORS** - Configurado para orígenes permitidos
3. **Rate Limiting** - 100 requests/15min por IP
4. **JWT** - Tokens firmados con expiración (7 días)
5. **Bcrypt** - Hash de passwords con salt rounds
6. **Joi Validation** - Validación exhaustiva de inputs
7. **Prisma** - Prevención de SQL injection
8. **Role-based access** - Guards por rol en rutas
9. **HTTPS en producción** - SSL/TLS requerido
10. **Session security** - HttpOnly cookies
11. **OAuth 2.0** - Autenticación delegada segura

## 🤝 Contribuir

Ver el [PRD.md](./docs/PRD.md) para entender la visión completa del producto y las features pendientes.

## 📝 Roles de Usuario

1. **ADMIN** - Organizador de eventos
   - Crear y gestionar eventos
   - Asignar booths a eventos
   - Ver dashboard global
   - Moderar contenido

2. **EXHIBITOR** - Vendedor
   - Configurar booth
   - Gestionar productos
   - Transmitir en vivo
   - Ver y procesar pedidos

3. **VISITOR** - Comprador
   - Explorar eventos
   - Ver streams
   - Chatear
   - Hacer pedidos

## 🚀 Estado del Proyecto

**Versión:** 2.0 (MVP Completo)
**Última actualización:** 2025-11-19

### Completado
- ✅ Sistema completo de autenticación (Local + OAuth)
- ✅ Live streaming funcional con Agora
- ✅ Chat en tiempo real
- ✅ Sistema de ecommerce completo
- ✅ Notificaciones push
- ✅ Páginas legales para cumplimiento
- ✅ Paneles de administración y expositor
- ✅ Sistema multi-usuario de booths
- ✅ 27 vistas implementadas
- ✅ 10 rutas de API completas
- ✅ ~8,815 líneas de código

### Próximas Features (Opcional)
- 🔄 Analytics avanzado
- 🔄 Sistema de reportes
- 🔄 Integración con más métodos de pago
- 🔄 Sistema de valoraciones y reviews
- 🔄 Chat privado entre usuarios
- 🔄 Modo oscuro

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la [documentación completa](./docs/)
2. Consulta el [PRD.md](./docs/PRD.md) para detalles del producto
3. Revisa las guías de setup en la carpeta `docs/`

## 📄 Licencia

MIT

## 👥 Equipo

Desarrollado por Claude Code

---

**⚡ Miniferias Live - Tu plataforma de live shopping en Perú**
