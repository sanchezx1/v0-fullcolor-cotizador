// Script de prueba para verificar la conexión con Supabase
// Ejecutar con: npm run test:supabase

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Leer variables de entorno desde .env.local
let envContent = ''
try {
  envContent = readFileSync('.env.local', 'utf8')
} catch (error) {
  console.error('❌ No se pudo leer el archivo .env.local')
  console.log('Asegúrate de que el archivo .env.local existe en la raíz del proyecto')
  process.exit(1)
}

// Parsear variables de entorno
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local')
  console.log('Variables encontradas:', Object.keys(envVars))
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...')
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('productos')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Error de conexión:', error.message)
      return false
    }
    
    console.log('✅ Conexión exitosa con Supabase')
    
    // Probar lectura de productos
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, categoria')
      .limit(5)
    
    if (productosError) {
      console.error('❌ Error leyendo productos:', productosError.message)
      return false
    }
    
    console.log('✅ Productos encontrados:', productos.length)
    console.log('📋 Primeros productos:')
    productos.forEach(p => console.log(`  - ${p.nombre} (${p.categoria})`))
    
    // Probar lectura de precios escalonados
    const { data: precios, error: preciosError } = await supabase
      .from('precios_escalonados')
      .select('producto_id, cantidad_min, precio_unitario')
      .limit(5)
    
    if (preciosError) {
      console.error('❌ Error leyendo precios:', preciosError.message)
      return false
    }
    
    console.log('✅ Precios escalonados encontrados:', precios.length)
    console.log('💰 Primeros precios:')
    precios.forEach(p => console.log(`  - Producto ${p.producto_id}: ${p.cantidad_min}+ = $${p.precio_unitario}`))
    
    console.log('\n🎉 ¡Todas las pruebas pasaron! La configuración está correcta.')
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    return false
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
