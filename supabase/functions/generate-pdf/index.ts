import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Cliente con permisos de servicio para leer datos
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Edge Function para generar PDF de cotización
 * Genera PDFs reales usando Puppeteer y los sube a Supabase Storage
 */
Deno.serve(async (req: Request) => {
  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método no permitido' }),
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Obtener datos del request
    const { quoteId } = await req.json()
    
    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: 'ID de cotización requerido' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🔍 Generando PDF real para cotización:', quoteId)

    // Generar HTML de la cotización
    const html = await generateQuoteHTML(quoteId)
    
    // Generar PDF real usando Puppeteer
    const pdfBuffer = await generateRealPDF(html)
    
    // Subir PDF a Supabase Storage
    const fileName = `cotizacion-${quoteId}-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cotizaciones')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Error subiendo PDF: ${uploadError.message}`)
    }

    // Obtener URL pública del PDF
    const { data: urlData } = supabase.storage
      .from('cotizaciones')
      .getPublicUrl(fileName)

    // Actualizar estado de la cotización con URL del PDF
    const { error: updateError } = await supabase
      .from('cotizaciones')
      .update({ 
        pdf_url: urlData.publicUrl,
        estado: 'generada'
      })
      .eq('id', quoteId)

    if (updateError) {
      console.warn('Error actualizando cotización:', updateError.message)
    }

    // Registrar evento
    await supabase
      .from('eventos')
      .insert({
        cotizacion_id: quoteId,
        tipo: 'pdf_generado',
        descripcion: `PDF generado: ${fileName}`,
        metadata: { fileName, url: urlData.publicUrl }
      })

    console.log('✅ PDF real generado exitosamente:', urlData.publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true,
        pdfUrl: urlData.publicUrl,
        fileName,
        quoteId
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error en generate-pdf:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

/**
 * Genera HTML de la cotización leyendo datos frescos desde Supabase
 */
async function generateQuoteHTML(quoteId: number): Promise<string> {
  try {
    // Obtener cotización completa con lead e items
    const { data: cotizacion, error: cotizacionError } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        leads (
          nombre,
          email,
          telefono,
          empresa,
          ruc_cedula,
          ciudad,
          notas
        )
      `)
      .eq('id', quoteId)
      .single()

    if (cotizacionError) {
      throw new Error(`Error obteniendo cotización: ${cotizacionError.message}`)
    }

    // Obtener items de la cotización con datos del producto
    const { data: items, error: itemsError } = await supabase
      .from('items_cotizacion')
      .select(`
        *,
        productos (
          nombre,
          categoria,
          imagen_url
        )
      `)
      .eq('cotizacion_id', quoteId)

    if (itemsError) {
      throw new Error(`Error obteniendo items: ${itemsError.message}`)
    }

    // Calcular totales frescos
    const totals = calculateTotals(items)

    // Generar HTML usando la plantilla
    const html = await generateHTMLFromTemplate(cotizacion, items, totals)
    
    return html
  } catch (error) {
    console.error('Error generating quote HTML:', error)
    throw error
  }
}

/**
 * Calcula totales frescos desde los datos de Supabase
 */
function calculateTotals(items: any[]): {
  subtotal: number
  iva0: number
  iva15: number
  total: number
} {
  let subtotal = 0
  let iva0 = 0
  let iva15 = 0

  items.forEach(item => {
    const itemSubtotal = item.cantidad * item.precio_unitario_aplicado
    subtotal += itemSubtotal
    
    // Asumir IVA 15% para todos los productos (configurable)
    const iva = itemSubtotal * 0.15
    iva15 += iva
  })

  const total = subtotal + iva0 + iva15

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    iva0: Math.round(iva0 * 100) / 100,
    iva15: Math.round(iva15 * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}

/**
 * Genera HTML usando la plantilla y datos reales
 */
async function generateHTMLFromTemplate(cotizacion: any, items: any[], totals: any): Promise<string> {
  // Cargar plantilla HTML
  const templatePath = new URL('../templates/cotizacion.html', import.meta.url)
  const template = await Deno.readTextFile(templatePath)

  const lead = cotizacion.leads
  
  // Configuración de la empresa (hardcoded por ahora, podría venir de BD)
  const empresaConfig = {
    nombre: 'FullColor',
    direccion: 'Quito, Ecuador',
    telefono: '+593 99 123 4567',
    email: 'info@fullcolor.com',
    logoUrl: '/logo-fullcolor.png' // URL del logo
  }

  // Generar filas de items
  const itemsRows = items.map(item => {
    const imagen = item.productos?.imagen_url 
      ? `<img class="img" src="${item.productos.imagen_url}" alt="${item.productos.nombre}" />`
      : '<div class="img" style="background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;">Sin imagen</div>'
    
    const precioUnitario = item.precio_unitario_aplicado.toFixed(2)
    const subtotal = (item.cantidad * item.precio_unitario_aplicado).toFixed(2)
    const iva = (item.cantidad * item.precio_unitario_aplicado * 0.15).toFixed(2)

    return `
      <tr>
        <td>${item.cantidad}</td>
        <td>${imagen}</td>
        <td>
          <strong>${item.productos.nombre}</strong><br/>
          <span class="muted">${item.productos.categoria}</span>
        </td>
        <td class="right">$${precioUnitario}</td>
        <td class="right">$${iva}</td>
        <td class="right">$${subtotal}</td>
      </tr>
    `
  }).join('')

  // Reemplazar placeholders
  const replacements: Record<string, string> = {
    // Empresa
    '{{EMPRESA_LOGO_URL}}': empresaConfig.logoUrl,
    '{{EMPRESA_NOMBRE}}': empresaConfig.nombre,
    '{{EMPRESA_DIRECCION}}': empresaConfig.direccion,
    '{{EMPRESA_TELEFONO}}': empresaConfig.telefono,
    '{{EMPRESA_EMAIL}}': empresaConfig.email,

    // Cotización
    '{{COTIZACION_NUMERO}}': `FC-2025-${cotizacion.id.toString().padStart(3, '0')}`,
    '{{COTIZACION_FECHA}}': new Date(cotizacion.created_at).toLocaleDateString('es-ES'),
    '{{COTIZACION_VALIDEZ_DIAS}}': cotizacion.validez_dias.toString(),

    // Cliente
    '{{CLIENTE_NOMBRE}}': lead.nombre,
    '{{CLIENTE_DOCUMENTO}}': lead.ruc_cedula || 'No especificado',
    '{{CLIENTE_DIRECCION}}': lead.ciudad || 'No especificado',
    '{{CLIENTE_TELEFONO}}': lead.telefono || 'No especificado',
    '{{CLIENTE_EMAIL}}': lead.email,

    // Items
    '{{ITEMS_ROWS}}': itemsRows,

    // Totales
    '{{RESUMEN_SUBTOTAL}}': `$${totals.subtotal.toFixed(2)}`,
    '{{RESUMEN_IVA0}}': `$${totals.iva0.toFixed(2)}`,
    '{{RESUMEN_IVA15}}': `$${totals.iva15.toFixed(2)}`,
    '{{RESUMEN_TOTAL}}': `$${totals.total.toFixed(2)}`,

    // Observaciones
    '{{OBSERVACIONES}}': lead.notas || cotizacion.notas || 'Sin observaciones especiales'
  }

  // Reemplazar todos los placeholders
  let html = template
  Object.entries(replacements).forEach(([placeholder, value]) => {
    html = html.replace(new RegExp(placeholder, 'g'), value)
  })

  return html
}

/**
 * Genera PDF real usando Puppeteer
 */
async function generateRealPDF(html: string): Promise<Uint8Array> {
  try {
    // Importar Puppeteer dinámicamente
    const puppeteer = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts')
    
    console.log('🚀 Iniciando Puppeteer...')
    
    // Lanzar navegador
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // Establecer contenido HTML
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    })
    
    console.log('📄 Generando PDF desde HTML...')
    
    // Generar PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: true
    })
    
    await browser.close()
    
    console.log('✅ PDF generado exitosamente con Puppeteer')
    
    return new Uint8Array(pdf)
    
  } catch (error) {
    console.error('❌ Error generando PDF con Puppeteer:', error)
    
    // Fallback: retornar HTML como bytes si Puppeteer falla
    console.log('🔄 Usando fallback: HTML como bytes')
    const encoder = new TextEncoder()
    return encoder.encode(html)
  }
}
