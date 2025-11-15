# Cloudflare Images - Guía de Implementación

Esta guía explica cómo está implementado Cloudflare Images en Miniferias Live y cómo usarlo.

## Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Tipos de Imágenes](#tipos-de-imágenes)
3. [Variants de Cloudflare](#variants-de-cloudflare)
4. [Backend - API](#backend---api)
5. [Frontend - Uso](#frontend---uso)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Migración desde Supabase](#migración-desde-supabase)

---

## Configuración Inicial

### 1. Obtener Credenciales de Cloudflare

1. Ve a tu dashboard de Cloudflare: https://dash.cloudflare.com
2. Navega a **Images** en el menú lateral
3. Obtén las siguientes credenciales:
   - **Account ID**: En la URL o en el dashboard
   - **API Token**: Crear uno con permisos de "Cloudflare Images Read and Write"
   - **Account Hash**: En la sección de Images > Delivery

### 2. Configurar Variables de Entorno

#### Backend (`backend/.env`)

```env
# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
CLOUDFLARE_IMAGES_ACCOUNT_HASH="your-account-hash"
```

#### Frontend (`frontend/.env`)

```env
VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH=your-account-hash
```

### 3. Crear Variants en Cloudflare

Ve a **Images > Variants** en tu dashboard de Cloudflare y crea los siguientes variants:

| Variant Name | Fit   | Width | Height | Description                      |
| ------------ | ----- | ----- | ------ | -------------------------------- |
| `avatar`     | cover | 200   | 200    | Profile pictures (circular)      |
| `logo`       | cover | 400   | 400    | Booth logos (circular)           |
| `product`    | cover | 600   | 600    | Product images (square)          |
| `cover`      | cover | 1280  | 720    | Cover images 16:9 (events/booths)|
| `thumbnail`  | cover | 150   | 150    | Small thumbnails                 |

**Nota:** El variant `public` ya existe por defecto.

### 4. Instalar Dependencias

```bash
cd backend
npm install form-data node-fetch
```

---

## Tipos de Imágenes

La aplicación maneja 5 tipos de imágenes:

### 1. **Avatar** (Profile Picture de Usuarios)
- **Proporción:** 1:1 (cuadrada)
- **Crop:** Center
- **Visualización:** Circular (CSS `border-radius: 50%`)
- **Variant:** `avatar`
- **Tamaño:** 200x200px

### 2. **Logo** (Logo de Expositores)
- **Proporción:** 1:1 (cuadrada)
- **Crop:** Center
- **Visualización:** Circular (CSS `border-radius: 50%`)
- **Variant:** `logo`
- **Tamaño:** 400x400px

### 3. **Cover** (Portadas de Eventos y Booths)
- **Proporción:** 16:9 (rectangular)
- **Crop:** Center
- **Visualización:** Rectangular
- **Variant:** `cover`
- **Tamaño:** 1280x720px

### 4. **Product** (Imágenes de Productos)
- **Proporción:** 1:1 (cuadrada)
- **Crop:** Center
- **Visualización:** Cuadrada
- **Variant:** `product`
- **Tamaño:** 600x600px
- **Nota:** Soporta múltiples imágenes por producto

### 5. **Payment Proof** (Comprobantes de Pago)
- **Proporción:** Original (sin crop)
- **Variant:** `public`
- **Nota:** Se mantiene el ratio original

---

## Variants de Cloudflare

Las imágenes se sirven mediante URLs con variants:

```
https://imagedelivery.net/{account_hash}/{image_id}/{variant}
```

Ejemplo:
```
https://imagedelivery.net/abc123/image-id-456/avatar
```

### Variants Disponibles

- **`public`**: Imagen original sin modificaciones
- **`avatar`**: 200x200 cuadrada, para avatares circulares
- **`logo`**: 400x400 cuadrada, para logos
- **`product`**: 600x600 cuadrada, para productos
- **`cover`**: 1280x720 rectangular 16:9, para portadas
- **`thumbnail`**: 150x150 pequeña, para previews

---

## Backend - API

### Servicios Creados

#### `cloudflare-images.service.js`

Servicio principal para interactuar con Cloudflare Images API.

**Funciones principales:**

```javascript
import { uploadImage, uploadMultipleImages, deleteImage, getImageUrl, IMAGE_TYPES } from './services/cloudflare-images.service.js'

// Upload de una imagen
const result = await uploadImage(fileBuffer, fileName, IMAGE_TYPES.AVATAR.type)

// Upload de múltiples imágenes
const results = await uploadMultipleImages(files, IMAGE_TYPES.PRODUCT.type)

// Eliminar imagen
await deleteImage(imageId)

// Obtener URL con variant
const url = getImageUrl(imageId, 'avatar')
```

### Endpoints de API

Base URL: `/api/upload`

| Endpoint                    | Method | Auth      | Description                      |
| --------------------------- | ------ | --------- | -------------------------------- |
| `/upload/avatar`            | POST   | Private   | Upload avatar (profile picture)  |
| `/upload/logo`              | POST   | Exhibitor | Upload booth logo                |
| `/upload/cover`             | POST   | Private   | Upload cover (event/booth)       |
| `/upload/product`           | POST   | Exhibitor | Upload single product image      |
| `/upload/products`          | POST   | Exhibitor | Upload multiple product images   |
| `/upload/payment-proof`     | POST   | Public    | Upload payment proof             |
| `/upload/:imageId`          | DELETE | Private   | Delete image                     |
| `/upload/url/:imageId/:variant` | GET | Public | Get image URL with variant   |

### Middleware

#### `upload.middleware.js`

```javascript
import { uploadSingle, uploadMultiple, handleUploadError } from './middleware/upload.middleware.js'

// Para una sola imagen
app.post('/upload', uploadSingle('image'), handleUploadError, controller)

// Para múltiples imágenes (máx 5)
app.post('/upload', uploadMultiple('images', 5), handleUploadError, controller)
```

---

## Frontend - Uso

### API Client

Importar funciones desde `services/api.js`:

```javascript
import { uploadAPI } from '@/services/api'

// Upload avatar
const result = await uploadAPI.uploadAvatar(file)

// Upload logo
const result = await uploadAPI.uploadLogo(file, boothId)

// Upload cover
const result = await uploadAPI.uploadCover(file, 'event', eventId)

// Upload product image
const result = await uploadAPI.uploadProductImage(file, productId, boothId)

// Upload múltiples imágenes de producto
const results = await uploadAPI.uploadProductImages([file1, file2])

// Upload payment proof
const result = await uploadAPI.uploadPaymentProof(file, orderId, userName)

// Delete image
await uploadAPI.deleteImage(imageId)
```

### Composable: `useImageUpload`

```javascript
import { useImageUpload } from '@/composables/useImageUpload'

const {
  uploading,        // Ref<boolean> - Estado de subida
  uploadProgress,   // Ref<number> - Progreso (0-100)
  error,           // Ref<string> - Mensaje de error
  uploadedImage,   // Ref<Object> - Imagen subida

  uploadAvatar,
  uploadLogo,
  uploadCover,
  uploadProductImage,
  uploadProductImages,
  uploadPaymentProof,
  deleteImage,
  reset,
  getImageUrl,
  extractImageId
} = useImageUpload()

// Ejemplo de uso
const handleUpload = async (file) => {
  try {
    const result = await uploadAvatar(file)
    console.log('Imagen subida:', result.url)
  } catch (err) {
    console.error('Error:', error.value)
  }
}
```

### Componente: `ImageUpload.vue`

Componente reutilizable con drag & drop, preview y validación.

```vue
<template>
  <ImageUpload
    type="avatar"
    v-model="avatarUrl"
    @uploaded="handleUploaded"
    @error="handleError"
  />
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'

const avatarUrl = ref(null)

const handleUploaded = (result) => {
  console.log('Imagen subida:', result)
}

const handleError = (error) => {
  console.error('Error:', error)
}
</script>
```

#### Props del Componente

| Prop         | Type    | Required | Description                           |
| ------------ | ------- | -------- | ------------------------------------- |
| `type`       | String  | Yes      | Tipo: avatar, logo, cover, product, paymentProof |
| `modelValue` | String  | No       | URL de la imagen actual               |
| `multiple`   | Boolean | No       | Permitir múltiples archivos (productos) |
| `entityType` | String  | No       | Tipo de entidad (event/booth) para cover |
| `entityId`   | String  | No       | ID de la entidad relacionada          |
| `disabled`   | Boolean | No       | Deshabilitar upload                   |
| `alt`        | String  | No       | Texto alternativo                     |

#### Events

| Event               | Payload      | Description                    |
| ------------------- | ------------ | ------------------------------ |
| `update:modelValue` | String       | URL de la imagen subida        |
| `uploaded`          | Object       | Datos completos de la imagen   |
| `error`             | Error        | Error durante el upload        |

---

## Ejemplos de Uso

### 1. Upload de Avatar en Perfil de Usuario

```vue
<template>
  <div class="profile-settings">
    <h2>Editar Perfil</h2>

    <ImageUpload
      type="avatar"
      v-model="user.profilePicture"
      alt="Foto de perfil"
      @uploaded="saveProfile"
    />

    <!-- Mostrar avatar actual -->
    <img
      v-if="user.profilePicture"
      :src="user.profilePicture"
      alt="Avatar"
      class="rounded-full w-20 h-20 object-cover"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { authAPI } from '@/services/api'

const user = ref({
  name: 'Juan Pérez',
  profilePicture: null
})

const saveProfile = async (result) => {
  user.value.profilePicture = result.url

  // Guardar en backend
  await authAPI.updateProfile({
    profilePicture: result.url
  })
}
</script>
```

### 2. Upload de Logo de Booth (Expositor)

```vue
<template>
  <div class="booth-setup">
    <h2>Configurar Stand</h2>

    <ImageUpload
      type="logo"
      v-model="booth.logo"
      :entity-id="booth.id"
      alt="Logo del stand"
      @uploaded="updateBooth"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { boothsAPI } from '@/services/api'

const booth = ref({
  id: 'booth-123',
  name: 'Mi Stand',
  logo: null
})

const updateBooth = async (result) => {
  await boothsAPI.update(booth.value.id, {
    logo: result.url
  })
}
</script>
```

### 3. Upload de Cover Image (Evento)

```vue
<template>
  <div class="event-form">
    <h2>Crear Evento</h2>

    <ImageUpload
      type="cover"
      entity-type="event"
      v-model="event.coverImage"
      alt="Portada del evento"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'

const event = ref({
  name: 'Feria de Emprendedores',
  coverImage: null
})
</script>
```

### 4. Upload de Imágenes de Producto (Múltiples)

```vue
<template>
  <div class="product-form">
    <h2>Agregar Producto</h2>

    <ImageUpload
      type="product"
      multiple
      v-model="product.images"
      :entity-id="booth.id"
      @uploaded="handleProductImages"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'

const product = ref({
  name: 'Producto',
  images: []
})

const booth = ref({ id: 'booth-123' })

const handleProductImages = (results) => {
  // results es un array de objetos con URLs
  product.value.images = results.map(r => r.url)
}
</script>
```

### 5. Upload de Comprobante de Pago

```vue
<template>
  <div class="payment-proof">
    <h2>Subir Comprobante</h2>

    <ImageUpload
      type="paymentProof"
      v-model="order.paymentProof"
      :entity-id="order.id"
      alt="Comprobante de pago"
      @uploaded="confirmPayment"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/shared/ImageUpload.vue'
import { ordersAPI } from '@/services/api'

const order = ref({
  id: 'ORD-2025-12345',
  paymentProof: null
})

const confirmPayment = async (result) => {
  await ordersAPI.create({
    ...order.value,
    paymentProof: result.url
  })
}
</script>
```

### 6. Mostrar Imágenes con Variants

```vue
<template>
  <div>
    <!-- Avatar circular -->
    <img
      :src="getImageUrl(user.profilePicture, 'avatar')"
      alt="Avatar"
      class="w-20 h-20 rounded-full object-cover"
    />

    <!-- Logo -->
    <img
      :src="getImageUrl(booth.logo, 'logo')"
      alt="Logo"
      class="w-32 h-32 rounded-full object-cover"
    />

    <!-- Cover 16:9 -->
    <img
      :src="getImageUrl(event.coverImage, 'cover')"
      alt="Cover"
      class="w-full aspect-video object-cover"
    />

    <!-- Product -->
    <img
      :src="getImageUrl(product.image, 'product')"
      alt="Producto"
      class="w-64 h-64 object-cover"
    />

    <!-- Thumbnail pequeño -->
    <img
      :src="getImageUrl(image, 'thumbnail')"
      alt="Thumbnail"
      class="w-12 h-12 object-cover"
    />
  </div>
</template>

<script setup>
import { useImageUpload } from '@/composables/useImageUpload'

const { getImageUrl } = useImageUpload()

// O directamente:
const getImageUrl = (imageId, variant = 'public') => {
  const accountHash = import.meta.env.VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
}
</script>
```

---

## Migración desde Supabase

Si ya tienes imágenes en Supabase Storage, aquí está el plan de migración:

### Opción 1: Migración Gradual (Recomendada)

1. **Nuevas imágenes:** Todas las nuevas subidas van a Cloudflare
2. **Imágenes existentes:** Se mantienen en Supabase hasta que se actualicen
3. **Detección:** Verificar si la URL es de Supabase o Cloudflare

```javascript
const isCloudflareImage = (url) => {
  return url && url.includes('imagedelivery.net')
}

const isSupabaseImage = (url) => {
  return url && url.includes('supabase.co')
}
```

### Opción 2: Migración por Lotes

Script para migrar imágenes existentes:

```javascript
// backend/scripts/migrate-images-to-cloudflare.js
import { prisma } from '../src/config/prisma.js'
import { uploadImage, IMAGE_TYPES } from '../src/services/cloudflare-images.service.js'
import fetch from 'node-fetch'

async function migrateImages() {
  // 1. Migrar avatares de usuarios
  const users = await prisma.user.findMany({
    where: {
      profilePicture: { not: null }
    }
  })

  for (const user of users) {
    try {
      // Descargar imagen de Supabase
      const response = await fetch(user.profilePicture)
      const buffer = await response.buffer()

      // Subir a Cloudflare
      const result = await uploadImage(buffer, 'avatar.jpg', IMAGE_TYPES.AVATAR.type)

      // Actualizar BD
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePicture: result.url }
      })

      console.log(`Migrado avatar de ${user.name}`)
    } catch (error) {
      console.error(`Error migrando ${user.id}:`, error)
    }
  }

  // 2. Migrar logos de booths
  // 3. Migrar covers de eventos
  // 4. Migrar imágenes de productos
  // ... similar pattern
}

migrateImages()
```

---

## Notas Importantes

### Límites de Cloudflare Images

- **Plan Free:** 100,000 imágenes servidas/mes
- **Plan Paid:** $5/mes por 100,000 imágenes + almacenamiento ilimitado
- **Tamaño máximo:** 10MB por imagen
- **Formatos soportados:** JPEG, PNG, GIF, WebP

### Optimizaciones

1. **Lazy Loading:** Usar `loading="lazy"` en las imágenes
2. **Variants:** Siempre usar el variant apropiado (no `public` para todo)
3. **Cache:** Cloudflare automáticamente cachea las imágenes
4. **Responsive:** Usar diferentes variants según el tamaño de pantalla

### Seguridad

- Las URLs son públicas por defecto (`requireSignedURLs: false`)
- Para imágenes privadas, cambiar a `requireSignedURLs: true` y generar signed URLs
- Validación de tipo y tamaño en el backend y frontend
- Rate limiting en los endpoints de upload

---

## Troubleshooting

### Error: "Cloudflare credentials not configured"

**Solución:** Verificar que las variables de entorno estén configuradas correctamente en `.env`

### Error: "Invalid file type"

**Solución:** Solo se aceptan JPEG, PNG, WebP y GIF. Verificar el tipo de archivo.

### Error: "File too large"

**Solución:** El límite es 10MB. Comprimir la imagen antes de subir.

### Las imágenes no se muestran

**Solución:** Verificar que `VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH` esté configurado en el frontend.

### Los variants no funcionan

**Solución:** Crear los variants en el dashboard de Cloudflare (Images > Variants).

---

## Soporte

Para más información sobre Cloudflare Images:
- [Documentación oficial](https://developers.cloudflare.com/images/)
- [API Reference](https://developers.cloudflare.com/api/operations/cloudflare-images-upload-an-image-via-url)
- [Pricing](https://www.cloudflare.com/products/cloudflare-images/)
