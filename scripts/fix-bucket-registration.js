// Script para REGISTRAR el bucket que ya existe físicamente
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
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 REGISTRANDO BUCKET EN LA BASE DE DATOS\n')

if (!supabaseServiceKey) {
  console.log('⚠️  No se encontró SUPABASE_SERVICE_ROLE_KEY en .env.local')
  console.log('📝 Necesitas agregar la Service Role Key para hacer esto.')
  console.log('')
  console.log('👉 SOLUCIÓN MANUAL:')
  console.log('Ve a Supabase Dashboard → SQL Editor y ejecuta:')
  console.log('')
  console.log('-- Registrar el bucket')
  console.log("INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)")
  console.log("VALUES ('cotizaciones', 'cotizaciones', true, 10485760, ARRAY['application/pdf'])")
  console.log("ON CONFLICT (id) DO UPDATE SET")
  console.log("  public = true,")
  console.log("  file_size_limit = 10485760,")
  console.log("  allowed_mime_types = ARRAY['application/pdf'];")
  console.log('')
  console.log('-- Verificar')
  console.log("SELECT * FROM storage.buckets WHERE id = 'cotizaciones';")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function registrarBucket() {
  try {
    console.log('📦 Verificando estado del bucket...')
    
    // Ver si el bucket está registrado
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error consultando buckets:', listError.message)
      return false
    }
    
    const existente = buckets.find(b => b.id === 'cotizaciones')
    
    if (existente) {
      console.log('✅ El bucket YA está registrado correctamente!')
      console.log('   Configuración actual:')
      console.log(`   - Público: ${existente.public ? '✅ Sí' : '❌ No'}`)
      console.log(`   - Tamaño: ${(existente.file_size_limit / 1048576).toFixed(2)} MB`)
      console.log(`   - MIME: ${existente.allowed_mime_types}`)
      return true
    }
    
    console.log('⚠️  El bucket NO está registrado en la BD')
    console.log('🔧 Intentando registrarlo...')
    
    // Intentar crear/registrar el bucket usando la API
    const { data: createData, error: createError } = await supabase.storage.createBucket('cotizaciones', {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['application/pdf']
    })
    
    if (createError) {
      if (createError.message.includes('already exists')) {
        console.log('ℹ️  El bucket ya existe, actualizando configuración...')
        
        // Actualizar configuración
        const { data: updateData, error: updateError } = await supabase.storage.updateBucket('cotizaciones', {
          public: true,
          fileSizeLimit: 10485760,
          allowedMimeTypes: ['application/pdf']
        })
        
        if (updateError) {
          console.error('❌ Error actualizando bucket:', updateError.message)
          console.log('')
          console.log('👉 SOLUCIÓN MANUAL: Ejecuta este SQL en Supabase Dashboard:')
          console.log('')
          mostrarSQLManual()
          return false
        }
        
        console.log('✅ Bucket actualizado correctamente')
        return true
      }
      
      console.error('❌ Error registrando bucket:', createError.message)
      console.log('')
      console.log('👉 SOLUCIÓN MANUAL: Ejecuta este SQL en Supabase Dashboard:')
      console.log('')
      mostrarSQLManual()
      return false
    }
    
    console.log('✅ Bucket registrado correctamente!')
    return true
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
    console.log('')
    console.log('👉 SOLUCIÓN MANUAL: Ejecuta este SQL en Supabase Dashboard:')
    console.log('')
    mostrarSQLManual()
    return false
  }
}

function mostrarSQLManual() {
  console.log('-- REGISTRAR BUCKET MANUALMENTE')
  console.log("INSERT INTO storage.buckets (")
  console.log("  id, name, public, file_size_limit, allowed_mime_types")
  console.log(") VALUES (")
  console.log("  'cotizaciones',")
  console.log("  'cotizaciones',")
  console.log("  true,")
  console.log("  10485760,")
  console.log("  ARRAY['application/pdf']")
  console.log(") ON CONFLICT (id) DO UPDATE SET")
  console.log("  public = true,")
  console.log("  file_size_limit = 10485760,")
  console.log("  allowed_mime_types = ARRAY['application/pdf'];")
  console.log('')
  console.log('-- VERIFICAR')
  console.log("SELECT id, name, public, file_size_limit, allowed_mime_types")
  console.log("FROM storage.buckets WHERE id = 'cotizaciones';")
}

async function verificarFinal() {
  console.log('')
  console.log('🔍 Verificación final...')
  
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
  
  // Listar buckets
  const { data: buckets } = await supabaseAnon.storage.listBuckets()
  const bucket = buckets?.find(b => b.id === 'cotizaciones')
  
  if (bucket) {
    console.log('✅ Bucket visible desde API')
    console.log(`   Público: ${bucket.public ? '✅' : '❌'}`)
    
    // Intentar subir archivo de prueba
    const testFile = `test-${Date.now()}.pdf`
    const { error: uploadError } = await supabaseAnon.storage
      .from('cotizaciones')
      .upload(testFile, 'test content', {
        contentType: 'application/pdf'
      })
    
    if (uploadError) {
      console.log('❌ No se puede subir archivos:', uploadError.message)
      return false
    }
    
    console.log('✅ Se pueden subir archivos')
    
    // Limpiar
    await supabaseAnon.storage.from('cotizaciones').remove([testFile])
    console.log('✅ Permisos correctos')
    
    console.log('')
    console.log('🎉 ¡TODO ESTÁ FUNCIONANDO CORRECTAMENTE!')
    return true
  } else {
    console.log('❌ Bucket aún no visible')
    return false
  }
}

// Ejecutar
registrarBucket()
  .then(async (success) => {
    if (success) {
      await verificarFinal()
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Error fatal:', error)
    process.exit(1)
  })

