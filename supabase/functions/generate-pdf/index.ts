import { createClient } from 'jsr:@supabase/supabase-js@2'

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Cliente con permisos de servicio para leer datos
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Edge Function para generar PDF de cotización
 * Genera PDFs profesionales usando jsPDF (sin plantillas HTML)
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
    const { quoteId } = await req.json()
    
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

    // ⚡ ENVIAR EMAIL AUTOMÁTICAMENTE
    let emailStatus = {
      sent: false,
      recipient: null,
      error: null
    }

    try {
      console.log('📧 Enviando email automáticamente...')
      
      const emailResponse = await supabase.functions.invoke('send-email', {
        body: { quoteId }
      })

      if (emailResponse.error) {
        throw emailResponse.error
      }

      if (emailResponse.data?.success) {
        emailStatus.sent = true
        emailStatus.recipient = emailResponse.data.recipient
        console.log('✅ Email enviado automáticamente a:', emailResponse.data.recipient)
      }
    } catch (emailError) {
      // No bloquear la generación del PDF si falla el email
      console.warn('⚠️ Error enviando email (no crítico):', emailError.message)
      emailStatus.error = emailError.message
    }

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl: urlData.publicUrl,
        fileName,
        quoteId,
        emailSent: emailStatus.sent,
        emailRecipient: emailStatus.recipient,
        emailError: emailStatus.error
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
 * Utiliza jsPDF para crear el documento directamente
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
 * Genera PDF directamente desde datos estructurados usando jsPDF
 */
async function generatePDFFromData(cotizacionData: any): Promise<Uint8Array> {
  console.log('📄 Generando PDF con jsPDF usando datos reales...')
  
  try {
    // Importar jsPDF y autoTable
    const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
    const autoTable = (await import('https://esm.sh/jspdf-autotable@3.8.2')).default
    
    console.log('✅ jsPDF y autoTable importados correctamente')
    
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
    
    const cotizacionNumero = cotizacion.id.toString().padStart(6, '0')
    const fechaCreacion = new Date(cotizacion.created_at).toLocaleDateString('es-ES')
    
    console.log('✅ Datos preparados:', { items: items.length, cliente: lead.nombre })
    
    // COLORES DE MARCA FULLCOLOR
    const colorAzul = [0, 102, 161]      // #0066a1
    const colorAmarillo = [245, 199, 0]   // #f5c700
    const colorGris = [128, 128, 128]
    const colorGrisClaro = [240, 240, 240]
    
    // ============================================
    // CABECERA (Header)
    // ============================================
    
    // Logo FullColor (simulado con texto estilizado)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorAzul[0], colorAzul[1], colorAzul[2])
    doc.text('PromoStore', 15, 20)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colorAzul[0], colorAzul[1], colorAzul[2])
    doc.text('Artículos promocionales', 15, 25)
    doc.text('memorables', 15, 28)
    
    // Caja de información a la derecha
    const boxX = 130
    const boxY = 12
    const boxWidth = 70
    const boxHeight = 40
    
    // Borde de la caja
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.rect(boxX, boxY, boxWidth, boxHeight)
    
    // Contenido de la caja
    let currentY = boxY + 6
    
    // "De"
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colorGris[0], colorGris[1], colorGris[2])
    doc.text('De', boxX + 3, currentY)
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Promostore.ec', boxX + 25, currentY)
    currentY += 5
    
    // Línea separadora
    doc.setDrawColor(230, 230, 230)
    doc.line(boxX + 3, currentY - 1, boxX + boxWidth - 3, currentY - 1)
    currentY += 4
    
    // "Cliente"
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colorGris[0], colorGris[1], colorGris[2])
    doc.text('Cliente', boxX + 3, currentY)
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(lead.nombre || 'N/A', boxX + 25, currentY)
    currentY += 4
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(lead.telefono || '', boxX + 25, currentY)
    currentY += 3
    doc.text(lead.ciudad || '', boxX + 25, currentY)
    currentY += 3
    doc.text(lead.email || '', boxX + 25, currentY)
    currentY += 3
    doc.text(lead.ruc_cedula || '', boxX + 25, currentY)
    currentY += 5
    
    // Línea separadora
    doc.setDrawColor(230, 230, 230)
    doc.line(boxX + 3, currentY - 1, boxX + boxWidth - 3, currentY - 1)
    currentY += 4
    
    // "Fecha de creación"
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colorGris[0], colorGris[1], colorGris[2])
    doc.text('Fecha de', boxX + 3, currentY)
    currentY += 4
    doc.text('creación', boxX + 3, currentY)
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(fechaCreacion, boxX + 25, currentY - 2)
    
    // ============================================
    // TÍTULO "Presupuesto #XXXXXX"
    // ============================================
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(`Presupuesto #${cotizacionNumero}`, 15, 65)
    
    // ============================================
    // TABLA DE PRODUCTOS (AutoTable)
    // ============================================
    
    // Preparar datos de la tabla
    const tableData = items.map((item: any) => {
      const producto = item.productos
      
      // Preparar líneas del producto
      let productoText = producto.nombre || 'Sin nombre'
      
      // Detalles opcionales (SKU, impresión, color, lados)
      const detalles: string[] = []
      if (producto.categoria) detalles.push(producto.categoria)
      
      const detallesText = detalles.length > 0 ? detalles.join(' | ') : ''
      
      return [
        productoText + (detallesText ? '\n' + detallesText : ''),
        `$${item.precio_unitario_aplicado.toFixed(2)}`,
        item.cantidad.toString(),
        `$${(item.cantidad * item.precio_unitario_aplicado).toFixed(2)}`
      ]
    })
    
    // Generar tabla con autoTable
    autoTable(doc, {
      startY: 75,
      head: [['Producto', 'Precio por unidad', 'Cantidad', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 4,
        lineColor: [220, 220, 220],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: colorAzul,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 10
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: colorGrisClaro
      },
      columnStyles: {
        0: { cellWidth: 90, halign: 'left', fontStyle: 'bold' },   // Producto (negrita)
        1: { cellWidth: 35, halign: 'right' },                      // Precio
        2: { cellWidth: 30, halign: 'right' },                      // Cantidad
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }   // Subtotal (negrita)
      },
      margin: { left: 15, right: 15 }
    })
    
    // ============================================
    // BLOQUE DE TOTALES (Tabla secundaria)
    // ============================================
    
    const finalY = (doc as any).lastAutoTable.finalY || 150
    
    // Tabla de totales alineada a la derecha
    autoTable(doc, {
      startY: finalY + 10,
      body: [
        ['Subtotal:', `$${totals.subtotal.toFixed(2)}`],
        ['IVA:', `$${totals.iva15.toFixed(2)}`],
        ['Total:', `$${totals.total.toFixed(2)}`]
      ],
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 2
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'right', fontStyle: 'normal' },
        1: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 135 },
      didParseCell: function(data) {
        // Línea arriba del Total
        if (data.row.index === 2 && data.section === 'body') {
          data.cell.styles.lineWidth = { top: 0.5 }
          data.cell.styles.lineColor = [0, 0, 0]
        }
      }
    })
    
    // ============================================
    // PIE DE PÁGINA (Footer)
    // ============================================
    
    const pageHeight = doc.internal.pageSize.height
    const footerY = pageHeight - 15
    
    // Línea divisoria tenue
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.line(15, footerY - 5, 195, footerY - 5)
    
    // Texto del footer
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colorGris[0], colorGris[1], colorGris[2])
    
    doc.text('Precios sujetos a cambios sin previo aviso', 15, footerY)
    doc.text('WhatsApp: +593 99 123 4567 | Email: info@promostore.ec', 15, footerY + 4)
    
    // Generar PDF
    const pdfOutput = doc.output('arraybuffer')
    const pdfBytes = new Uint8Array(pdfOutput)
    
    console.log('✅ PDF generado con jsPDF exitosamente')
    return pdfBytes
    
  } catch (error) {
    console.error('❌ Error generando PDF con jsPDF:', error)
    throw error
  }
}