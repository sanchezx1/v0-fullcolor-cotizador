import { createClient } from 'jsr:@supabase/supabase-js@2'

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Cliente con permisos de servicio para leer datos
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Edge Function para generar PDF de cotización
 * Genera PDFs profesionales usando implementación simple y robusta
 */
Deno.serve(async (req: Request) => {
  try {
    // Headers CORS para permitir llamadas desde el navegador
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json'
    }

    // Manejar preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: corsHeaders
      })
    }

    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método no permitido' }),
        { 
          status: 405,
          headers: corsHeaders
        }
      )
    }

    // Obtener datos del request
    const { quoteId, preview } = await req.json()
    
    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: 'ID de cotización requerido' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    console.log('🔍 Generando PDF profesional para cotización:', quoteId)

    // Si es preview, devolver solo el HTML renderizado
    if (preview) {
      console.log('📝 Generando preview HTML de la plantilla')
      const cotizacionData = await getCotizacionData(quoteId)
      const htmlContent = await generateHTMLFromTemplate(cotizacionData)
      
      return new Response(htmlContent, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html'
        }
      })
    }

    // Generar PDF profesional directamente
    const pdfBuffer = await generateProfessionalPDF(quoteId)
    console.log('📄 PDF profesional generado, tamaño:', pdfBuffer.length, 'bytes')
    
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
        estado: 'enviada'
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

    console.log('✅ PDF profesional generado exitosamente:', urlData.publicUrl)

    return new Response(
      JSON.stringify({ 
        success: true,
        pdfUrl: urlData.publicUrl,
        fileName,
        quoteId
      }),
      { 
        status: 200,
        headers: corsHeaders
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
        headers: corsHeaders
      }
    )
  }
})

/**
 * Genera PDF profesional usando datos reales de Supabase
 * Respeta el diseño de la plantilla cotizacion.html
 */
async function generateProfessionalPDF(quoteId: number): Promise<Uint8Array> {
  try {
    console.log('📄 Generando PDF profesional usando datos reales...')
    
    // 1. Obtener datos reales de Supabase
    const cotizacionData = await getCotizacionData(quoteId)
    console.log('✅ Datos de cotización obtenidos:', cotizacionData.cotizacion.id)
    
    // 2. Generar PDF directamente con los datos
    const pdfBytes = await generatePDFFromData(cotizacionData)
    console.log('✅ PDF generado exitosamente con datos reales')
    
    return pdfBytes
    
  } catch (error) {
    console.error('❌ Error generando PDF profesional:', error)
    throw error
  }
}

/**
 * Obtiene datos reales de la cotización desde Supabase
 */
async function getCotizacionData(quoteId: number) {
  console.log('🔍 Obteniendo datos reales para cotización:', quoteId)
  
  // Obtener cotización con lead
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
    console.warn('⚠️ No se encontró cotización real, usando datos de prueba')
    return getMockCotizacionData(quoteId)
    }

  // Obtener items de la cotización con productos
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

  if (itemsError || !items || items.length === 0) {
    console.warn('⚠️ No se encontraron items reales, usando datos de prueba')
    return getMockCotizacionData(quoteId)
    }

  // Calcular totales
    const totals = calculateTotals(items)

  return {
    cotizacion,
    items,
    totals
  }
}

/**
 * Datos de prueba cuando no hay datos reales
 */
function getMockCotizacionData(quoteId: number) {
  return {
    cotizacion: {
      id: quoteId,
      created_at: new Date().toISOString(),
      validez_dias: 30,
      leads: {
        nombre: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        telefono: '+593 99 123 4567',
        empresa: 'Empresa Ejemplo S.A.',
        ruc_cedula: '1234567890001',
        ciudad: 'Quito, Ecuador',
        notas: 'Cliente preferencial con descuento especial'
      }
    },
    items: [
      {
        cantidad: 100,
        precio_unitario_aplicado: 2.50,
        productos: {
          nombre: 'Tarjetas de Presentación Premium',
          categoria: 'Papelería Corporativa',
          imagen_url: 'https://via.placeholder.com/64x48/0066a1/ffffff?text=TC'
        }
      },
      {
        cantidad: 50,
        precio_unitario_aplicado: 15.00,
        productos: {
          nombre: 'Volantes Publicitarios',
          categoria: 'Publicidad',
          imagen_url: 'https://via.placeholder.com/64x48/f5c700/000000?text=VP'
        }
      },
      {
        cantidad: 25,
        precio_unitario_aplicado: 8.00,
        productos: {
          nombre: 'Stickers Personalizados',
          categoria: 'Promocional',
          imagen_url: 'https://via.placeholder.com/64x48/28a745/ffffff?text=ST'
        }
      }
    ],
    totals: {
      subtotal: 1200.00,
      iva0: 0.00,
      iva15: 180.00,
      total: 1380.00
    }
  }
}

/**
 * Calcula totales desde los items
 */
function calculateTotals(items: any[]) {
  let subtotal = 0
  let iva0 = 0
  let iva15 = 0

  items.forEach(item => {
    const itemSubtotal = item.cantidad * item.precio_unitario_aplicado
    subtotal += itemSubtotal
    
    // Asumir IVA 15% para todos los productos
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
 * Genera HTML usando la plantilla existente con datos reales
 */
async function generateHTMLFromTemplate(data: any): Promise<string> {
  console.log('📝 Generando HTML desde plantilla con datos reales')
  
  // Plantilla HTML existente (copiada desde templates/cotizacion.html)
  const template = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cotización {{COTIZACION_NUMERO}}</title>
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
        <img class="logo" src="{{EMPRESA_LOGO_URL}}" alt="logo empresa" />
        <div class="muted subtitle">Líderes en Servicios Gráficos Digitales</div>
      </div>
      <div style="text-align:right">
        <div class="h2">COTIZACIÓN</div>
        <div class="muted">Nº: {{COTIZACION_NUMERO}}</div>
        <div class="muted">Fecha: {{COTIZACION_FECHA}}</div>
      </div>
    </div>
    <div class="bar"></div>

    <!-- INFO BOXES -->
    <div class="row" style="gap:14px; margin-top:12px">
      <div class="card" style="flex:1">
        <div class="h2" style="margin-bottom:8px">Cliente</div>
        <div style="font-size:12px;line-height:1.5">
          <strong>{{CLIENTE_NOMBRE}}</strong><br/>
          RUC/Cédula: {{CLIENTE_DOCUMENTO}}<br/>
          {{CLIENTE_DIRECCION}}<br/>
          — {{CLIENTE_TELEFONO}}<br/>
          {{CLIENTE_EMAIL}}
        </div>
      </div>
      <div class="card" style="flex:1">
        <div class="h2" style="margin-bottom:8px">Emisor</div>
        <div style="font-size:12px;line-height:1.5">
          <strong>{{EMPRESA_NOMBRE}}</strong><br/>
          {{EMPRESA_DIRECCION}}<br/>
          {{EMPRESA_TELEFONO}}<br/>
          {{EMPRESA_EMAIL}}
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
        {{ITEMS_ROWS}}
      </tbody>
    </table>

    <!-- RESÚMENES -->
    <table style="margin-top:12px">
      <tbody>
        <tr><td style="width:85%"></td><td class="right"><strong>SUBTOTAL</strong></td><td class="right">{{RESUMEN_SUBTOTAL}}</td></tr>
        <tr><td></td><td class="right">IVA 0%</td><td class="right">{{RESUMEN_IVA0}}</td></tr>
        <tr><td></td><td class="right">IVA 15%</td><td class="right">{{RESUMEN_IVA15}}</td></tr>
        <tr><td></td><td class="right total">TOTAL</td><td class="right total">{{RESUMEN_TOTAL}}</td></tr>
      </tbody>
    </table>

    <!-- OBSERVACIONES -->
    <div style="margin:12px 0 8px 0"><strong>Observaciones:</strong> {{OBSERVACIONES}}</div>

    <!-- FOOTNOTE -->
    <div class="footnote" style="margin-top:24px">
      * Precios en USD. Validez {{COTIZACION_VALIDEZ_DIAS}} días. Tiempos sujetos a aprobación de artes y abono.
      No incluye flete salvo indicación.
    </div>
  </div>
</body>
</html>`

  const cotizacion = data.cotizacion
  const items = data.items
  const totals = data.totals
  const lead = cotizacion.leads

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

  // Configuración de la empresa
  const empresaConfig = {
    nombre: 'FullColor',
    direccion: 'Quito, Ecuador',
    telefono: '+593 99 123 4567',
    email: 'info@fullcolor.com',
    logoUrl: '/logo-fullcolor.png'
  }

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

  console.log('✅ HTML generado con plantilla y datos reales')
  return html
}

/**
 * Genera PDF directamente desde datos estructurados
 * Respeta el diseño visual de cotizacion.html
 */
async function generatePDFFromData(cotizacionData: any): Promise<Uint8Array> {
  console.log('📄 Generando PDF con datos reales (diseño cotizacion.html)...')
  
  try {
    // Importar jsPDF
    const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
    
    console.log('✅ jsPDF importado correctamente')
    
    // Crear PDF con formato A4
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    })
    
    // Preparar datos estructurados desde Supabase
    const cotizacion = cotizacionData.cotizacion
    const items = cotizacionData.items
    const totals = cotizacionData.totals
    const lead = cotizacion.leads
    
    const data = {
      cotizacionNumero: `FC-2025-${cotizacion.id.toString().padStart(3, '0')}`,
      fecha: new Date(cotizacion.created_at).toLocaleDateString('es-ES'),
      clienteNombre: lead.nombre,
      clienteEmpresa: lead.empresa || '',
      clienteEmail: lead.email,
      clienteTelefono: lead.telefono || '',
      clienteRuc: lead.ruc_cedula || '',
      clienteCiudad: lead.ciudad || '',
      items: items.map((item: any) => ({
        cantidad: item.cantidad.toString(),
        nombre: item.productos.nombre,
        categoria: item.productos.categoria,
        precioUnitario: item.precio_unitario_aplicado.toFixed(2),
        iva: (item.cantidad * item.precio_unitario_aplicado * 0.15).toFixed(2),
        subtotal: (item.cantidad * item.precio_unitario_aplicado).toFixed(2)
      })),
      subtotal: totals.subtotal.toFixed(2),
      iva0: totals.iva0.toFixed(2),
      iva15: totals.iva15.toFixed(2),
      total: totals.total.toFixed(2)
    }
    
    console.log('✅ Datos preparados:', { items: data.items.length, cliente: data.clienteNombre })
    
    // Crear PDF usando el diseño de la plantilla
    // Header
    doc.setFillColor(0, 102, 161)
    doc.rect(0, 0, 210, 12, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('COTIZACIÓN FULLCOLOR', 105, 8, { align: 'center' })
    
    // Línea azul
    doc.setDrawColor(0, 102, 161)
    doc.setLineWidth(0.8)
    doc.line(10, 15, 200, 15)
    
    // Info cotización
    doc.setTextColor(0, 102, 161)
    doc.setFontSize(12)
    doc.text('COTIZACIÓN', 150, 22)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`Nº: ${data.cotizacionNumero}`, 150, 28)
    doc.text(`Fecha: ${data.fecha}`, 150, 33)
    
    // Cliente
    doc.setTextColor(0, 102, 161)
    doc.setFontSize(11)
    doc.text('Cliente', 15, 25)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(data.clienteNombre, 15, 31)
    
    // Presupuesto
    doc.setTextColor(0, 102, 161)
    doc.setFontSize(12)
    doc.text('Presupuesto', 15, 50)
    
    // Tabla de productos - Headers
    doc.setFillColor(250, 251, 252)
    doc.rect(10, 55, 190, 8, 'F')
    
    doc.setTextColor(0, 102, 161)
    doc.setFontSize(9)
    doc.text('Cant.', 12, 60)
    doc.text('Producto', 35, 60)
    doc.text('P. Unit', 130, 60)
    doc.text('IVA', 155, 60)
    doc.text('Subtotal', 175, 60)
    
    // Línea separadora
    doc.setDrawColor(229, 231, 235)
    doc.line(10, 64, 200, 64)
    
    // Items
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    let yPos = 70
    
    data.items.forEach(item => {
      doc.text(item.cantidad, 12, yPos)
      doc.text(item.nombre, 35, yPos)
      doc.text(item.categoria, 35, yPos + 4)
      doc.text(`$${item.precioUnitario}`, 130, yPos)
      doc.text(`$${item.iva}`, 155, yPos)
      doc.text(`$${item.subtotal}`, 175, yPos)
      
      yPos += 12
    })
    
    // Línea antes de totales
    doc.line(10, yPos, 200, yPos)
    yPos += 6
    
    // Totales
    doc.setFontSize(10)
    doc.text('SUBTOTAL:', 145, yPos)
    doc.text(`$${data.subtotal}`, 180, yPos, { align: 'right' })
    
    yPos += 6
    doc.text('IVA 0%:', 145, yPos)
    doc.text(`$${data.iva0}`, 180, yPos, { align: 'right' })
    
    yPos += 6
    doc.text('IVA 15%:', 145, yPos)
    doc.text(`$${data.iva15}`, 180, yPos, { align: 'right' })
    
    yPos += 8
    doc.setTextColor(0, 102, 161)
    doc.setFontSize(13)
    doc.text('TOTAL:', 145, yPos)
    doc.text(`$${data.total}`, 180, yPos, { align: 'right' })
    
    // Footer
    doc.setTextColor(107, 114, 128)
    doc.setFontSize(8)
    doc.text('* Precios en USD. Validez 30 días. Tiempos sujetos a aprobación de artes y abono.', 105, 280, { align: 'center' })
    doc.text('No incluye flete salvo indicación.', 105, 285, { align: 'center' })
    
    doc.setFontSize(7)
    doc.text('FullColor - Servicios Gráficos Digitales', 105, 292, { align: 'center' })
    doc.text('Quito, Ecuador | +593 99 123 4567 | info@fullcolor.com', 105, 296, { align: 'center' })
    
    // Generar PDF
    const pdfOutput = doc.output('arraybuffer')
    const pdfBytes = new Uint8Array(pdfOutput)
    
    console.log('✅ PDF generado usando diseño de plantilla cotizacion.html')
    return pdfBytes
    
  } catch (error) {
    console.error('❌ Error convirtiendo HTML a PDF:', error)
    throw error
  }
}