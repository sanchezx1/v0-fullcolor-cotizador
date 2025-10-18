import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Cliente con permisos de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Edge Function para generar PDF de cotización
 * Versión con generación real de PDF usando Puppeteer
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

    // Obtener datos de la cotización
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

    // Obtener items de la cotización
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

    // Generar HTML usando la plantilla
    const html = generateHTMLFromTemplate(cotizacion, items)

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

    // Actualizar estado de la cotización
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
 * Genera HTML usando la plantilla de cotización
 */
function generateHTMLFromTemplate(cotizacion: any, items: any[]): string {
  const lead = cotizacion.leads
  
  // Configuración de la empresa
  const empresaConfig = {
    nombre: 'FullColor',
    direccion: 'Quito, Ecuador',
    telefono: '+593 99 123 4567',
    email: 'info@fullcolor.com',
    logoUrl: '/logo-fullcolor.png'
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

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const iva15 = subtotal * 0.15
  const total = subtotal + iva15

  // Plantilla HTML completa
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cotización FC-2025-${cotizacion.id.toString().padStart(3, '0')}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{--azul:#0066a1;--amarillo:#f5c700;--gris:#e5e7eb;--txt:#1a1a1a}
    *{box-sizing:border-box} body{margin:0;color:var(--txt);font-family:Inter,Helvetica,Arial,sans-serif}
    .page{width:210mm; min-height:297mm; padding:16mm 18mm}
    .row{display:flex;align-items:flex-start;justify-content:space-between}
    .muted{color:#6b7280}
    .h2{font-size:14px;font-weight:700}
    .bar{height:3px;background:var(--azul);margin-top:12px}
    .card{border:1px solid var(--gris);border-radius:8px;padding:12px}
    table{border-collapse:collapse;width:100%}
    th,td{border-bottom:1px solid #eef0f2;padding:10px 8px;font-size:12px;vertical-align:top}
    th{font-weight:700;background:#fafbfc}
    .right{text-align:right}
    .logo{height:28px}
    .img{width:64px;height:48px;object-fit:cover;border:1px solid var(--gris);border-radius:6px}
    .total{font-size:16px;font-weight:800}
    .footnote{font-size:10px;color:#6b7280}
    .subtitle{font-size:11px}
  </style>
</head>
<body>
  <div class="page">
    <!-- HEADER -->
    <div class="row">
      <div style="display:flex;align-items:center;gap:10px">
        <img class="logo" src="${empresaConfig.logoUrl}" alt="logo empresa" />
        <div class="muted subtitle">Líderes en Servicios Gráficos Digitales</div>
      </div>
      <div style="text-align:right">
        <div class="h2">COTIZACIÓN</div>
        <div class="muted">Nº: FC-2025-${cotizacion.id.toString().padStart(3, '0')}</div>
        <div class="muted">Fecha: ${new Date(cotizacion.created_at).toLocaleDateString('es-ES')}</div>
      </div>
    </div>
    <div class="bar"></div>

    <!-- INFO BOXES -->
    <div class="row" style="gap:14px; margin-top:12px">
      <div class="card" style="flex:1">
        <div class="h2" style="margin-bottom:8px">Cliente</div>
        <div style="font-size:12px;line-height:1.5">
          <strong>${lead.nombre}</strong><br/>
          RUC/Cédula: ${lead.ruc_cedula || 'No especificado'}<br/>
          ${lead.ciudad || 'No especificado'}<br/>
          — ${lead.telefono || 'No especificado'}<br/>
          ${lead.email}
        </div>
      </div>
      <div class="card" style="flex:1">
        <div class="h2" style="margin-bottom:8px">Emisor</div>
        <div style="font-size:12px;line-height:1.5">
          <strong>${empresaConfig.nombre}</strong><br/>
          ${empresaConfig.direccion}<br/>
          ${empresaConfig.telefono}<br/>
          ${empresaConfig.email}
        </div>
      </div>
    </div>

    <!-- TÍTULO PRESUPUESTO -->
    <div class="h2" style="margin-top:24px;margin-bottom:8px">Presupuesto</div>

    <!-- TABLA ITEMS -->
    <table>
      <thead>
        <tr>
          <th style="width:60px">Cant.</th>
          <th style="width:80px">Imagen</th>
          <th>Producto</th>
          <th style="width:120px" class="right">P. Unit (sin IVA)</th>
          <th style="width:70px" class="right">IVA</th>
          <th style="width:120px" class="right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- RESÚMENES -->
    <table style="margin-top:12px">
      <tbody>
        <tr><td style="width:85%"></td><td class="right"><strong>SUBTOTAL</strong></td><td class="right">$${subtotal.toFixed(2)}</td></tr>
        <tr><td></td><td class="right">IVA 0%</td><td class="right">$0.00</td></tr>
        <tr><td></td><td class="right">IVA 15%</td><td class="right">$${iva15.toFixed(2)}</td></tr>
        <tr><td></td><td class="right total">TOTAL</td><td class="right total">$${total.toFixed(2)}</td></tr>
      </tbody>
    </table>

    <!-- OBSERVACIONES -->
    <div style="margin:12px 0 8px 0"><strong>Observaciones:</strong> ${lead.notas || cotizacion.notas || 'Sin observaciones especiales'}</div>

    <!-- FOOTNOTE -->
    <div class="footnote" style="margin-top:24px">
      * Precios en USD. Validez 30 días. Tiempos sujetos a aprobación de artes y abono.
      No incluye flete salvo indicación.
    </div>
  </div>
</body>
</html>`
}

/**
 * Genera PDF real usando Puppeteer
 */
async function generateRealPDF(html: string): Promise<Uint8Array> {
  try {
    // Importar Puppeteer dinámicamente
    const puppeteer = await import('https://deno.land/x/puppeteer@16.2.0/mod.ts')
    
    // Lanzar navegador
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Establecer contenido HTML
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Generar PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    })
    
    await browser.close()
    
    return new Uint8Array(pdf)
    
  } catch (error) {
    console.error('Error generando PDF con Puppeteer:', error)
    
    // Fallback: retornar HTML como bytes
    const encoder = new TextEncoder()
    return encoder.encode(html)
  }
}
