// Script para probar conexión a Supabase desde el navegador
// Copiar y pegar en la consola del navegador (F12)

console.log('🔍 Probando conexión a Supabase...')

// Función para probar la conexión
async function testSupabase() {
  try {
    // Importar el cliente de Supabase
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2')
    
    // Obtener las variables de entorno (deberían estar disponibles en el navegador)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('📋 Variables de entorno:')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ No configurada')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables de entorno no configuradas')
      return
    }
    
    // Crear cliente
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Probar consulta simple
    console.log('🔌 Probando consulta a productos...')
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre')
      .limit(1)
    
    if (productosError) {
      console.error('❌ Error consultando productos:', productosError)
    } else {
      console.log('✅ Productos consultados:', productos)
    }
    
    // Probar inserción en leads
    console.log('🧪 Probando inserción en leads...')
    const testLead = {
      nombre: 'Test Lead',
      email: 'test@example.com',
      telefono: '0999999999',
      empresa: 'Test Company',
      ruc_cedula: '1234567890',
      ciudad: 'Quito'
    }
    
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(testLead)
      .select()
      .single()
    
    if (leadError) {
      console.error('❌ Error insertando lead:', leadError)
      console.error('Detalles:', JSON.stringify(leadError, null, 2))
    } else {
      console.log('✅ Lead insertado:', lead)
      
      // Limpiar
      await supabase.from('leads').delete().eq('id', lead.id)
      console.log('🧹 Lead de prueba eliminado')
    }
    
  } catch (err) {
    console.error('❌ Error general:', err)
  }
}

// Ejecutar prueba
testSupabase()
