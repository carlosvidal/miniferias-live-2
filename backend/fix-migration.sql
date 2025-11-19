-- Script para resolver el problema de migración 20251118203416_add_user_auth_providers
-- Ejecutar este script directamente en PostgreSQL

-- 1. Marcar la migración como completada en la tabla _prisma_migrations
-- Esto le dice a Prisma que ignore el error y considere la migración como aplicada
UPDATE "_prisma_migrations"
SET "finished_at" = NOW(),
    "applied_steps_count" = 1,
    "logs" = 'Manual fix applied - migration completed successfully'
WHERE "migration_name" = '20251118203416_add_user_auth_providers';

-- 2. Verificar si la tabla UserAuthProvider ya existe
-- Si no existe, crearla
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'UserAuthProvider') THEN
        -- CreateTable for UserAuthProvider
        CREATE TABLE "UserAuthProvider" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "provider" "AuthProvider" NOT NULL,
            "providerId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT "UserAuthProvider_pkey" PRIMARY KEY ("id")
        );

        -- CreateIndex
        CREATE UNIQUE INDEX "UserAuthProvider_provider_providerId_key" ON "UserAuthProvider"("provider", "providerId");

        -- CreateIndex
        CREATE UNIQUE INDEX "UserAuthProvider_userId_provider_key" ON "UserAuthProvider"("userId", "provider");

        -- CreateIndex
        CREATE INDEX "UserAuthProvider_userId_idx" ON "UserAuthProvider"("userId");

        -- AddForeignKey
        ALTER TABLE "UserAuthProvider" ADD CONSTRAINT "UserAuthProvider_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 3. Migrar usuarios existentes a la nueva tabla
-- Solo insertar si no existen registros duplicados
INSERT INTO "UserAuthProvider" ("id", "userId", "provider", "providerId", "createdAt")
SELECT
    gen_random_uuid(),
    "id",
    "provider",
    COALESCE("providerId", "id"),
    "createdAt"
FROM "User"
WHERE "provider" IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM "UserAuthProvider"
    WHERE "UserAuthProvider"."userId" = "User"."id"
    AND "UserAuthProvider"."provider" = "User"."provider"
);

-- 4. Verificar que todo está correcto
SELECT
    'UserAuthProvider records created' as status,
    COUNT(*) as count
FROM "UserAuthProvider";
