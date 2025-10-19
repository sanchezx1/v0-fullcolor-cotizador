// Diagnóstico completo del Storage usando SQL directo
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Leer .env.local
let envContent = ''
try {
  envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
} catch (error) {
  console.error('❌ No se pudo leer .env.local')
  process.exit(1)
}

const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 DIAGNÓSTICO COMPLETO DEL STORAGE\n')
console.log('📍 Proyecto:', supabaseUrl)
console.log('')

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnosticar() {
  try {
    // 1. Consultar directamente a la tabla storage.buckets usando RPC
    console.log('📦 1. CONSULTANDO BUCKETS...')
    const { data: buckets, error: bucketsError } = await supabase
      .rpc('get_storage_buckets')
      .single()
    
    if (bucketsError) {
      console.log('   ⚠️  No se puede consultar via RPC, intentando listBuckets()...')
      
      // Método alternativo: usar la API de Storage
      const { data: storageBuckets, error: storageError } = await supabase.storage.listBuckets()
      
      if (storageError) {
        console.log('   ❌ Error:', storageError.message)
      } else {
        console.log(`   ✅ Encontrados ${storageBuckets.length} bucket(s)`)
        storageBuckets.forEach(b => {
          console.log(`      - ID: ${b.id}`)
          console.log(`        Nombre: ${b.name}`)
          console.log(`        Público: ${b.public ? '✅ SÍ' : '❌ NO'}`)
          console.log(`        Tamaño max: ${b.file_size_limit ? (b.file_size_limit/1048576).toFixed(2) + ' MB' : 'Sin límite'}`)
          console.log(`        Tipos MIME: ${b.allowed_mime_types || 'Todos'}`)
          console.log('')
        })
        
        // Verificar si existe 'cotizaciones'
        const cotizaciones = storageBuckets.find(b => b.id === 'cotizaciones')
        if (cotizaciones) {
          console.log('   ✅ El bucket "cotizaciones" EXISTE')
          console.log(`      Configuración:`)
          console.log(`      - Público: ${cotizaciones.public ? '✅ SÍ' : '❌ NO (PROBLEMA!)'}`)
          console.log(`      - Tamaño: ${cotizaciones.file_size_limit ? (cotizaciones.file_size_limit/1048576).toFixed(2) + ' MB' : 'Sin límite'}`)
          console.log(`      - MIME: ${cotizaciones.allowed_mime_types || 'Todos'}`)
        } else {
          console.log('   ❌ El bucket "cotizaciones" NO EXISTE')
        }
      }
    }
    
    console.log('')
    
    // 2. Listar archivos en cotizaciones
    console.log('📂 2. VERIFICANDO ARCHIVOS...')
    const { data: files, error: filesError } = await supabase
      .storage
      .from('cotizaciones')
      .list()
    
    if (filesError) {
      console.log('   ❌ Error listando archivos:', filesError.message)
    } else {
      console.log(`   ✅ Archivos en bucket: ${files.length}`)
      if (files.length > 0) {
        files.slice(0, 3).forEach(f => {
          console.log(`      - ${f.name}`)
        })
      }
    }
    
    console.log('')
    
    // 3. Intentar subir archivo de prueba
    console.log('📤 3. PROBANDO SUBIDA DE ARCHIVO...')
    const testContent = 'Test PDF content'
    const testFileName = `test-${Date.now()}.pdf`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('cotizaciones')
      .upload(testFileName, testContent, {
        contentType: 'application/pdf'
      })
    
    if (uploadError) {
      console.log('   ❌ NO se puede subir archivos')
      console.log('   Error:', uploadError.message)
      console.log('')
      console.log('   🔍 Posibles causas:')
      console.log('      1. El bucket no está marcado como público')
      console.log('      2. Las políticas RLS no permiten inserción con role "anon"')
      console.log('      3. El bucket solo acepta PDFs y estamos enviando text/plain')
    } else {
      console.log('   ✅ Archivo subido correctamente:', testFileName)
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('cotizaciones')
        .getPublicUrl(testFileName)
      
      console.log('   📎 URL pública:', urlData.publicUrl)
      
      // Limpiar
      await supabase.storage.from('cotizaciones').remove([testFileName])
      console.log('   🧹 Archivo de prueba eliminado')
    }
    
    console.log('')
    console.log('=' .repeat(60))
    console.log('📋 RESUMEN:')
    console.log('=' .repeat(60))
    
    const { data: checkBuckets } = await supabase.storage.listBuckets()
    const existeCotizaciones = checkBuckets?.find(b => b.id === 'cotizaciones')
    
    if (existeCotizaciones) {
      console.log('✅ Bucket existe')
      console.log(existeCotizaciones.public ? '✅ Es público' : '❌ NO es público (problema)')
      console.log(uploadError ? '❌ NO se pueden subir archivos' : '✅ Se pueden subir archivos')
      
      if (!existeCotizaciones.public || uploadError) {
        console.log('')
        console.log('🛠️  SOLUCIÓN:')
        console.log('El bucket existe pero no está bien configurado.')
        console.log('Ve al Dashboard de Supabase:')
        console.log('1. Storage → Buckets → cotizaciones')
        console.log('2. Settings → Marcar "Public bucket" ✅')
        console.log('3. Save')
      } else {
        console.log('')
        console.log('🎉 ¡TODO FUNCIONA PERFECTAMENTE!')
      }
    } else {
      console.log('❌ Bucket NO existe')
      console.log('')
      console.log('🛠️  SOLUCIÓN:')
      console.log('Ejecuta: database/crear_storage_simple.sql')
      console.log('O créalo manualmente desde el Dashboard')
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
}

diagnosticar()

