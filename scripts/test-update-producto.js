/**
 * Script para probar actualización de productos con imágenes
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpdateProducto() {
  console.log('🧪 Probando actualización de producto...\n')
  
  // 1. Obtener el primer producto
  console.log('1️⃣ Obteniendo producto ID=1...')
  const { data: producto, error: getError } = await supabase
    .from('productos')
    .select('*')
    .eq('id', 1)
    .single()
  
  if (getError) {
    console.error('❌ Error obteniendo producto:', getError.message)
    return
  }
  
  console.log('✅ Producto obtenido:', producto.nombre)
  console.log('   SKU:', producto.sku)
  console.log('   Imagen actual:', producto.imagen_url || 'Sin imagen')
  
  // 2. Crear imagen de prueba
  console.log('\n2️⃣ Creando imagen de prueba...')
  const testImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )
  const testFileName = `test-update-${Date.now()}.png`
  
  // 3. Subir imagen
  console.log('3️⃣ Subiendo imagen...')
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('productos')
    .upload(testFileName, testImage, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    })
  
  if (uploadError) {
    console.error('❌ Error subiendo imagen:', uploadError.message)
    console.error('   Detalle:', uploadError)
    return
  }
  
  console.log('✅ Imagen subida:', uploadData.path)
  
  // 4. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('productos')
    .getPublicUrl(uploadData.path)
  
  console.log('   URL pública:', publicUrl)
  
  // 5. Actualizar producto con nueva imagen
  console.log('\n4️⃣ Actualizando producto...')
  const { data: updatedProducto, error: updateError } = await supabase
    .from('productos')
    .update({
      imagen_url: publicUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1)
    .select()
    .single()
  
  if (updateError) {
    console.error('❌ Error actualizando producto:', updateError.message)
    console.error('   Código:', updateError.code)
    console.error('   Detalle:', updateError.details)
    console.error('   Hint:', updateError.hint)
    return
  }
  
  console.log('✅ Producto actualizado exitosamente')
  console.log('   Nueva imagen URL:', updatedProducto.imagen_url)
  
  // 6. Restaurar producto
  console.log('\n5️⃣ Restaurando producto...')
  const { error: restoreError } = await supabase
    .from('productos')
    .update({
      imagen_url: producto.imagen_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1)
  
  if (restoreError) {
    console.warn('⚠️  Advertencia: No se pudo restaurar producto')
  } else {
    console.log('✅ Producto restaurado')
  }
  
  // 7. Limpiar imagen de prueba
  console.log('\n6️⃣ Limpiando imagen de prueba...')
  const { error: deleteError } = await supabase.storage
    .from('productos')
    .remove([testFileName])
  
  if (deleteError) {
    console.warn('⚠️  Advertencia: No se pudo eliminar imagen de prueba')
  } else {
    console.log('✅ Imagen de prueba eliminada')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🎉 PRUEBA COMPLETADA EXITOSAMENTE')
  console.log('   La actualización de productos con imágenes funciona correctamente')
  console.log('='.repeat(60))
}

testUpdateProducto().catch(error => {
  console.error('\n💥 Error inesperado:', error)
  process.exit(1)
})
