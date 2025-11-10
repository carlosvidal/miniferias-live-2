# Miniferias - Live Shopping Platform

Plataforma web mobile-first que permite a expositores vender productos mediante live streaming durante eventos virtuales, con chat en tiempo real y sistema de pedidos simplificado integrado con métodos de pago locales peruanos (Yape/Plin).

## 🎯 Características Principales

### Para Expositores
- 📺 Transmisión en vivo durante eventos
- 💬 Chat en tiempo real con compradores
- 📦 Gestión de catálogo de productos
- 📋 Gestión de pedidos
- 💰 Aceptación de pagos locales (Yape/Plin con QR)

### Para Visitantes
- 🎪 Exploración de eventos virtuales
- 🏪 Navegación de booths con transmisión en vivo
- 🛒 Carrito de compras
- 📱 Proceso de compra simplificado
- 📦 Historial de pedidos

### Para Administradores
- 🎛️ Gestión de eventos y booths
- 📊 Dashboard con métricas
- 👥 Asignación de expositores
- 🔍 Moderación de contenido

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

**Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication
- Agora Token Generation
- Nodemailer (Email notifications)

**Frontend:**
- Vue 3 (Composition API)
- Vite
- Tailwind CSS
- Pinia (State Management)
- Vue Router
- Agora SDK (Live Streaming)
- Supabase Realtime (Chat)

**Servicios Cloud:**
- Supabase (Database + Auth + Realtime + Storage)
- Agora (Live Streaming)
- Render.com (Backend deployment)
- Netlify (Frontend deployment)

## 📂 Estructura del Proyecto

```
miniferias-live-2/
├── backend/           # API REST con Express + Prisma
│   ├── src/
│   │   ├── controllers/    # Controladores de API
│   │   ├── middleware/     # Auth, validación, etc.
│   │   ├── routes/         # Rutas de API
│   │   ├── services/       # Agora, email, storage
│   │   └── utils/          # Helpers y validadores
│   ├── prisma/
│   │   └── schema.prisma   # Schema de base de datos
│   └── package.json
│
├── frontend/          # App Vue 3
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── composables/    # useAgora, etc.
│   │   ├── router/         # Vue Router
│   │   ├── services/       # API client
│   │   ├── stores/         # Pinia stores
│   │   └── views/          # Vistas/páginas
│   └── package.json
│
├── PRD.md             # Documento de Requisitos del Producto
└── README.md          # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL (o cuenta de Supabase)
- Cuenta de Agora (para live streaming)
- Cuenta de SendGrid (opcional, para emails)

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

- [Backend README](./backend/README.md) - Documentación del API
- [Frontend README](./frontend/README.md) - Documentación de la app
- [PRD](./PRD.md) - Documento de Requisitos del Producto completo

## 🔑 Variables de Entorno

### Backend (.env)

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=...
AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...
SENDGRID_API_KEY=...
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
VITE_AGORA_APP_ID=...
```

## 📊 Modelo de Datos

Ver el schema completo en [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)

**Modelos principales:**
- `User` - Usuarios (Admin, Exhibitor, Visitor)
- `Event` - Eventos virtuales
- `Booth` - Booths de expositores
- `Product` - Productos del catálogo
- `Order` - Pedidos
- `OrderItem` - Items de pedidos
- `Message` - Mensajes de chat

## 🎨 Características Implementadas

### ✅ Backend Completo
- Autenticación JWT
- CRUD de Eventos, Booths, Productos, Pedidos
- Generación de tokens Agora
- API de Mensajes
- Validación con Joi
- Middleware de roles
- Servicios de email y storage

### ✅ Frontend Base
- Sistema de autenticación
- Navegación responsive
- Listado de eventos
- Detalle de eventos con booths
- Carrito de compras
- Routing con guards
- Stores de Pinia
- Integración Agora (composable)

### 🚧 En Desarrollo
- Vista detallada de booth con streaming
- Chat en tiempo real
- Checkout completo
- Panel de administrador
- Panel de expositor
- Gestión de pedidos

## 🛠️ Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo con nodemon
npm start            # Producción
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:push      # Push schema a DB
npm run prisma:studio    # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
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

- Supabase Pro: $25/mes
- Render.com: $7-25/mes
- Netlify: $0 (Free tier)
- Agora: ~$6/mes (estimado)
- **Total: ~$40-60/mes**

## 🤝 Contribuir

Ver el [PRD.md](./PRD.md) para entender la visión completa del producto y las features pendientes.

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

## 📄 Licencia

MIT

## 👥 Autor

Claude Code

---

**Versión:** 1.0 (MVP)
**Fecha:** 2025-11-10
