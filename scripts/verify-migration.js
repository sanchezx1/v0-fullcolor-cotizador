/**
 * Script para verificar que la migración 003 se aplicó correctamente
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cxhjxponouukrnuxdhyz.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aGp4cG9ub3V1a3JudXhkaHl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY0NjcwMCwiZXhwIjoyMDc2MjIyNzAwfQ.eb3sSe_A1dyMtYLfVhoPYlewBYFhi62aZMILun4oLOg';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verify() {
  console.log('🔍 VERIFICANDO MIGRACIÓN 003...\n');
  
  let allOk = true;
  
  // 1. Verificar cotizaciones.numero
  console.log('1️⃣  Verificando cotizaciones.numero...');
  const { data: cotizaciones, error: cotError } = await supabase
    .from('cotizaciones')
    .select('id, numero, estado, total')
    .order('id');
  
  if (cotError) {
    console.log(`   ❌ Error: ${cotError.message}`);
    allOk = false;
  } else if (cotizaciones) {
    const sinNumero = cotizaciones.filter(c => !c.numero);
    if (sinNumero.length > 0) {
      console.log(`   ❌ Hay ${sinNumero.length} cotizaciones SIN número`);
      allOk = false;
    } else {
      console.log(`   ✅ Todas las ${cotizaciones.length} cotizaciones tienen número`);
      console.log('\n   Números asignados:');
      cotizaciones.forEach(c => {
        console.log(`      ${c.numero} → Estado: ${c.estado}, Total: $${c.total}`);
      });
    }
  }
  
  // 2. Verificar eventos.descripcion
  console.log('\n2️⃣  Verificando eventos.descripcion...');
  const { data: eventos, error: evError } = await supabase
    .from('eventos')
    .select('id, tipo, descripcion')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (evError) {
    console.log(`   ❌ Error: ${evError.message}`);
    allOk = false;
  } else if (eventos) {
    console.log(`   ✅ Campo "descripcion" existe`);
    console.log('\n   Últimos 5 eventos:');
    eventos.forEach(e => {
      const desc = e.descripcion || '(sin descripción)';
      console.log(`      [${e.tipo}] ${desc.substring(0, 50)}`);
    });
  }
  
  // 3. Verificar función generar_numero_cotizacion
  console.log('\n3️⃣  Verificando función generar_numero_cotizacion()...');
  const { data: nuevoNumero, error: funcError } = await supabase
    .rpc('generar_numero_cotizacion');
  
  if (funcError) {
    console.log(`   ❌ Error: ${funcError.message}`);
    allOk = false;
  } else {
    console.log(`   ✅ Función funciona correctamente`);
    console.log(`   📋 Próximo número: ${nuevoNumero}`);
  }
  
  // 4. Verificar vistas
  console.log('\n4️⃣  Verificando vistas...');
  
  const { data: dashboard, error: dashError } = await supabase
    .from('estadisticas_dashboard')
    .select('*')
    .single();
  
  if (dashError) {
    console.log(`   ❌ Vista estadisticas_dashboard: ${dashError.message}`);
    allOk = false;
  } else {
    console.log(`   ✅ Vista estadisticas_dashboard funciona`);
    console.log(`      Total cotizaciones: ${dashboard.total_cotizaciones}`);
    console.log(`      Productos activos: ${dashboard.productos_activos}`);
    console.log(`      Total leads: ${dashboard.total_leads}`);
  }
  
  const { data: topProductos, error: topError } = await supabase
    .from('productos_top_cotizados')
    .select('*')
    .limit(3);
  
  if (topError) {
    console.log(`   ❌ Vista productos_top_cotizados: ${topError.message}`);
    allOk = false;
  } else {
    console.log(`   ✅ Vista productos_top_cotizados funciona`);
    console.log(`\n   Top 3 productos:`);
    topProductos.forEach((p, i) => {
      console.log(`      ${i + 1}. ${p.nombre} (${p.veces_cotizado} veces)`);
    });
  }
  
  // 5. Resumen final
  console.log('\n' + '='.repeat(80));
  if (allOk) {
    console.log('✅ TODAS LAS VERIFICACIONES PASARON');
    console.log('🚀 La base de datos está lista para el panel admin');
    console.log('\n📍 Próximos pasos:');
    console.log('   1. Navega a http://localhost:3000/admin');
    console.log('   2. Verifica que el dashboard cargue correctamente');
    console.log('   3. Revisa los KPIs y gráficos');
  } else {
    console.log('❌ ALGUNAS VERIFICACIONES FALLARON');
    console.log('⚠️  Revisa los errores arriba y ejecuta la migración 003');
  }
  console.log('='.repeat(80) + '\n');
}

verify().catch(console.error);
