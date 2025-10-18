// Script de diagnóstico para Edge Functions
// Ejecutar en la consola del navegador (F12)

console.log('🔍 Diagnóstico de Edge Functions...')

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

// Probar Edge Function
async function testEdgeFunction() {
  try {
    console.log('⚡ Probando Edge Function generate-pdf...')
    
    const { data, error } = await supabase.functions.invoke('generate-pdf', {
      body: { quoteId: 1 }
    })
    
    if (error) {
      console.error('❌ Error llamando Edge Function:', error)
      console.error('Detalles del error:', JSON.stringify(error, null, 2))
      return false
    }
    
    console.log('✅ Edge Function respondió:', data)
    return true
  } catch (err) {
    console.error('❌ Error en Edge Function:', err)
    return false
  }
}

// Probar Storage
async function testStorage() {
  try {
    console.log('🗄️ Probando acceso a Storage...')
    
    const { data, error } = await supabase.storage
      .from('cotizaciones')
      .list()
    
    if (error) {
      console.error('❌ Error accediendo Storage:', error)
      return false
    }
    
    console.log('✅ Storage accesible:', data)
    return true
  } catch (err) {
    console.error('❌ Error en Storage:', err)
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
  
  const storageOk = await testStorage()
  if (!storageOk) {
    console.log('⚠️ Storage no configurado. Ejecuta el script setup_storage.sql')
  }
  
  const edgeFunctionOk = await testEdgeFunction()
  if (!edgeFunctionOk) {
    console.log('❌ Edge Function no disponible. Verifica:')
    console.log('1. Edge Function desplegada en Supabase')
    console.log('2. Nombre correcto: generate-pdf')
    console.log('3. Código actualizado')
  }
  
  if (connectionOk && storageOk && edgeFunctionOk) {
    console.log('✅ Todos los diagnósticos pasaron correctamente!')
  } else {
    console.log('⚠️ Algunos componentes necesitan configuración')
  }
}

// Ejecutar
runDiagnostics()
