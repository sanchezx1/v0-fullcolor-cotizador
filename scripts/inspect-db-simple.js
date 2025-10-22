/**
 * Script simplificado para inspeccionar Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cxhjxponouukrnuxdhyz.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aGp4cG9ub3V1a3JudXhkaHl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY0NjcwMCwiZXhwIjoyMDc2MjIyNzAwfQ.eb3sSe_A1dyMtYLfVhoPYlewBYFhi62aZMILun4oLOg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function inspect() {
  console.log('🔍 INSPECCIONANDO SUPABASE...\n');
  
  const tables = ['productos', 'leads', 'cotizaciones', 'items_cotizacion', 'eventos', 'precios_escalonados'];
  
  for (const table of tables) {
    console.log(`\n📊 TABLA: ${table.toUpperCase()}`);
    console.log('='.repeat(80));
    
    try {
      // Obtener un registro de muestra para ver columnas
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        continue;
      }
      
      console.log(`📊 Total registros: ${count || 0}`);
      
      if (data && data.length > 0) {
        console.log('\n✅ Columnas encontradas:');
        Object.keys(data[0]).forEach(col => {
          const value = data[0][col];
          const type = value === null ? 'NULL' : typeof value;
          console.log(`   - ${col}: ${type} = ${JSON.stringify(value).substring(0, 50)}`);
        });
      } else {
        console.log('⚠️  Tabla vacía, no se pueden inferir columnas');
      }
      
    } catch (err) {
      console.log(`❌ Error al acceder: ${err.message}`);
    }
  }
  
  // Verificar vistas
  console.log('\n\n👁️  VISTAS:');
  console.log('='.repeat(80));
  
  const views = ['estadisticas_dashboard', 'productos_top_cotizados'];
  for (const view of views) {
    try {
      const { data, error } = await supabase.from(view).select('*').limit(1);
      if (error) {
        console.log(`❌ ${view}: NO EXISTE (${error.message})`);
      } else {
        console.log(`✅ ${view}: EXISTE`);
        if (data && data.length > 0) {
          console.log(`   Columnas: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${view}: Error - ${err.message}`);
    }
  }
  
  // Verificar función
  console.log('\n\n⚙️  FUNCIONES:');
  console.log('='.repeat(80));
  
  try {
    const { data, error } = await supabase.rpc('generar_numero_cotizacion');
    if (error) {
      console.log(`❌ generar_numero_cotizacion: NO EXISTE (${error.message})`);
    } else {
      console.log(`✅ generar_numero_cotizacion: EXISTE`);
      console.log(`   Resultado: ${data}`);
    }
  } catch (err) {
    console.log(`❌ generar_numero_cotizacion: Error - ${err.message}`);
  }
  
  // Verificar duplicados de email
  console.log('\n\n🔍 VERIFICAR DUPLICADOS EN LEADS:');
  console.log('='.repeat(80));
  
  try {
    const { data: allLeads } = await supabase
      .from('leads')
      .select('id, email, created_at')
      .order('email');
    
    if (allLeads) {
      const emailCounts = {};
      allLeads.forEach(lead => {
        if (lead.email) {
          emailCounts[lead.email] = (emailCounts[lead.email] || 0) + 1;
        }
      });
      
      const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1);
      
      if (duplicates.length > 0) {
        console.log(`⚠️  ENCONTRADOS ${duplicates.length} emails duplicados:`);
        duplicates.forEach(([email, count]) => {
          console.log(`   - ${email}: ${count} veces`);
        });
      } else {
        console.log('✅ No hay emails duplicados');
      }
    }
  } catch (err) {
    console.log(`❌ Error al verificar: ${err.message}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ INSPECCIÓN COMPLETADA\n');
}

inspect().catch(console.error);
