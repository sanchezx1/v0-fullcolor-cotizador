/**
 * Script para inspeccionar el schema real de Supabase
 * Conecta directamente a la BD y extrae toda la estructura
 */

import { createClient } from '@supabase/supabase-js';

// Credenciales desde .env.local
const SUPABASE_URL = 'https://cxhjxponouukrnuxdhyz.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aGp4cG9ub3V1a3JudXhkaHl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY0NjcwMCwiZXhwIjoyMDc2MjIyNzAwfQ.eb3sSe_A1dyMtYLfVhoPYlewBYFhi62aZMILun4oLOg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function inspectDatabase() {
  console.log('🔍 INSPECCIONANDO BASE DE DATOS REAL DE SUPABASE...\n');
  console.log('='.repeat(80));
  
  try {
    // 1. Listar todas las tablas
    console.log('\n📋 1. TABLAS EXISTENTES:');
    console.log('-'.repeat(80));
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      })
      .catch(async () => {
        // Fallback: usar query directa
        return await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_type', 'BASE TABLE');
      });

    // Como RPC puede no estar disponible, hacemos queries directas
    const tableNames = ['productos', 'leads', 'cotizaciones', 'items_cotizacion', 'eventos', 'precios_escalonados'];
    
    for (const tableName of tableNames) {
      console.log(`\n📊 Tabla: ${tableName.toUpperCase()}`);
      console.log('-'.repeat(80));
      
      // Obtener estructura de columnas usando query SQL directa
      const { data: columns, error } = await supabase.rpc('get_table_columns', {
        table_name: tableName
      }).catch(async () => {
        // Si RPC no funciona, hacemos un SELECT simple para ver qué datos hay
        const { data, error: selectError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (selectError) {
          console.log(`   ⚠️  Error al acceder: ${selectError.message}`);
          return { data: null, error: selectError };
        }
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]).map(key => ({
            column_name: key,
            data_type: typeof data[0][key]
          }));
          return { data: columns, error: null };
        }
        
        return { data: [], error: null };
      });
      
      if (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
        continue;
      }
      
      if (columns && columns.length > 0) {
        console.log('   Columnas:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
      }
      
      // Contar registros
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        console.log(`   📊 Total registros: ${count || 0}`);
      }
    }
    
    // 2. Verificar constraints
    console.log('\n\n🔒 2. CONSTRAINTS (CHECK, UNIQUE, FK):');
    console.log('-'.repeat(80));
    
    // Probar insertar datos de prueba para ver qué constraints existen
    console.log('\nVerificando constraints de "cotizaciones.estado"...');
    const { error: testEstado } = await supabase
      .from('cotizaciones')
      .select('estado')
      .limit(1);
    
    if (!testEstado) {
      console.log('✓ Campo "estado" existe en cotizaciones');
    }
    
    console.log('\nVerificando constraints de "eventos.tipo"...');
    const { error: testTipo } = await supabase
      .from('eventos')
      .select('tipo')
      .limit(1);
    
    if (!testTipo) {
      console.log('✓ Campo "tipo" existe en eventos');
    }
    
    // 3. Verificar vistas
    console.log('\n\n👁️  3. VISTAS EXISTENTES:');
    console.log('-'.repeat(80));
    
    const views = ['estadisticas_dashboard', 'productos_top_cotizados'];
    for (const viewName of views) {
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Vista "${viewName}": NO EXISTE`);
      } else {
        console.log(`✓ Vista "${viewName}": EXISTE`);
        if (data && data.length > 0) {
          console.log(`   Columnas: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    }
    
    // 4. Verificar funciones
    console.log('\n\n⚙️  4. FUNCIONES EXISTENTES:');
    console.log('-'.repeat(80));
    
    // Intentar ejecutar función
    const { data: numeroTest, error: funcError } = await supabase
      .rpc('generar_numero_cotizacion')
      .catch(e => ({ data: null, error: e }));
    
    if (funcError) {
      console.log('❌ Función "generar_numero_cotizacion": NO EXISTE');
      console.log(`   Error: ${funcError.message}`);
    } else {
      console.log('✓ Función "generar_numero_cotizacion": EXISTE');
      console.log(`   Resultado de prueba: ${numeroTest}`);
    }
    
    // 5. Datos de ejemplo
    console.log('\n\n📦 5. DATOS DE EJEMPLO:');
    console.log('-'.repeat(80));
    
    // Productos
    const { data: productos, error: prodError } = await supabase
      .from('productos')
      .select('*')
      .limit(3);
    
    if (!prodError && productos) {
      console.log(`\n✓ Productos (${productos.length} de muestra):`);
      productos.forEach(p => {
        console.log(`   - ID: ${p.id} | Nombre: ${p.nombre} | SKU: ${p.sku || 'SIN SKU'}`);
      });
    }
    
    // Leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(3);
    
    if (!leadsError && leads) {
      console.log(`\n✓ Leads (${leads.length} de muestra):`);
      leads.forEach(l => {
        console.log(`   - ID: ${l.id} | Email: ${l.email} | RUC: ${l.ruc_cedula || 'SIN RUC'} | Ciudad: ${l.ciudad || 'SIN CIUDAD'}`);
      });
    }
    
    // Cotizaciones
    const { data: cotizaciones, error: cotError } = await supabase
      .from('cotizaciones')
      .select('*')
      .limit(3);
    
    if (!cotError && cotizaciones) {
      console.log(`\n✓ Cotizaciones (${cotizaciones.length} de muestra):`);
      cotizaciones.forEach(c => {
        console.log(`   - ID: ${c.id} | Número: ${c.numero || 'SIN NÚMERO'} | Estado: ${c.estado} | Total: $${c.total}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ INSPECCIÓN COMPLETADA\n');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error);
  }
}

// Ejecutar inspección
inspectDatabase().then(() => {
  console.log('\n🎯 Siguiente paso: Usar esta información para generar migraciones correctas');
  process.exit(0);
}).catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});
