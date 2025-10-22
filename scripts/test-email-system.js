#!/usr/bin/env node

/**
 * Script de prueba para el sistema de envío de emails con SendGrid
 * Uso: node scripts/test-email-system.js [quoteId]
 */

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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEmailSystem() {
  console.log('📧 Sistema de Testing de Email con SendGrid\n')
  console.log('=' .repeat(50))

  // Obtener quoteId de argumentos o usar el primero disponible
  let quoteId = parseInt(process.argv[2])
  
  if (!quoteId) {
    console.log('⚠️  No se proporcionó quoteId, buscando la primera cotización...')
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('id, leads(nombre, email)')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      console.error('❌ No se encontraron cotizaciones en la BD')
      console.log('\nCrea una cotización primero desde la app')
      return false
    }

    quoteId = data.id
    console.log(`✅ Usando cotización ID: ${quoteId}`)
    console.log(`   Cliente: ${data.leads?.nombre}`)
    console.log(`   Email: ${data.leads?.email}\n`)
  }

  // 1. Verificar que la cotización existe
  console.log('1️⃣  Verificando cotización...')
  const { data: cotizacion, error: cotizacionError } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      leads (
        nombre,
        email,
        telefono
      )
    `)
    .eq('id', quoteId)
    .single()

  if (cotizacionError || !cotizacion) {
    console.error('   ❌ Cotización no encontrada')
    return false
  }

  console.log('   ✅ Cotización encontrada')
  console.log(`      ID: ${cotizacion.id}`)
  console.log(`      Cliente: ${cotizacion.leads?.nombre}`)
  console.log(`      Email: ${cotizacion.leads?.email}`)
  console.log(`      Total: $${cotizacion.total}`)

  if (!cotizacion.leads?.email) {
    console.error('   ❌ El lead no tiene email configurado')
    return false
  }

  // 2. Verificar que tiene PDF generado
  console.log('\n2️⃣  Verificando PDF...')
  if (!cotizacion.pdf_url) {
    console.log('   ⚠️  PDF no generado. Generando...')
    
    const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf', {
      body: { quoteId }
    })

    if (pdfError || !pdfData?.success) {
      console.error('   ❌ Error generando PDF:', pdfError?.message || pdfData?.error)
      return false
    }

    console.log('   ✅ PDF generado exitosamente')
    console.log(`      URL: ${pdfData.pdfUrl}`)
  } else {
    console.log('   ✅ PDF ya generado')
    console.log(`      URL: ${cotizacion.pdf_url}`)
  }

  // 3. Verificar historial de emails
  console.log('\n3️⃣  Verificando historial de emails...')
  const { data: eventos, error: eventosError } = await supabase
    .from('eventos')
    .select('*')
    .eq('cotizacion_id', quoteId)
    .eq('tipo', 'email_enviado')
    .order('created_at', { ascending: false })

  if (eventosError) {
    console.error('   ❌ Error consultando eventos:', eventosError.message)
  } else if (eventos && eventos.length > 0) {
    console.log(`   ℹ️  Ya se enviaron ${eventos.length} email(s) para esta cotización:`)
    eventos.forEach(evento => {
      console.log(`      - ${new Date(evento.created_at).toLocaleString()} → ${evento.metadata?.recipient}`)
    })
  } else {
    console.log('   ✅ No hay emails previos para esta cotización')
  }

  // 4. Enviar email de prueba
  console.log('\n4️⃣  Enviando email de prueba...')
  console.log('   📤 Invocando Edge Function send-email...')

  const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
    body: {
      quoteId,
      recipientEmail: cotizacion.leads?.email
    }
  })

  if (emailError) {
    console.error('   ❌ Error invocando función:', emailError.message)
    console.error('   Detalles:', emailError)
    return false
  }

  if (!emailData?.success) {
    console.error('   ❌ La función retornó error:', emailData?.error)
    console.error('   Detalles:', emailData?.details)
    return false
  }

  console.log('   ✅ Email enviado exitosamente!')
  console.log(`      Destinatario: ${emailData.recipient}`)
  console.log(`      Cotización: ${emailData.cotizacionNumero}`)

  // 5. Verificar que se registró el evento
  console.log('\n5️⃣  Verificando registro del evento...')
  await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo

  const { data: nuevoEvento, error: nuevoEventoError } = await supabase
    .from('eventos')
    .select('*')
    .eq('cotizacion_id', quoteId)
    .eq('tipo', 'email_enviado')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (nuevoEventoError || !nuevoEvento) {
    console.warn('   ⚠️  No se encontró el evento registrado (puede tardar unos segundos)')
  } else {
    console.log('   ✅ Evento registrado correctamente')
    console.log(`      ID: ${nuevoEvento.id}`)
    console.log(`      Fecha: ${new Date(nuevoEvento.created_at).toLocaleString()}`)
    console.log(`      Metadata:`, JSON.stringify(nuevoEvento.metadata, null, 2))
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ TEST COMPLETADO EXITOSAMENTE')
  console.log('='.repeat(50))
  console.log('\n📋 Resumen:')
  console.log(`   • Cotización ID: ${quoteId}`)
  console.log(`   • Email enviado a: ${emailData.recipient}`)
  console.log(`   • Número de cotización: ${emailData.cotizacionNumero}`)
  console.log('\n📧 Verifica tu bandeja de entrada (o carpeta de spam)')
  console.log(`   Email: ${cotizacion.leads?.email}`)
  console.log('\n💡 Comandos útiles:')
  console.log(`   # Ver logs de la función`)
  console.log(`   supabase functions logs send-email`)
  console.log(`   `)
  console.log(`   # Ver eventos en BD`)
  console.log(`   SELECT * FROM eventos WHERE cotizacion_id = ${quoteId} AND tipo = 'email_enviado';`)

  return true
}

// Ejecutar test
testEmailSystem()
  .then(success => {
    if (success) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ Error inesperado:', error)
    console.error(error.stack)
    process.exit(1)
  })
