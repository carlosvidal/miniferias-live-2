# Multi-Provider Streaming System

Este documento explica cómo funciona el sistema de streaming multi-proveedor implementado en Miniferias Live, que soporta tanto Agora.io como 100ms.live de manera intercambiable por evento.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Configuración](#configuración)
- [Uso](#uso)
- [API de Costos](#api-de-costos)
- [Migración desde Agora](#migración-desde-agora)

## Descripción General

El sistema permite:

✅ **Múltiples Providers**: Soporte para Agora.io y 100ms.live
✅ **Configuración por Evento**: Cada evento puede elegir su proveedor
✅ **Cálculo de Costos**: Estimación automática de costos basada en viewers y duración
✅ **Planificación de Capacidad**: Calcular capacidad máxima desde un presupuesto
✅ **Comparación de Providers**: Comparar costos entre diferentes proveedores
✅ **Backwards Compatible**: El código existente sigue funcionando

## Arquitectura

### Backend

```
services/
├── streaming/
│   ├── IStreamProvider.js         # Interfaz base
│   ├── AgoraProvider.js            # Implementación Agora
│   ├── HundredMSProvider.js        # Implementación 100ms
│   ├── StreamProviderFactory.js   # Factory para instanciar providers
│   └── index.js
├── capacity.service.js             # Servicio de cálculo de costos
└── agora.service.js                # [Deprecated] Usar StreamProvider

controllers/
├── capacity.controller.js          # Endpoints de costos
└── booths.controller.js            # Actualizado para multi-provider

routes/
└── capacity.routes.js              # Rutas de capacidad
```

### Frontend

```
composables/
├── streaming/
│   ├── IStreamAdapter.js           # Interfaz base
│   ├── AgoraAdapter.js             # Adaptador Agora
│   ├── HundredMSAdapter.js         # Adaptador 100ms
│   └── StreamAdapterFactory.js    # Factory frontend
├── useStreaming.js                 # Composable principal
└── useAgora.js                     # [Deprecated] Usar useStreaming

services/
└── api.js                          # Incluye capacityAPI
```

### Base de Datos

```prisma
enum StreamProvider {
  AGORA
  HUNDREDMS
}

model Event {
  streamProvider          StreamProvider @default(AGORA)
  budget                  Decimal?
  currency                String? @default("USD")
  maxConcurrentViewers    Int?
  estimatedPeakViewers    Int?
  maxBooths               Int?
  estimatedCost           Decimal?
  // ... otros campos
}

model Booth {
  streamChannel           String?  // Antes: agoraChannel
  streamConfig            Json?    // Config específica del provider
  maxConcurrentViewers    Int?
  currentViewers          Int? @default(0)
  // ... otros campos
}
```

## Configuración

### 1. Variables de Entorno

#### Backend (.env)

```bash
# Agora.io (existente)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# 100ms.live (nuevo)
HUNDREDMS_ACCESS_KEY=your_100ms_access_key
HUNDREDMS_APP_SECRET=your_100ms_app_secret
HUNDREDMS_TEMPLATE_ID=your_100ms_template_id
HUNDREDMS_SUBDOMAIN=your_subdomain
```

#### Frontend (.env)

No requiere cambios adicionales. Los providers se configuran en el backend.

### 2. Migración de Base de Datos

```bash
cd backend
npx prisma migrate deploy
```

Esto aplicará la migración `20251119000000_add_streaming_providers_and_capacity` que:
- Agrega el enum `StreamProvider`
- Agrega campos de presupuesto a `Event`
- Renombra `agoraChannel` a `streamChannel` en `Booth`
- Agrega `streamConfig`, `maxConcurrentViewers`, `currentViewers`

### 3. Instalación de Dependencias

#### Backend

```bash
cd backend
npm install jsonwebtoken  # Para 100ms
```

#### Frontend (Opcional - solo si vas a usar 100ms)

```bash
cd frontend
npm install @100mslive/hms-video-store
```

## Uso

### Backend: Generar Tokens

El sistema detecta automáticamente el provider del evento:

```javascript
import { StreamProviderFactory } from './services/streaming/StreamProviderFactory.js';

// Obtener el provider del evento
const provider = event.streamProvider || 'AGORA';

// Crear instancia del provider
const streamProvider = StreamProviderFactory.createProvider(provider);

// Generar token
const tokenData = await streamProvider.generateToken(channelName, uid, role);
// tokenData = { token, appId/roomId, uid, channel, expiresAt, provider }
```

### Frontend: Usar Streaming

#### Opción 1: useStreaming (Recomendado)

```javascript
import { useStreaming } from '@/composables/useStreaming';

export default {
  setup() {
    // Obtener provider del evento (desde API)
    const provider = event.value.streamProvider?.toLowerCase() || 'agora';

    const {
      isJoined,
      isPublishing,
      remoteUsers,
      joinChannel,
      leaveChannel,
      startPublishing,
      stopPublishing,
      toggleAudio,
      toggleVideo
    } = useStreaming(provider);

    // Unirse al canal
    async function join(credentials, role) {
      await joinChannel(credentials, role);
    }

    return {
      isJoined,
      isPublishing,
      remoteUsers,
      join,
      leaveChannel,
      startPublishing,
      stopPublishing
    };
  }
};
```

#### Opción 2: useAgora (Backward Compatible)

```javascript
import { useAgora } from '@/composables/useAgora';

// Sigue funcionando exactamente igual
const { joinChannel, startPublishing } = useAgora();
```

### Actualizar Evento con Provider

```javascript
// Admin: Crear/actualizar evento con provider específico
await eventsAPI.update(eventId, {
  name: "Mi Evento",
  streamProvider: "HUNDREDMS",  // o "AGORA"
  budget: 500,                   // USD
  maxConcurrentViewers: 1000,
  estimatedPeakViewers: 800,
  maxBooths: 20
});
```

## API de Costos

### Endpoints

```
GET  /api/capacity/providers               # Lista de providers disponibles
GET  /api/capacity/pricing/:provider       # Pricing de un provider
POST /api/capacity/estimate                # Estimar costo
POST /api/capacity/from-budget             # Calcular capacidad desde presupuesto
POST /api/capacity/compare                 # Comparar providers
POST /api/capacity/optimal-distribution    # Distribución óptima de booths
```

### Ejemplos

#### 1. Calcular Costo Estimado

```javascript
import { capacityAPI } from '@/services/api';

const estimate = await capacityAPI.calculateCost({
  provider: 'AGORA',
  peakConcurrentUsers: 500,
  durationMinutes: 120,
  numberOfBooths: 10,
  options: {
    quality: 'hd'  // 'hd' o 'fullhd'
  }
});

console.log(estimate);
// {
//   provider: 'agora',
//   estimatedCost: 23.76,
//   currency: 'USD',
//   breakdown: {
//     publisherMinutes: 1200,
//     viewerMinutes: 60000,
//     totalMinutes: 61200,
//     billableMinutes: 51200,  // Después de 10,000 gratis
//     pricePerMinute: 0.00099
//   }
// }
```

#### 2. Calcular Capacidad desde Presupuesto

```javascript
const capacity = await capacityAPI.calculateCapacityFromBudget({
  provider: 'AGORA',
  budget: 100,        // USD
  durationMinutes: 120,
  numberOfBooths: 5,
  options: { quality: 'hd' }
});

console.log(capacity);
// {
//   maxConcurrentViewers: 8333,
//   estimatedCost: 99.99,
//   remainingBudget: 0.01,
//   utilizationPercentage: 99.99
// }
```

#### 3. Comparar Providers

```javascript
const comparison = await capacityAPI.compareProviders({
  peakConcurrentUsers: 1000,
  durationMinutes: 180,
  numberOfBooths: 15,
  options: {}
});

console.log(comparison);
// [
//   {
//     provider: 'agora',
//     estimatedCost: 156.42,
//     breakdown: { ... }
//   },
//   {
//     provider: '100ms',
//     estimatedCost: 168.30,
//     breakdown: { ... }
//   }
// ]
```

#### 4. Distribución Óptima de Booths

```javascript
const distribution = await capacityAPI.calculateOptimalDistribution({
  provider: 'AGORA',
  budget: 200,
  durationMinutes: 120,
  estimatedPeakViewers: 2000,
  options: { quality: 'hd' }
});

console.log(distribution);
// {
//   maxBooths: 25,
//   recommendedConfig: {
//     numberOfBooths: 25,
//     viewersPerBooth: 80,
//     totalViewers: 2000,
//     cost: 198.50
//   },
//   remainingBudget: 1.50
// }
```

## Migración desde Agora

### 1. Backend

**Antes:**
```javascript
import { generateAgoraToken } from './services/agora.service.js';

const agoraData = generateAgoraToken(channelName, uid, 'host');
```

**Después:**
```javascript
import { StreamProviderFactory } from './services/streaming/StreamProviderFactory.js';

const provider = StreamProviderFactory.createProvider('AGORA');
const tokenData = await provider.generateToken(channelName, uid, 'host');
```

### 2. Frontend

**Antes:**
```javascript
import { useAgora } from '@/composables/useAgora';

const { joinChannel } = useAgora();
await joinChannel(appId, channel, token, uid, 'audience');
```

**Después:**
```javascript
import { useStreaming } from '@/composables/useStreaming';

const provider = event.streamProvider?.toLowerCase() || 'agora';
const { joinChannel } = useStreaming(provider);
await joinChannel({ appId, channel, token, uid }, 'audience');
```

### 3. Base de Datos

Los campos se renombraron automáticamente en la migración:
- `Booth.agoraChannel` → `Booth.streamChannel`
- Los datos existentes se preservan

## Pricing

### Agora.io

- **Free Tier**: 10,000 minutos/mes
- **HD Video** (≤720p): $0.99 / 1000 minutos
- **Full HD** (≥1080p): $3.99 / 1000 minutos
- **Audio**: $0.99 / 1000 minutos

### 100ms.live

- **Free Tier**: 10,000 minutos/mes
- **Video**: $0.99 / 1000 minutos (todas las calidades)
- **Recording**: $0.40 / 100 minutos
- **RTMP Streaming**: $0.40 / 100 minutos

## Casos de Uso

### 1. Evento con Presupuesto Fijo

```javascript
// Calcular cuántos viewers puedes soportar con $300
const result = await capacityAPI.calculateCapacityFromBudget({
  provider: 'AGORA',
  budget: 300,
  durationMinutes: 180,  // 3 horas
  numberOfBooths: 10
});

// Configurar el evento
await eventsAPI.update(eventId, {
  streamProvider: 'AGORA',
  budget: 300,
  maxConcurrentViewers: result.maxConcurrentViewers,
  estimatedPeakViewers: result.maxConcurrentViewers,
  maxBooths: 10
});
```

### 2. Comparar Costos antes de Elegir

```javascript
// Comparar antes de tomar decisión
const comparison = await capacityAPI.compareProviders({
  peakConcurrentUsers: 2000,
  durationMinutes: 240,
  numberOfBooths: 20
});

// Elegir el más barato
const cheapest = comparison[0];
console.log(`Mejor opción: ${cheapest.provider} - $${cheapest.estimatedCost}`);
```

### 3. Validación de Capacidad en Tiempo Real

```javascript
// Backend: Validar antes de permitir ingreso
const currentViewers = await prisma.booth.aggregate({
  where: { eventId, isStreaming: true },
  _sum: { currentViewers: true }
});

if (currentViewers._sum.currentViewers >= event.maxConcurrentViewers) {
  throw new Error('Event at full capacity');
}
```

## Troubleshooting

### Error: "Unknown streaming provider"

**Causa**: Provider inválido o no configurado
**Solución**: Verificar que el provider sea 'AGORA' o 'HUNDREDMS'

```javascript
// Verificar antes de usar
if (!StreamProviderFactory.isProviderAvailable(provider)) {
  console.error('Provider not available, falling back to AGORA');
  provider = 'AGORA';
}
```

### Error: "100ms credentials not configured"

**Causa**: Variables de entorno faltantes
**Solución**: Agregar credentials de 100ms en `.env`

```bash
HUNDREDMS_ACCESS_KEY=...
HUNDREDMS_APP_SECRET=...
```

### Error: "100ms SDK not installed"

**Causa**: Paquete npm faltante
**Solución**: Instalar el SDK

```bash
npm install @100mslive/hms-video-store
```

## Próximos Pasos

1. **UI de Configuración**: Agregar formulario en admin para configurar provider por evento
2. **Componente de Calculadora**: Widget interactivo para estimar costos
3. **Dashboard de Monitoreo**: Panel en tiempo real de viewers y costos acumulados
4. **Alertas de Presupuesto**: Notificaciones cuando se acerca al límite
5. **Grabación**: Integrar grabación de streams con ambos providers

## Recursos

- [Agora.io Docs](https://docs.agora.io/)
- [100ms.live Docs](https://www.100ms.live/docs)
- [Agora Pricing](https://www.agora.io/en/pricing/)
- [100ms Pricing](https://www.100ms.live/pricing)
