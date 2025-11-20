# Guía de Configuración de Social Login

Esta guía te ayudará a configurar el inicio de sesión social con Google, Facebook y TikTok para Miniferias Live.

## Tabla de Contenidos

- [Configuración de Google OAuth](#configuración-de-google-oauth)
- [Configuración de Facebook OAuth](#configuración-de-facebook-oauth)
- [Configuración de TikTok OAuth](#configuración-de-tiktok-oauth)
- [Variables de Entorno](#variables-de-entorno)
- [Migración de Base de Datos](#migración-de-base-de-datos)
- [Pruebas](#pruebas)

---

## Configuración de Google OAuth

### 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. En el menú lateral, ve a "APIs y servicios" > "Credenciales"

### 2. Configurar la Pantalla de Consentimiento OAuth

1. Haz clic en "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo" y haz clic en "Crear"
3. Completa la información requerida:
   - **Nombre de la aplicación**: Miniferias Live
   - **Correo electrónico de asistencia**: tu email
   - **Logo** (opcional): sube el logo de tu aplicación
4. Agrega los ámbitos necesarios:
   - `userinfo.email`
   - `userinfo.profile`
5. Guarda los cambios

### 3. Crear Credenciales OAuth 2.0

1. Ve a "Credenciales" > "Crear credenciales" > "ID de cliente de OAuth 2.0"
2. Selecciona "Aplicación web"
3. Configura:
   - **Nombre**: Miniferias Live - Web Client
   - **Orígenes autorizados**:
     ```
     http://localhost:5173
     http://localhost:3000
     https://tu-dominio.com (en producción)
     ```
   - **URIs de redirección autorizados**:
     ```
     http://localhost:3000/api/auth/google/callback
     https://tu-dominio.com/api/auth/google/callback (en producción)
     ```
4. Haz clic en "Crear"
5. Copia el **Client ID** y el **Client Secret**

### 4. Agregar Variables de Entorno

Agrega estas variables a tu archivo `.env` en el backend:

```env
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"
```

---

## Configuración de Facebook OAuth

### 1. Crear una Aplicación en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Haz clic en "Mis Apps" > "Crear app"
3. Selecciona "Consumidor" como tipo de app
4. Completa la información:
   - **Nombre de la app**: Miniferias Live
   - **Correo de contacto**: tu email
5. Haz clic en "Crear app"

### 2. Configurar Facebook Login

1. En el panel de tu app, busca "Facebook Login" y haz clic en "Configurar"
2. Selecciona "Web" como plataforma
3. Ingresa la URL de tu sitio: `http://localhost:5173`
4. Ve a "Configuración" > "Básica" y copia:
   - **ID de la app** (App ID)
   - **Clave secreta de la app** (App Secret)

### 3. Configurar URLs de Redirección

1. En el menú lateral, ve a "Facebook Login" > "Configuración"
2. En "URIs de redirección OAuth válidos", agrega:
   ```
   http://localhost:3000/api/auth/facebook/callback
   https://tu-dominio.com/api/auth/facebook/callback (en producción)
   ```
3. Guarda los cambios

### 4. Configurar Permisos

1. Ve a "App Review" > "Permisos y funciones"
2. Solicita los permisos:
   - `email` (debe estar aprobado automáticamente)
   - `public_profile` (debe estar aprobado automáticamente)

### 5. Modo de Desarrollo vs Producción

- **Modo de desarrollo**: Solo tú y otros desarrolladores agregados pueden usar la app
- **Modo en vivo**: Para uso público, debes enviar la app a revisión en "App Review"

### 6. Agregar Variables de Entorno

```env
FACEBOOK_APP_ID="tu-facebook-app-id"
FACEBOOK_APP_SECRET="tu-facebook-app-secret"
FACEBOOK_CALLBACK_URL="http://localhost:3000/api/auth/facebook/callback"
```

---

## Configuración de TikTok OAuth

### 1. Crear una Aplicación en TikTok Developers

1. Ve a [TikTok for Developers](https://developers.tiktok.com/)
2. Inicia sesión con tu cuenta de TikTok
3. Haz clic en "Manage apps" > "Create an app"
4. Completa la información:
   - **App name**: Miniferias Live
   - **App description**: Plataforma de miniferias en vivo
   - **Category**: E-commerce / Social

### 2. Configurar Login Kit

1. En el panel de tu app, ve a "Add products"
2. Selecciona "Login Kit" y haz clic en "Apply"
3. Configura los permisos necesarios:
   - `user.info.basic` - Información básica del perfil

### 3. Configurar Redirect URIs

1. Ve a "Login Kit" > "Settings"
2. En "Redirect URIs", agrega:
   ```
   http://localhost:3000/api/auth/tiktok/callback
   https://tu-dominio.com/api/auth/tiktok/callback (en producción)
   ```

### 4. Obtener Credenciales

1. Ve a "Basic information"
2. Copia:
   - **Client Key**
   - **Client Secret**

### 5. Agregar Variables de Entorno

```env
TIKTOK_CLIENT_KEY="tu-tiktok-client-key"
TIKTOK_CLIENT_SECRET="tu-tiktok-client-secret"
TIKTOK_CALLBACK_URL="http://localhost:3000/api/auth/tiktok/callback"
```

### Nota Importante sobre TikTok

⚠️ TikTok **no proporciona el email del usuario** por defecto. Los usuarios que se registren con TikTok tendrán un email temporal generado automáticamente (`tiktok_[id]@miniferias.temp`). Deberás implementar una funcionalidad para que actualicen su email real más tarde si es necesario para notificaciones o recuperación de cuenta.

---

## Variables de Entorno

### Backend (`/backend/.env`)

Copia el archivo `.env.example` a `.env` y completa todas las variables de OAuth:

```env
# OAuth Social Login
# Google OAuth - Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# Facebook OAuth - Get from: https://developers.facebook.com/apps
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_CALLBACK_URL="http://localhost:3000/api/auth/facebook/callback"

# TikTok OAuth - Get from: https://developers.tiktok.com
TIKTOK_CLIENT_KEY="your-tiktok-client-key"
TIKTOK_CLIENT_SECRET="your-tiktok-client-secret"
TIKTOK_CALLBACK_URL="http://localhost:3000/api/auth/tiktok/callback"

# Frontend URL (for redirects after OAuth)
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`/frontend/.env`)

Si tu API está en una URL diferente, crea un archivo `.env` en el frontend:

```env
VITE_API_URL="http://localhost:3000"
```

---

## Migración de Base de Datos

Antes de usar el social login, necesitas ejecutar la migración de Prisma para actualizar el schema de la base de datos.

### 1. Revisar la Migración

La migración agrega los siguientes cambios al modelo `User`:

- Nuevo enum `AuthProvider` (LOCAL, GOOGLE, FACEBOOK, TIKTOK)
- Campo `provider` (tipo de autenticación)
- Campo `providerId` (ID del usuario en el proveedor social)
- Campo `password` ahora es opcional (usuarios de social login no necesitan contraseña)

### 2. Ejecutar la Migración

```bash
cd backend
npx prisma migrate dev
```

Si ya existe una base de datos con usuarios, la migración:
- Establecerá `provider = 'LOCAL'` para todos los usuarios existentes
- Mantendrá sus contraseñas actuales

### 3. Generar Cliente de Prisma

```bash
npx prisma generate
```

---

## Pruebas

### Probar el Flujo Completo

1. **Iniciar el Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Iniciar el Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Probar Login Social**:
   - Ve a `http://localhost:5173/login`
   - Haz clic en cualquiera de los botones de social login
   - Autoriza la aplicación en el proveedor
   - Deberías ser redirigido de vuelta a la aplicación y estar autenticado

### Verificar en la Base de Datos

```bash
cd backend
npx prisma studio
```

Verifica que los nuevos usuarios tengan:
- `provider` = 'GOOGLE', 'FACEBOOK', o 'TIKTOK'
- `providerId` con el ID del proveedor
- `password` = NULL (para usuarios de social login)
- `role` = 'VISITOR' (por defecto)

---

## Modal de Login No Intrusivo

Para usar el modal de login en tus componentes:

```vue
<script setup>
import { useAuthPrompt } from '@/composables/useAuthPrompt'

const { requireAuth } = useAuthPrompt()

function handleAction() {
  // Verificar autenticación antes de una acción
  if (!requireAuth({
    title: 'Inicia sesión para comprar',
    message: 'Necesitas una cuenta para realizar compras'
  })) {
    return // El modal se mostrará automáticamente
  }

  // Continuar con la acción
  proceedWithPurchase()
}
</script>
```

---

## Troubleshooting

### Error: "Redirect URI mismatch"

- Verifica que las URLs de callback coincidan exactamente en:
  - Variables de entorno (`.env`)
  - Configuración del proveedor OAuth
  - No debe haber barras finales `/`
  - Protocolo debe coincidir (`http` vs `https`)

### Error: "Invalid client secret"

- Verifica que copiaste correctamente el Client Secret
- Regenera el secret si es necesario
- No debe haber espacios al inicio o final

### TikTok: "Email not found"

- Es normal. TikTok no proporciona emails
- El sistema genera un email temporal automáticamente
- Implementa una forma para que el usuario actualice su email

### Error al crear usuario duplicado

- Si un email ya existe con un proveedor diferente, el sistema automáticamente vincula la cuenta social al usuario existente
- Esto permite que un usuario use múltiples métodos de login

---

## Seguridad

### Mejores Prácticas

1. **Nunca commits tus credenciales**:
   - El archivo `.env` está en `.gitignore`
   - Usa `.env.example` como plantilla

2. **Usa HTTPS en producción**:
   - Actualiza todas las URLs a `https://`
   - Configura SSL/TLS en tu servidor

3. **Rotar secretos regularmente**:
   - Cambia los Client Secrets periódicamente
   - Actualiza en ambos lugares: código y proveedor OAuth

4. **Limita los scopes/permisos**:
   - Solo solicita los permisos necesarios
   - Menos permisos = mayor confianza del usuario

---

## Recursos Adicionales

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [TikTok Login Kit Documentation](https://developers.tiktok.com/doc/login-kit-web)
- [Passport.js Documentation](http://www.passportjs.org/)

---

## Soporte

Si encuentras problemas durante la configuración, verifica:

1. Que todas las variables de entorno estén correctamente configuradas
2. Que las URLs de callback coincidan exactamente
3. Que la aplicación esté en el modo correcto (desarrollo/producción)
4. Los logs del backend para mensajes de error detallados

¡Listo! Ahora tu aplicación Miniferias Live soporta login social con Google, Facebook y TikTok.
