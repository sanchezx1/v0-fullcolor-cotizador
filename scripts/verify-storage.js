// Script para verificar la configuración del Storage de Supabase
// Ejecutar con: node scripts/verify-storage.js

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Leer variables de entorno desde .env.local
let envContent = ''
try {
  envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
} catch (error) {
  console.error('❌ No se pudo leer el archivo .env.local')
  console.log('\n📝 Por favor crea el archivo .env.local en la raíz del proyecto con:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key')
  console.log('\nPuedes copiar env.example y renombrarlo a .env.local')
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
  process.exit(1)
}

console.log('🔑 Usando credenciales:')
console.log('   URL:', supabaseUrl)
console.log('   Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyStorage() {
  console.log('\n🔍 Verificando configuración del Storage...\n')
  
  let hasErrors = false
  
  try {
    // 1. Verificar que el bucket existe
    console.log('📦 1. Verificando bucket "cotizaciones"...')
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketsError) {
      console.error('   ❌ Error obteniendo buckets:', bucketsError.message)
      hasErrors = true
    } else {
      const cotizacionesBucket = buckets.find(b => b.id === 'cotizaciones')
      
      if (cotizacionesBucket) {
        console.log('   ✅ Bucket "cotizaciones" existe')
        console.log('   📋 Configuración:')
        console.log(`      - Público: ${cotizacionesBucket.public ? '✅ Sí' : '❌ No'}`)
        console.log(`      - Tamaño máximo: ${cotizacionesBucket.file_size_limit ? (cotizacionesBucket.file_size_limit / 1048576).toFixed(2) + ' MB' : 'Sin límite'}`)
        console.log(`      - Tipos permitidos: ${cotizacionesBucket.allowed_mime_types || 'Todos'}`)
        
        if (!cotizacionesBucket.public) {
          console.log('   ⚠️  WARNING: El bucket NO es público. Los PDFs no serán accesibles sin autenticación.')
          hasErrors = true
        }
      } else {
        console.log('   ❌ Bucket "cotizaciones" NO existe')
        console.log('   📝 Debes ejecutar el script database/setup_storage.sql en Supabase')
        hasErrors = true
      }
    }
    
    // 2. Intentar listar archivos (probar permisos de lectura)
    console.log('\n📂 2. Verificando permisos de lectura...')
    
    const { data: files, error: listError } = await supabase
      .storage
      .from('cotizaciones')
      .list()
    
    if (listError) {
      console.log('   ⚠️  No se puede listar archivos:', listError.message)
      console.log('   ℹ️  Esto es normal si el bucket está vacío o no existe')
    } else {
      console.log(`   ✅ Permisos de lectura OK (${files.length} archivo(s) encontrado(s))`)
      if (files.length > 0) {
        console.log('   📄 Archivos existentes:')
        files.slice(0, 5).forEach(f => {
          console.log(`      - ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`)
        })
        if (files.length > 5) {
          console.log(`      ... y ${files.length - 5} más`)
        }
      }
    }
    
    // 3. Intentar subir un archivo de prueba
    console.log('\n📤 3. Verificando permisos de escritura...')
    
    const testFileName = `test-${Date.now()}.txt`
    const testContent = 'Este es un archivo de prueba para verificar permisos de escritura en Storage de Supabase'
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('cotizaciones')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: false
      })
    
    if (uploadError) {
      console.log('   ❌ No se puede subir archivos:', uploadError.message)
      console.log('   📝 Posibles causas:')
      console.log('      - El bucket no existe')
      console.log('      - Las políticas RLS no permiten inserción')
      console.log('      - Faltan permisos en la API key')
      hasErrors = true
    } else {
      console.log('   ✅ Permisos de escritura OK')
      console.log(`   📄 Archivo de prueba subido: ${testFileName}`)
      
      // 4. Intentar obtener URL pública
      console.log('\n🔗 4. Verificando URL pública...')
      
      const { data: urlData } = supabase
        .storage
        .from('cotizaciones')
        .getPublicUrl(testFileName)
      
      if (urlData && urlData.publicUrl) {
        console.log('   ✅ URL pública generada correctamente')
        console.log(`   🌐 URL: ${urlData.publicUrl}`)
      } else {
        console.log('   ❌ No se pudo generar URL pública')
        hasErrors = true
      }
      
      // 5. Limpiar: eliminar archivo de prueba
      console.log('\n🧹 5. Limpiando archivo de prueba...')
      
      const { error: deleteError } = await supabase
        .storage
        .from('cotizaciones')
        .remove([testFileName])
      
      if (deleteError) {
        console.log('   ⚠️  No se pudo eliminar el archivo de prueba:', deleteError.message)
        console.log('   ℹ️  Puedes eliminarlo manualmente desde el Dashboard')
      } else {
        console.log('   ✅ Archivo de prueba eliminado')
      }
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60))
    if (hasErrors) {
      console.log('❌ HAY PROBLEMAS CON LA CONFIGURACIÓN DEL STORAGE')
      console.log('\n📝 SOLUCIÓN:')
      console.log('1. Ve a Supabase Dashboard → SQL Editor')
      console.log('2. Ejecuta el siguiente comando para recrear el storage:\n')
      console.log('-- Eliminar políticas existentes')
      console.log('DROP POLICY IF EXISTS "Permitir inserción pública de PDFs" ON storage.objects;')
      console.log('DROP POLICY IF EXISTS "Permitir lectura pública de PDFs" ON storage.objects;')
      console.log('DROP POLICY IF EXISTS "Permitir actualización por service_role" ON storage.objects;')
      console.log('DROP POLICY IF EXISTS "Permitir eliminación por service_role" ON storage.objects;')
      console.log('')
      console.log('-- Eliminar y recrear bucket')
      console.log("DELETE FROM storage.buckets WHERE id = 'cotizaciones';")
      console.log("INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)")
      console.log("VALUES ('cotizaciones', 'cotizaciones', true, 10485760, ARRAY['application/pdf']::text[]);")
      console.log('')
      console.log('-- Recrear políticas')
      console.log('CREATE POLICY "Permitir inserción pública de PDFs" ON storage.objects')
      console.log('FOR INSERT WITH CHECK (bucket_id = \'cotizaciones\');')
      console.log('')
      console.log('CREATE POLICY "Permitir lectura pública de PDFs" ON storage.objects')
      console.log('FOR SELECT USING (bucket_id = \'cotizaciones\');')
      console.log('')
      console.log('CREATE POLICY "Permitir actualización por service_role" ON storage.objects')
      console.log('FOR UPDATE USING (bucket_id = \'cotizaciones\' AND auth.role() = \'service_role\');')
      console.log('')
      console.log('CREATE POLICY "Permitir eliminación por service_role" ON storage.objects')
      console.log('FOR DELETE USING (bucket_id = \'cotizaciones\' AND auth.role() = \'service_role\');')
      console.log('\n3. Vuelve a ejecutar este script para verificar')
    } else {
      console.log('✅ ¡TODO ESTÁ CONFIGURADO CORRECTAMENTE!')
      console.log('\n🎉 El Storage está listo para generar PDFs de cotizaciones')
      console.log('   Puedes continuar con la implementación del sistema de PDF')
    }
    console.log('='.repeat(60))
    
    return !hasErrors
    
  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message)
    console.error(error)
    return false
  }
}

verifyStorage()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })

