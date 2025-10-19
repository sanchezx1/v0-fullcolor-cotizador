// Script de prueba para verificar conexión con Supabase
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Verificando conexión con Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? 'Presente' : 'Ausente')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('📡 Probando conexión...')
    
    // Probar lectura de productos
    const { data: products, error: productsError } = await supabase
      .from('productos')
      .select('id, nombre')
      .limit(3)
    
    if (productsError) {
      console.error('❌ Error leyendo productos:', productsError.message)
      return false
    }
    
    console.log('✅ Conexión exitosa. Productos encontrados:', products?.length || 0)
    
    // Probar Edge Function
    console.log('🔧 Probando Edge Function...')
    const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-pdf', {
      body: { quoteId: 1 }
    })
    
    if (functionError) {
      console.error('❌ Error en Edge Function:', functionError.message)
      return false
    }
    
    console.log('✅ Edge Function responde correctamente')
    console.log('📄 Respuesta:', functionData)
    
    return true
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 Todas las pruebas pasaron exitosamente')
  } else {
    console.log('💥 Algunas pruebas fallaron')
    process.exit(1)
  }
})
