/**
 * Script para diagnosticar y arreglar políticas de Storage en Supabase
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verificarBuckets() {
  console.log('\n📦 Verificando buckets...')
  
  const { data: buckets, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.error('❌ Error listando buckets:', error.message)
    return false
  }
  
  const productosExists = buckets.find(b => b.name === 'productos')
  const cotizacionesExists = buckets.find(b => b.name === 'cotizaciones')
  
  console.log('   productos:', productosExists ? '✅ Existe' : '❌ No existe')
  console.log('   cotizaciones:', cotizacionesExists ? '✅ Existe' : '❌ No existe')
  
  return productosExists && cotizacionesExists
}

async function crearBucketSiNoExiste(nombre) {
  console.log(`\n🔧 Creando bucket: ${nombre}...`)
  
  const { data, error } = await supabase.storage.createBucket(nombre, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  })
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`   ✅ Bucket ${nombre} ya existe`)
      return true
    }
    console.error(`   ❌ Error creando bucket ${nombre}:`, error.message)
    return false
  }
  
  console.log(`   ✅ Bucket ${nombre} creado exitosamente`)
  return true
}

async function testUploadImagen() {
  console.log('\n🧪 Probando subida de imagen de prueba...')
  
  // Crear un archivo de prueba pequeño (1x1 pixel PNG)
  const testFile = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )
  
  const fileName = `test-${Date.now()}.png`
  
  try {
    // Intentar subir
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('productos')
      .upload(fileName, testFile, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('   ❌ Error subiendo imagen:', uploadError.message)
      console.error('   Detalle:', uploadError)
      return false
    }
    
    console.log('   ✅ Imagen subida exitosamente')
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('productos')
      .getPublicUrl(uploadData.path)
    
    console.log('   📎 URL pública:', publicUrl)
    
    // Limpiar: eliminar imagen de prueba
    const { error: deleteError } = await supabase.storage
      .from('productos')
      .remove([fileName])
    
    if (deleteError) {
      console.warn('   ⚠️  Advertencia: No se pudo eliminar imagen de prueba')
    } else {
      console.log('   🗑️  Imagen de prueba eliminada')
    }
    
    return true
    
  } catch (error) {
    console.error('   ❌ Error inesperado:', error.message)
    return false
  }
}

async function ejecutarSQL() {
  console.log('\n🔧 Ejecutando SQL para arreglar políticas...')
  
  const sql = `
-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "Public read access for productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update productos images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete productos images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update cotizaciones PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete cotizaciones PDFs" ON storage.objects;

-- Limpiar políticas públicas si existen
DROP POLICY IF EXISTS "productos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "productos_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "productos_public_update" ON storage.objects;
DROP POLICY IF EXISTS "productos_public_delete" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_public_read" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_public_update" ON storage.objects;
DROP POLICY IF EXISTS "cotizaciones_public_delete" ON storage.objects;

-- Crear políticas públicas para productos
CREATE POLICY "productos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');

CREATE POLICY "productos_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'productos');

CREATE POLICY "productos_public_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'productos')
WITH CHECK (bucket_id = 'productos');

CREATE POLICY "productos_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'productos');

-- Crear políticas públicas para cotizaciones
CREATE POLICY "cotizaciones_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'cotizaciones');

CREATE POLICY "cotizaciones_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cotizaciones');

CREATE POLICY "cotizaciones_public_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cotizaciones')
WITH CHECK (bucket_id = 'cotizaciones');

CREATE POLICY "cotizaciones_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'cotizaciones');
  `.trim()
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
  
  if (error) {
    console.error('   ❌ Error ejecutando SQL:', error.message)
    console.log('\n⚠️  El RPC exec_sql no está disponible.')
    console.log('   Por favor, ejecuta manualmente el archivo:')
    console.log('   database/fix_storage_policies_public.sql')
    console.log('   en el SQL Editor de Supabase Dashboard')
    return false
  }
  
  console.log('   ✅ SQL ejecutado exitosamente')
  return true
}

async function main() {
  console.log('🚀 Iniciando diagnóstico y corrección de Storage...')
  console.log('=' .repeat(60))
  
  // 1. Verificar buckets
  const bucketsOk = await verificarBuckets()
  
  // 2. Crear buckets si no existen
  if (!bucketsOk) {
    await crearBucketSiNoExiste('productos')
    await crearBucketSiNoExiste('cotizaciones')
  }
  
  // 3. Ejecutar SQL (si está disponible)
  console.log('\n📋 IMPORTANTE:')
  console.log('   Ejecuta el siguiente archivo SQL manualmente:')
  console.log('   database/fix_storage_policies_public.sql')
  console.log('   en Supabase Dashboard → SQL Editor')
  
  // 4. Probar subida de imagen
  await new Promise(resolve => setTimeout(resolve, 2000)) // Esperar 2s
  const uploadOk = await testUploadImagen()
  
  // Resumen final
  console.log('\n' + '=' .repeat(60))
  console.log('📊 RESUMEN:')
  console.log('   Buckets:', bucketsOk ? '✅' : '⚠️')
  console.log('   Subida de imagen:', uploadOk ? '✅' : '❌')
  console.log('=' .repeat(60))
  
  if (uploadOk) {
    console.log('\n🎉 ¡TODO ESTÁ FUNCIONANDO!')
    console.log('   Ahora puedes subir imágenes desde el panel admin')
  } else {
    console.log('\n⚠️  ACCIÓN REQUERIDA:')
    console.log('   1. Ve a Supabase Dashboard → SQL Editor')
    console.log('   2. Ejecuta: database/fix_storage_policies_public.sql')
    console.log('   3. Vuelve a ejecutar este script: node scripts/fix-storage-policies.js')
  }
}

main().catch(console.error)
