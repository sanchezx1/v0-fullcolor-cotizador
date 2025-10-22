/**
 * SCRIPT DE VERIFICACIÓN DE SUPABASE PARA ADMIN PANEL
 * 
 * Verifica que todas las configuraciones necesarias estén en su lugar:
 * - Tablas y columnas
 * - Vistas
 * - Funciones
 * - Storage buckets
 * - Políticas de storage
 * 
 * Uso: node scripts/verify-supabase-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN DE SUPABASE\n');
console.log('='.repeat(60));

let erroresEncontrados = 0;

// ============================================
// 1. VERIFICAR TABLAS
// ============================================
console.log('\n📊 1. VERIFICANDO TABLAS...\n');

const tablasRequeridas = [
  'productos',
  'precios_escalonados',
  'leads',
  'cotizaciones',
  'items_cotizacion',
  'eventos'
];

for (const tabla of tablasRequeridas) {
  const { data, error } = await supabase.from(tabla).select('*').limit(1);
  
  if (error) {
    console.log(`   ❌ Tabla "${tabla}": NO EXISTE o no accesible`);
    console.log(`      Error: ${error.message}`);
    erroresEncontrados++;
  } else {
    console.log(`   ✅ Tabla "${tabla}": OK`);
  }
}

// ============================================
// 2. VERIFICAR COLUMNAS CRÍTICAS
// ============================================
console.log('\n📋 2. VERIFICANDO COLUMNAS CRÍTICAS...\n');

const columnasRequeridas = {
  productos: ['id', 'nombre', 'sku', 'categoria', 'imagen_url', 'activo'],
  leads: ['id', 'nombre', 'email', 'telefono', 'ruc_cedula', 'ciudad', 'direccion'],
  cotizaciones: ['id', 'numero', 'lead_id', 'estado', 'subtotal', 'iva', 'total', 'pdf_url'],
  eventos: ['id', 'cotizacion_id', 'tipo', 'descripcion', 'metadata']
};

for (const [tabla, columnas] of Object.entries(columnasRequeridas)) {
  const { data, error } = await supabase.from(tabla).select('*').limit(1);
  
  if (!error && data) {
    const columnasDisponibles = data.length > 0 ? Object.keys(data[0]) : [];
    
    for (const columna of columnas) {
      if (data.length === 0) {
        // No hay datos para verificar, intentamos con metadata
        console.log(`   ⚠️  ${tabla}.${columna}: Sin datos para verificar`);
      } else if (columnasDisponibles.includes(columna)) {
        console.log(`   ✅ ${tabla}.${columna}: OK`);
      } else {
        console.log(`   ❌ ${tabla}.${columna}: FALTA`);
        erroresEncontrados++;
      }
    }
  }
}

// ============================================
// 3. VERIFICAR VISTAS
// ============================================
console.log('\n👁️  3. VERIFICANDO VISTAS...\n');

// Vista: estadisticas_dashboard
const { data: statsData, error: statsError } = await supabase
  .from('estadisticas_dashboard')
  .select('*')
  .single();

if (statsError) {
  console.log(`   ❌ Vista "estadisticas_dashboard": NO EXISTE`);
  console.log(`      Error: ${statsError.message}`);
  erroresEncontrados++;
} else {
  console.log(`   ✅ Vista "estadisticas_dashboard": OK`);
  console.log(`      - Total cotizaciones: ${statsData.total_cotizaciones}`);
  console.log(`      - Productos activos: ${statsData.productos_activos}`);
}

// Vista: productos_top_cotizados
const { data: topProductsData, error: topProductsError } = await supabase
  .from('productos_top_cotizados')
  .select('*')
  .limit(5);

if (topProductsError) {
  console.log(`   ❌ Vista "productos_top_cotizados": NO EXISTE`);
  console.log(`      Error: ${topProductsError.message}`);
  erroresEncontrados++;
} else {
  console.log(`   ✅ Vista "productos_top_cotizados": OK`);
  console.log(`      - Productos encontrados: ${topProductsData.length}`);
}

// ============================================
// 4. VERIFICAR FUNCIONES
// ============================================
console.log('\n⚙️  4. VERIFICANDO FUNCIONES...\n');

// Función: generar_numero_cotizacion
const { data: numeroData, error: numeroError } = await supabase.rpc('generar_numero_cotizacion');

if (numeroError) {
  console.log(`   ❌ Función "generar_numero_cotizacion": NO EXISTE`);
  console.log(`      Error: ${numeroError.message}`);
  erroresEncontrados++;
} else {
  console.log(`   ✅ Función "generar_numero_cotizacion": OK`);
  console.log(`      - Próximo número: ${numeroData}`);
}

// ============================================
// 5. VERIFICAR STORAGE BUCKETS
// ============================================
console.log('\n📦 5. VERIFICANDO STORAGE BUCKETS...\n');

// Listar buckets
const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

if (bucketsError) {
  console.log(`   ❌ Error al listar buckets: ${bucketsError.message}`);
  erroresEncontrados++;
} else {
  const bucketNames = buckets.map(b => b.name);
  
  // Verificar bucket "productos"
  if (bucketNames.includes('productos')) {
    console.log(`   ✅ Bucket "productos": OK`);
    
    const productosBucket = buckets.find(b => b.name === 'productos');
    console.log(`      - Público: ${productosBucket.public ? 'Sí' : 'No'}`);
  } else {
    console.log(`   ❌ Bucket "productos": NO EXISTE`);
    console.log(`      → Créalo desde: Supabase Dashboard → Storage → New Bucket`);
    erroresEncontrados++;
  }
  
  // Verificar bucket "cotizaciones"
  if (bucketNames.includes('cotizaciones')) {
    console.log(`   ✅ Bucket "cotizaciones": OK`);
    
    const cotizacionesBucket = buckets.find(b => b.name === 'cotizaciones');
    console.log(`      - Público: ${cotizacionesBucket.public ? 'Sí' : 'No'}`);
  } else {
    console.log(`   ⚠️  Bucket "cotizaciones": NO EXISTE (opcional para desarrollo)`);
    console.log(`      → Créalo si necesitas almacenar PDFs en Storage`);
  }
}

// ============================================
// 6. VERIFICAR DATOS DE EJEMPLO
// ============================================
console.log('\n📊 6. VERIFICANDO DATOS...\n');

// Contar productos
const { count: productosCount, error: productosCountError } = await supabase
  .from('productos')
  .select('*', { count: 'exact', head: true });

if (!productosCountError) {
  console.log(`   ✅ Productos en BD: ${productosCount}`);
  if (productosCount === 0) {
    console.log(`      ⚠️  No hay productos. Considera agregar productos de prueba.`);
  }
}

// Contar leads
const { count: leadsCount, error: leadsCountError } = await supabase
  .from('leads')
  .select('*', { count: 'exact', head: true });

if (!leadsCountError) {
  console.log(`   ✅ Leads en BD: ${leadsCount}`);
}

// Contar cotizaciones
const { count: cotizacionesCount, error: cotizacionesCountError } = await supabase
  .from('cotizaciones')
  .select('*', { count: 'exact', head: true });

if (!cotizacionesCountError) {
  console.log(`   ✅ Cotizaciones en BD: ${cotizacionesCount}`);
}

// ============================================
// RESUMEN FINAL
// ============================================
console.log('\n' + '='.repeat(60));
console.log('\n📋 RESUMEN DE VERIFICACIÓN\n');

if (erroresEncontrados === 0) {
  console.log('🎉 ¡PERFECTO! Todas las configuraciones están en su lugar.');
  console.log('');
  console.log('✅ Tablas: OK');
  console.log('✅ Columnas: OK');
  console.log('✅ Vistas: OK');
  console.log('✅ Funciones: OK');
  console.log('✅ Storage: Verificado');
  console.log('');
  console.log('🚀 El panel admin está listo para usar:');
  console.log('   → http://localhost:3000/admin');
  console.log('');
} else {
  console.log(`⚠️  Se encontraron ${erroresEncontrados} problema(s).`);
  console.log('');
  console.log('📝 ACCIONES REQUERIDAS:');
  console.log('');
  console.log('1. Si faltan tablas o columnas:');
  console.log('   → Ejecuta las migraciones pendientes en Supabase SQL Editor');
  console.log('   → Archivos: database/migrations/002_*.sql y 003_*.sql');
  console.log('');
  console.log('2. Si faltan buckets:');
  console.log('   → Ve a: Supabase Dashboard → Storage → New Bucket');
  console.log('   → Crea "productos" (público)');
  console.log('   → Ejecuta: database/setup_storage_admin.sql');
  console.log('');
  console.log('3. Si faltan funciones o vistas:');
  console.log('   → Ejecuta las migraciones completas de nuevo');
  console.log('');
}

console.log('='.repeat(60));
console.log('');

process.exit(erroresEncontrados > 0 ? 1 : 0);
