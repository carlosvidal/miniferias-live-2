# Instrucciones para aplicar la migración de BoothVisit

El error que estás viendo es porque el schema de Prisma ha cambiado pero la base de datos no tiene la nueva tabla `BoothVisit`.

## Opción 1: Usar Prisma Migrate (Recomendado)

En tu máquina local (Mac), ejecuta:

```bash
cd backend

# Generar el cliente de Prisma con el nuevo schema
npm run prisma:generate

# Aplicar las migraciones pendientes
npx prisma migrate deploy

# O si prefieres usar migrate dev (en desarrollo)
npx prisma migrate dev
```

## Opción 2: Ejecutar SQL manualmente

Si Prisma migrate no funciona, puedes ejecutar el SQL directamente en tu base de datos PostgreSQL:

```bash
# Conectar a tu base de datos PostgreSQL
psql -U tu_usuario -d tu_base_de_datos

# Luego ejecutar:
\i prisma/migrations/manual_booth_visit.sql

# O copiar y pegar el contenido del archivo
```

También puedes ejecutar directamente:

```sql
-- CreateTable
CREATE TABLE IF NOT EXISTS "BoothVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boothId" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" TIMESTAMP(3),
    "duration" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoothVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BoothVisit_boothId_idx" ON "BoothVisit"("boothId");
CREATE INDEX IF NOT EXISTS "BoothVisit_userId_idx" ON "BoothVisit"("userId");
CREATE INDEX IF NOT EXISTS "BoothVisit_entryTime_idx" ON "BoothVisit"("entryTime");
CREATE INDEX IF NOT EXISTS "BoothVisit_boothId_entryTime_idx" ON "BoothVisit"("boothId", "entryTime");

-- AddForeignKey (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BoothVisit_userId_fkey'
    ) THEN
        ALTER TABLE "BoothVisit" ADD CONSTRAINT "BoothVisit_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BoothVisit_boothId_fkey'
    ) THEN
        ALTER TABLE "BoothVisit" ADD CONSTRAINT "BoothVisit_boothId_fkey"
            FOREIGN KEY ("boothId") REFERENCES "Booth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
```

## Verificar que funcionó

Después de ejecutar la migración, verifica que la tabla existe:

```sql
\dt BoothVisit
-- o
SELECT * FROM information_schema.tables WHERE table_name = 'BoothVisit';
```

## Regenerar el cliente de Prisma

Después de aplicar la migración, asegúrate de regenerar el cliente de Prisma:

```bash
cd backend
npm run prisma:generate
```

## Reiniciar el servidor

Finalmente, reinicia tu servidor backend:

```bash
npm run dev
```

## ¿Por qué desaparecieron los booths?

Si los booths desaparecieron, es probable que sea un error de Prisma intentando hacer queries con el nuevo modelo antes de que exista la tabla. Una vez que apliques la migración y regeneres el cliente, todo debería volver a funcionar normalmente.

## Verificar la configuración de OneSignal

Para que las notificaciones funcionen, asegúrate de tener en tu archivo `.env`:

```env
ONESIGNAL_APP_ID=tu_app_id
ONESIGNAL_API_KEY=tu_api_key
FRONTEND_URL=http://localhost:5173
```

Si no tienes OneSignal configurado, las notificaciones no se enviarán pero el resto de la funcionalidad seguirá funcionando (el tracking de visitas).
