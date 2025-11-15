#!/usr/bin/env node
/**
 * Script para verificar la configuración de Cloudflare Images
 *
 * Uso:
 *   node scripts/verify-cloudflare.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env') });

console.log('\n🔍 Verificando configuración de Cloudflare Images...\n');

const checks = {
  accountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: !!process.env.CLOUDFLARE_API_TOKEN,
  accountHash: !!process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH
};

const allValid = Object.values(checks).every(v => v);

// Mostrar resultados
console.log('Variables de entorno:');
console.log(`  CLOUDFLARE_ACCOUNT_ID:        ${checks.accountId ? '✅' : '❌'} ${checks.accountId ? '(configurado)' : '(FALTA)'}`);
console.log(`  CLOUDFLARE_API_TOKEN:         ${checks.apiToken ? '✅' : '❌'} ${checks.apiToken ? '(configurado)' : '(FALTA)'}`);
console.log(`  CLOUDFLARE_IMAGES_ACCOUNT_HASH: ${checks.accountHash ? '✅' : '❌'} ${checks.accountHash ? '(configurado)' : '(FALTA)'}`);

console.log('\n');

if (allValid) {
  console.log('✅ ¡Todas las variables están configuradas!\n');

  // Intentar hacer una petición de prueba
  console.log('🧪 Probando conexión con Cloudflare...\n');

  const testConnection = async () => {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Conexión exitosa con Cloudflare Images API');
        console.log(`   Total de imágenes: ${data.result?.images?.length || 0}`);
        console.log('\n🎉 Todo está configurado correctamente!\n');
        process.exit(0);
      } else {
        console.log('❌ Error en la API de Cloudflare:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Mensaje: ${data.errors?.[0]?.message || 'Error desconocido'}`);
        console.log('\n⚠️  Verifica que:');
        console.log('   1. El API Token tenga permisos de "Cloudflare Images Read and Write"');
        console.log('   2. El Account ID sea correcto');
        console.log('   3. Cloudflare Images esté habilitado en tu cuenta\n');
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Error conectando con Cloudflare:');
      console.log(`   ${error.message}\n`);
      process.exit(1);
    }
  };

  await testConnection();
} else {
  console.log('❌ Faltan variables de entorno\n');
  console.log('📝 Instrucciones:');
  console.log('   1. Crea el archivo .env: cp .env.example .env');
  console.log('   2. Edita .env y agrega tus credenciales de Cloudflare');
  console.log('   3. Ejecuta este script nuevamente\n');
  console.log('📚 Documentación: docs/CLOUDFLARE_IMAGES.md\n');
  process.exit(1);
}
