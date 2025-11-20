# Solución para Error de Migración UserAuthProvider

## El Problema

La migración `20251118203416_add_user_auth_providers` falló con el error:
```
ERROR: column "providerid" does not exist
```

Esto ocurrió porque PostgreSQL es case-sensitive y las columnas necesitan comillas dobles.

## Solución

Hay dos formas de resolver este problema:

### Opción 1: Ejecutar el Script SQL Manual (Recomendado)

1. Conecta a tu base de datos PostgreSQL:

```bash
# Usando la URL de .env
psql "postgresql://usuario:password@localhost:5432/miniferias"

# O usando variables separadas
psql -h localhost -U tu_usuario -d miniferias
```

2. Ejecuta el script de corrección:

```bash
\i backend/fix-migration.sql
```

O copia y pega el contenido del archivo `backend/fix-migration.sql` directamente en el prompt de psql.

3. Verifica que se aplicó correctamente:

```sql
-- Verificar que la tabla existe
\dt UserAuthProvider

-- Verificar que hay registros
SELECT * FROM "UserAuthProvider";
```

### Opción 2: Usando Node.js con pg

Si prefieres no usar psql directamente, puedes ejecutar el siguiente comando:

```bash
cd backend
node -e "
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(() => fs.readFileSync('fix-migration.sql', 'utf8'))
  .then(sql => client.query(sql))
  .then(() => console.log('✅ Migración corregida exitosamente'))
  .catch(err => console.error('❌ Error:', err.message))
  .finally(() => client.end());
"
```

Asegúrate de tener `pg` instalado:
```bash
npm install pg
```

## Verificación

Después de ejecutar el fix, verifica que todo está correcto:

```bash
# Intenta generar el cliente de Prisma de nuevo
cd backend
npx prisma generate

# Verifica el estado de las migraciones
npx prisma migrate status
```

Deberías ver algo como:
```
Database schema is up to date!
```

## Qué hace el Script de Corrección

1. **Marca la migración como completada** en la tabla `_prisma_migrations`
2. **Crea la tabla `UserAuthProvider`** si no existe (con verificación)
3. **Migra usuarios existentes** desde la tabla User a UserAuthProvider
4. **Muestra un conteo** de registros creados para verificación

## Después de Aplicar el Fix

Una vez que el fix esté aplicado, ya puedes:

1. Generar el cliente de Prisma:
```bash
cd backend
npx prisma generate
```

2. Iniciar el servidor:
```bash
npm run dev
```

3. Probar la funcionalidad de multi-provider en el perfil del usuario.

## Si Aún Tienes Problemas

Si después de aplicar el fix sigues teniendo problemas:

1. Verifica las variables de entorno en `.env`:
```bash
DATABASE_URL="postgresql://usuario:password@localhost:5432/miniferias"
```

2. Verifica que puedes conectarte a la base de datos:
```bash
psql $DATABASE_URL -c "SELECT current_database();"
```

3. Verifica el schema de la tabla User:
```bash
psql $DATABASE_URL -c '\d "User"'
```

4. Si es necesario, puedes borrar la migración fallida y volver a intentar:
```sql
-- Conectar a la base de datos
psql $DATABASE_URL

-- Eliminar la migración fallida
DELETE FROM "_prisma_migrations"
WHERE "migration_name" = '20251118203416_add_user_auth_providers';

-- Eliminar la tabla si se creó parcialmente
DROP TABLE IF EXISTS "UserAuthProvider" CASCADE;
```

Luego ejecuta el script `fix-migration.sql` de nuevo.

## Contacto

Si necesitas ayuda adicional, revisa los logs completos del error o contacta al equipo de desarrollo.
