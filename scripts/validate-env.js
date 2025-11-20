#!/usr/bin/env node

/**
 * Script de validación de variables de entorno críticas para producción
 * Ejecutar antes del deploy: node scripts/validate-env.js
 */

const requiredEnvVars = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'URL del proyecto Supabase',
    example: 'https://your-project.supabase.co',
    critical: true,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Clave pública/anon de Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: true,
  },
  {
    name: 'REVALIDATE_SECRET',
    description: 'Token secreto para autorizar /api/revalidate',
    example: 'super-seguro-usa-algo-aleatorio',
    critical: true,
  },
];

const optionalEnvVars = [
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Clave de servicio (solo backend/admin)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    critical: false,
  },
];

console.log('🔍 Validando variables de entorno...\n');

let hasErrors = false;
let hasWarnings = false;

// Validar variables críticas
console.log('✅ Variables Críticas:');
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar.name];
  
  if (!value || value === '' || value === 'undefined') {
    console.error(`❌ ${envVar.name}: FALTANTE`);
    console.error(`   Descripción: ${envVar.description}`);
    console.error(`   Ejemplo: ${envVar.example}\n`);
    hasErrors = true;
  } else {
    // Validar formato básico
    if (envVar.name.includes('URL')) {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        console.error(`❌ ${envVar.name}: Formato inválido (debe ser una URL)`);
        console.error(`   Valor actual: ${value.substring(0, 50)}...\n`);
        hasErrors = true;
      } else {
        console.log(`✅ ${envVar.name}: OK`);
      }
    } else if (envVar.name.includes('KEY')) {
      if (value.length < 100) {
        console.warn(`⚠️  ${envVar.name}: Parece sospechosamente corto (${value.length} chars)`);
        hasWarnings = true;
      } else {
        console.log(`✅ ${envVar.name}: OK`);
      }
    } else {
      console.log(`✅ ${envVar.name}: OK`);
    }
  }
}

// Validar variables opcionales
console.log('\n📋 Variables Opcionales:');
for (const envVar of optionalEnvVars) {
  const value = process.env[envVar.name];
  
  if (!value || value === '' || value === 'undefined') {
    console.log(`ℹ️  ${envVar.name}: No configurada (opcional)`);
    console.log(`   Descripción: ${envVar.description}\n`);
  } else {
    console.log(`✅ ${envVar.name}: OK`);
  }
}

// Resumen final
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('\n❌ VALIDACIÓN FALLIDA: Faltan variables de entorno críticas');
  console.error('   Configura las variables en tu archivo .env.local o en Vercel\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  VALIDACIÓN PASÓ CON WARNINGS: Revisa las advertencias arriba');
  console.log('   El sistema puede funcionar pero algunos valores parecen incorrectos\n');
  process.exit(0);
} else {
  console.log('\n✅ VALIDACIÓN EXITOSA: Todas las variables están configuradas correctamente\n');
  process.exit(0);
}
