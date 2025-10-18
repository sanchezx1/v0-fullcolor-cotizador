// Script de diagnóstico para verificar conexión a Supabase
// Ejecutar en la consola del navegador (F12)

console.log('🔍 Diagnóstico de Supabase...')

// Verificar variables de entorno
console.log('📋 Variables de entorno:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada')

// Importar Supabase client
import { supabase } from './src/services/supabaseClient'

// Probar conexión básica
async function testSupabaseConnection() {
  try {
    console.log('🔌 Probando conexión a Supabase...')
    
    // Probar una consulta simple
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre')
      .limit(1)
    
    if (error) {
      console.error('❌ Error en consulta:', error)
      return false
    }
    
    console.log('✅ Conexión exitosa:', data)
    return true
  } catch (err) {
    console.error('❌ Error de conexión:', err)
    return false
  }
}

// Probar inserción en leads
async function testLeadInsertion() {
  try {
    console.log('🧪 Probando inserción en leads...')
    
    const testLead = {
      nombre: 'Test Lead',
      email: 'test@example.com',
      telefono: '0999999999',
      empresa: 'Test Company',
      ruc_cedula: '1234567890',
      ciudad: 'Quito'
    }
    
    const { data, error } = await supabase
      .from('leads')
      .insert(testLead)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error insertando lead:', error)
      console.error('Detalles del error:', JSON.stringify(error, null, 2))
      return false
    }
    
    console.log('✅ Lead insertado exitosamente:', data)
    
    // Limpiar el lead de prueba
    await supabase.from('leads').delete().eq('id', data.id)
    console.log('🧹 Lead de prueba eliminado')
    
    return true
  } catch (err) {
    console.error('❌ Error en inserción:', err)
    return false
  }
}

// Ejecutar diagnósticos
async function runDiagnostics() {
  console.log('🚀 Iniciando diagnósticos...')
  
  const connectionOk = await testSupabaseConnection()
  if (!connectionOk) {
    console.log('❌ Falló la conexión básica. Revisa las credenciales.')
    return
  }
  
  const insertionOk = await testLeadInsertion()
  if (!insertionOk) {
    console.log('❌ Falló la inserción. Revisa las políticas RLS.')
    return
  }
  
  console.log('✅ Todos los diagnósticos pasaron correctamente!')
}

// Ejecutar
runDiagnostics()
