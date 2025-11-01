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
    console.error('❌ ERROR obteniendo cotización:', {
      message: cotizacionError.message,
      code: cotizacionError.code,
      details: cotizacionError.details,
      hint: cotizacionError.hint
    })
    throw new Error(`Error obteniendo cotización: ${cotizacionError.message}`)
  }

  if (!cotizacion) {
    console.error('❌ Cotización no encontrada con ID:', quoteId)
    throw new Error(`Cotización ${quoteId} no existe`)
  }

  console.log('✅ Cotización obtenida:', {
    id: cotizacion.id,
    lead_id: cotizacion.lead_id,
    lead_nombre: cotizacion.leads?.nombre
  })

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

  if (itemsError) {
    console.error('❌ ERROR obteniendo items:', {
      message: itemsError.message,
      code: itemsError.code
    })
    throw new Error(`Error obteniendo items: ${itemsError.message}`)
  }

  if (!items || items.length === 0) {
    console.error('❌ No se encontraron items para cotización:', quoteId)
    throw new Error(`Cotización ${quoteId} no tiene items`)
  }

  console.log('✅ Items obtenidos:', items.length)

  // Calcular totales
  const totals = calculateTotals(items)

  return {
    cotizacion,
    items,
    totals
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
 * Utilidades: imágenes y formato de moneda
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function fetchAsDataUrl(url: string): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' } | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const contentType = res.headers.get('content-type') || ''
    const buf = await res.arrayBuffer()
    const base64 = arrayBufferToBase64(buf)
    const isPng = contentType.includes('png')
    const mime = isPng ? 'image/png' : 'image/jpeg'
    return { dataUrl: `data:${mime};base64,${base64}`, format: isPng ? 'PNG' : 'JPEG' }
  } catch (e) {
    console.warn('No se pudo cargar imagen', url, (e as Error).message)
    return null
  }
}

function formatCurrency(n: number) {
  return `$${n.toFixed(2)}`
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
    const fechaCreacion = new Date(cotizacion.created_at).toLocaleDateString('es-EC')
    
    console.log('✅ Datos preparados:', { items: items.length, cliente: lead.nombre })
    
    // COLORES DE MARCA FULLCOLOR
    const colorAzul = [0, 102, 161]      // #0066a1
    const colorAmarillo = [245, 199, 0]  // #f5c700
    const colorGris = [107, 114, 128]    // #6B7280
    const colorGrisClaro = [240, 240, 240]
    const colorGrisOscuro = [31, 41, 55] // #1F2937
    const colorLinea = [230, 230, 230]
    
    // ============================================
    // CABECERA (Header)
    // ============================================
    
    // Logo FullColor desde LOGO_URL o fallback a texto
    const LOGO_URL = Deno.env.get('LOGO_URL') || ''
    let drewLogo = false
    if (LOGO_URL) {
      const logo = await fetchAsDataUrl(LOGO_URL)
      if (logo) {
        try {
          doc.addImage(logo.dataUrl, logo.format, 15, 16, 40, 14)
          drewLogo = true
        } catch (_) {}
      }
    }
    if (!drewLogo) {
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(colorAzul[0], colorAzul[1], colorAzul[2])
      doc.text('FullColor', 15, 24)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('Servicios gráficos', 15, 29)
    }
    
    // Caja de información a la derecha
    const boxX = 130
    const boxY = 12
    const boxWidth = 70
    const boxHeight = 40
    
    // Borde de la caja
    doc.setDrawColor(colorLinea[0], colorLinea[1], colorLinea[2])
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
    doc.setTextColor(colorAzul[0], colorAzul[1], colorAzul[2])
    doc.text('FullColor — Servicios gráficos', boxX + 25, currentY)
    currentY += 5
    
    // Línea separadora
    doc.setDrawColor(colorLinea[0], colorLinea[1], colorLinea[2])
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
    // TÍTULO "Proforma #XXXXXX"
    // ============================================
    
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(colorAzul[0], colorAzul[1], colorAzul[2])
    doc.text(`Proforma #${cotizacionNumero}`, 15, 65)
    
    // ============================================
    // TABLA DE PRODUCTOS (AutoTable)
    // ============================================
    
    // Precargar imágenes y preparar datos
    const productImages = await Promise.all(items.map(async (item: any) => {
      const url = item.productos?.imagen_url
      return url ? await fetchAsDataUrl(url) : null
    }))

    const tableData = items.map((item: any) => {
      const producto = item.productos || {}
      const nombre = producto.nombre || 'Sin nombre'
      const detalles: string[] = []
      if (producto.categoria) detalles.push(producto.categoria)
      if ((item as any).sku) detalles.push(`SKU: ${(item as any).sku}`)
      if ((item as any).impresion) detalles.push(`Impresión: ${(item as any).impresion}`)
      if ((item as any).lados) detalles.push(`Lados: ${(item as any).lados}`)
      if ((item as any).color) detalles.push(`Color: ${(item as any).color}`)
      const detalleTexto = detalles.length ? `\n${detalles.join(' | ')}` : ''
      const precio = formatCurrency(item.precio_unitario_aplicado)
      const subtotal = formatCurrency(item.cantidad * item.precio_unitario_aplicado)
      return [' ', `${nombre}${detalleTexto}`, precio, item.cantidad.toString(), subtotal]
    })

    // Generar tabla con imagen y estilos
    autoTable(doc, {
      startY: 75,
      head: [['Imagen', 'Producto', 'Precio por unidad', 'Cantidad', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 4,
        lineColor: colorLinea,
        lineWidth: 0.1,
        minCellHeight: 28
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
        0: { cellWidth: 28, halign: 'center' },
        1: { cellWidth: 82, halign: 'left', fontStyle: 'bold' },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 18, halign: 'right' },
        4: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 0) {
          const img = productImages[data.row.index]
          const x = data.cell.x + 2
          const y = data.cell.y + 2
          const w = Math.max(10, data.cell.width - 4)
          const h = Math.max(10, data.cell.height - 4)
          if (img) {
            try {
              const maxW = w, maxH = h
              // relación aprox 4:3 como fallback
              let drawW = maxW, drawH = maxH
              if (maxW / maxH > 1.33) {
                drawW = maxH * 1.33
              } else {
                drawH = maxW / 1.33
              }
              const cx = x + (maxW - drawW) / 2
              const cy = y + (maxH - drawH) / 2
              doc.addImage(img.dataUrl, img.format, cx, cy, drawW, drawH, undefined, 'FAST')
            } catch (_) {
              doc.setFillColor(240, 240, 240)
              doc.rect(x, y, w, h, 'F')
              doc.setTextColor(150, 150, 150)
              doc.setFontSize(7)
              doc.text('sin imagen', x + w / 2, y + h / 2, { align: 'center', baseline: 'middle' })
            }
          } else {
            doc.setFillColor(240, 240, 240)
            doc.rect(x, y, w, h, 'F')
            doc.setTextColor(150, 150, 150)
            doc.setFontSize(7)
            doc.text('sin imagen', x + w / 2, y + h / 2, { align: 'center', baseline: 'middle' })
          }
        }
      }
    })
    
    // ============================================
    // BLOQUE DE TOTALES (Tabla secundaria)
    // ============================================
    
    const finalY = (doc as any).lastAutoTable.finalY || 150
    
    // Tabla de totales alineada a la derecha
    autoTable(doc, {
      startY: finalY + 8,
      body: [
        ['Subtotal:', formatCurrency(totals.subtotal)],
        ['IVA (15%):', formatCurrency(totals.iva15)],
        ['Total:', formatCurrency(totals.total)]
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
        0: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: colorAzul },
        1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 130 },
      didParseCell: function(data: any) {
        if (data.row.index === 2 && data.section === 'body') {
          data.cell.styles.lineWidth = { top: 0.6 }
          data.cell.styles.lineColor = colorLinea
          data.cell.styles.textColor = colorAzul
        }
      }
    })

    const afterTotalsY = (doc as any).lastAutoTable.finalY || finalY + 20
    // Notas y validez
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(colorGris[0], colorGris[1], colorGris[2])
    doc.text('Precios sujetos a cambios.', 15, afterTotalsY + 6)
    if (cotizacion.validez_dias) {
      doc.text(`Validez: ${cotizacion.validez_dias} días`, 15, afterTotalsY + 10)
    }
    
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
    
    doc.text('FullColor — Rocafuerte 302 y 23 de Abril, Machala', 15, footerY)
    doc.text('WhatsApp: +593 99 123 4567 | Email: info@fullcolor.ec | fullcolor.ec', 15, footerY + 4)
    
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