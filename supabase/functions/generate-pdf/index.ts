import { createClient } from 'jsr:@supabase/supabase-js@2';
import { HttpError, requirePrivilegedAccess } from '../_shared/security.ts';
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { z } from 'https://deno.land/x/zod@v3.24.1/mod.ts';
import { formatDateShort } from '../_shared/formatters.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Schema de validación para generación de PDF
const GeneratePdfSchema = z.object({
  quoteId: z.number().int().positive('ID de cotización inválido'),
  quoteToken: z.string().optional(),
});

async function ensureQuoteAccess(req: Request, quoteId: number, rawQuoteToken?: string) {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new HttpError(500, 'Faltan credenciales de Supabase');
  }

  const quoteToken = typeof rawQuoteToken === 'string' ? rawQuoteToken.trim() : '';

  if (quoteToken) {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('id')
      .eq('id', quoteId)
      .eq('access_token', quoteToken)
      .single();

    if (error || !data) {
      throw new HttpError(403, 'Acceso no autorizado a la cotización');
    }
    return;
  }

  await requirePrivilegedAccess({
    req,
    supabase,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey
  });
}
/**
 * Edge Function para generar PDF de cotizaciÃ³n
 * Genera PDFs profesionales usando jsPDF (sin plantillas HTML)
 */ Deno.serve(async (req)=>{
  // Headers CORS restrictivos usando módulo compartido
  const corsHeaders1 = getCorsHeaders(req);
  try {
    // Manejar preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return handleCorsPreflight(req);
    }
    // Verificar mÃ©todo HTTP
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'MÃ©todo no permitido'
      }), {
        status: 405,
        headers: corsHeaders1
      });
    }
    // Obtener y validar datos del request
    const body = await req.json();

    // Validar con Zod
    const validationResult = GeneratePdfSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ Validación de datos falló:', validationResult.error.flatten());
      return new Response(JSON.stringify({
        error: 'Datos inválidos',
        details: validationResult.error.flatten().fieldErrors
      }), {
        status: 400,
        headers: corsHeaders1
      });
    }

    const { quoteId, quoteToken } = validationResult.data;
    await ensureQuoteAccess(req, quoteId, quoteToken);
    console.log('🔍 Generando PDF profesional para cotización:', quoteId);
    // Generar PDF profesional directamente
    const pdfBuffer = await generateProfessionalPDF(quoteId);
    console.log('📄 PDF profesional generado, tamaño:', pdfBuffer.length, 'bytes');
    // Subir PDF a Supabase Storage
    const fileName = `cotizacion-${quoteId}-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('cotizaciones').upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false
    });
    if (uploadError) {
      throw new Error(`Error subiendo PDF: ${uploadError.message}`);
    }
    const storagePath = uploadData?.path ?? fileName;
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('cotizaciones')
      .createSignedUrl(storagePath, 3600);
    if (signedUrlError) {
      throw new Error(`No se pudo generar URL firmada: ${signedUrlError.message}`);
    }
    const pdfSignedUrl = signedUrlData?.signedUrl;
    // Actualizar estado de la cotización con el path del PDF
    const { error: updateError } = await supabase.from('cotizaciones').update({
      pdf_url: storagePath,
      estado: 'enviada'
    }).eq('id', quoteId);
    if (updateError) {
      console.warn('Error actualizando cotizaciÃ³n:', updateError.message);
    }
    // Registrar evento
    await supabase.from('eventos').insert({
      cotizacion_id: quoteId,
      tipo: 'pdf_generado',
      descripcion: `PDF generado: ${fileName}`,
      metadata: {
        fileName,
        storage_path: storagePath,
        signed_url: pdfSignedUrl
      }
    });
    console.log('â PDF profesional generado exitosamente:', pdfSignedUrl);
    // â¡ ENVIAR EMAIL AUTOMÃTICAMENTE
    let emailStatus = {
      sent: false,
      recipient: null,
      error: null
    };
    try {
      console.log('ð§ Enviando email automÃ¡ticamente...');
      const emailResponse = await supabase.functions.invoke('send-email', {
        body: {
          quoteId,
          quoteToken
        },
        headers: supabaseServiceKey
          ? {
              Authorization: `Bearer ${supabaseServiceKey}`
            }
          : undefined
      });
      if (emailResponse.error) {
        throw emailResponse.error;
      }
      if (emailResponse.data?.success) {
        emailStatus.sent = true;
        emailStatus.recipient = emailResponse.data.recipient;
        console.log('â Email enviado automÃ¡ticamente a:', emailResponse.data.recipient);
      }
    } catch (emailError) {
      // No bloquear la generaciÃ³n del PDF si falla el email
      console.warn('â ï¸ Error enviando email (no crÃ­tico):', emailError.message);
      emailStatus.error = emailError.message;
    }
    return new Response(JSON.stringify({
      success: true,
      pdfUrl: pdfSignedUrl,
      fileName,
      quoteId,
      emailSent: emailStatus.sent,
      emailRecipient: emailStatus.recipient,
      emailError: emailStatus.error
    }), {
      status: 200,
      headers: corsHeaders1
    });
  } catch (error) {
    console.error('Error en generate-pdf:', error);
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    return new Response(JSON.stringify({
      error: message,
      details: error instanceof Error ? error.message : String(error)
    }), {
      status,
      headers: corsHeaders1
    });
  }
});
/**
 * Genera PDF profesional usando datos reales de Supabase
 * Utiliza jsPDF para crear el documento directamente
 */ async function generateProfessionalPDF(quoteId) {
  try {
    console.log('ð Generando PDF profesional usando datos reales...');
    // 1. Obtener datos reales de Supabase
    const cotizacionData = await getCotizacionData(quoteId);
    console.log('â Datos de cotizaciÃ³n obtenidos:', cotizacionData.cotizacion.id);
    // 2. Generar PDF directamente con los datos
    const pdfBytes = await generatePDFFromData(cotizacionData);
    console.log('â PDF generado exitosamente con datos reales');
    return pdfBytes;
  } catch (error) {
    console.error('â Error generando PDF profesional:', error);
    throw error;
  }
}
/**
 * Obtiene datos reales de la cotizaciÃ³n desde Supabase
 */ async function getCotizacionData(quoteId) {
  console.log('ð Obteniendo datos reales para cotizaciÃ³n:', quoteId);
  // Obtener cotizaciÃ³n con lead
  const { data: cotizacion, error: cotizacionError } = await supabase.from('cotizaciones').select(`
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
    `).eq('id', quoteId).single();
  if (cotizacionError) {
    console.error('â ERROR obteniendo cotizaciÃ³n:', {
      message: cotizacionError.message,
      code: cotizacionError.code,
      details: cotizacionError.details,
      hint: cotizacionError.hint
    });
    throw new Error(`Error obteniendo cotizaciÃ³n: ${cotizacionError.message}`);
  }
  if (!cotizacion) {
    console.error('â CotizaciÃ³n no encontrada con ID:', quoteId);
    throw new Error(`CotizaciÃ³n ${quoteId} no existe`);
  }
  console.log('â CotizaciÃ³n obtenida:', {
    id: cotizacion.id,
    lead_id: cotizacion.lead_id,
    lead_nombre: cotizacion.leads?.nombre
  });
  // Obtener items de la cotizaciÃ³n con productos
  const { data: items, error: itemsError } = await supabase.from('items_cotizacion').select(`
      *,
      productos (
        nombre,
        categoria,
        imagen_url
      )
    `).eq('cotizacion_id', quoteId);
  if (itemsError) {
    console.error('â ERROR obteniendo items:', {
      message: itemsError.message,
      code: itemsError.code
    });
    throw new Error(`Error obteniendo items: ${itemsError.message}`);
  }
  if (!items || items.length === 0) {
    console.error('â No se encontraron items para cotizaciÃ³n:', quoteId);
    throw new Error(`CotizaciÃ³n ${quoteId} no tiene items`);
  }
  console.log('â Items obtenidos:', items.length);
  // Calcular totales
  const totals = calculateTotals(items);
  return {
    cotizacion,
    items,
    totals
  };
}
/**
 * Calcula totales desde los items
 */ function calculateTotals(items) {
  let subtotal = 0;
  let iva0 = 0;
  let iva15 = 0;
  items.forEach((item)=>{
    const itemSubtotal = item.cantidad * item.precio_unitario_aplicado;
    subtotal += itemSubtotal;
    // Asumir IVA 15% para todos los productos
    const iva = itemSubtotal * 0.15;
    iva15 += iva;
  });
  const total = subtotal + iva0 + iva15;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    iva0: Math.round(iva0 * 100) / 100,
    iva15: Math.round(iva15 * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}
/**
 * Utilidades: imÃ¡genes y formato de moneda
 */ function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for(let i = 0; i < bytes.byteLength; i++)binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
async function fetchAsDataUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    const isPng = contentType.includes('png');
    const mime = isPng ? 'image/png' : 'image/jpeg';
    return {
      dataUrl: `data:${mime};base64,${base64}`,
      format: isPng ? 'PNG' : 'JPEG'
    };
  } catch (e) {
    console.warn('No se pudo cargar imagen', url, e.message);
    return null;
  }
}
function formatCurrency(n) {
  return `$${n.toFixed(2)}`;
}
/**
 * Genera PDF directamente desde datos estructurados usando jsPDF
 */ async function generatePDFFromData(cotizacionData) {
  console.log('ð Generando PDF con jsPDF usando datos reales...');
  try {
    // Importar jsPDF y autoTable
    const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
    const autoTable = (await import('https://esm.sh/jspdf-autotable@3.8.2')).default;
    console.log('â jsPDF y autoTable importados correctamente');
    // Crear PDF con formato A4
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });
    // Preparar datos estructurados desde Supabase
    const cotizacion = cotizacionData.cotizacion;
    const items = cotizacionData.items;
    const totals = cotizacionData.totals;
    const lead = cotizacion.leads || {};
    const cotizacionNumero = cotizacion.id.toString();
    const fechaCreacion = formatDateShort(cotizacion.created_at);
    console.log('â Datos preparados:', {
      items: items.length,
      cliente: lead.nombre
    });
    // ============================================
    // PALETA DE COLORES FULLCOLOR + DIMENSIONES BASE
    // ============================================
    const colorAzulPrimario = [
      0,
      102,
      204
    ] // #0066CC - FullColor primary
    ;
    const colorAmarilloAccent = [
      255,
      215,
      0
    ] // #FFD700 - FullColor accent
    ;
    const colorNegro = [
      31,
      41,
      55
    ];
    const colorTexto = [
      55,
      65,
      81
    ];
    const colorGrisClaro = [
      107,
      114,
      128
    ];
    const colorMuted = [
      107,
      114,
      128
    ];
    const colorLinea = [
      229,
      231,
      235
    ];
    const colorFondoClaro = [
      249,
      250,
      251
    ];
    const colorTableHeader = [
      0,
      102,
      204
    ] // Azul primario para header
    ;
    const colorTableRowAlt = [
      245,
      247,
      250
    ];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    // Fondo blanco limpio
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    const invoiceCode = cotizacion.codigo || `FC-${cotizacionNumero}`;
    const validUntilDate = cotizacion.fecha_validez || cotizacion.validez_hasta || cotizacion.valido_hasta || cotizacion.fecha_expiracion || null;
    const validUntil = validUntilDate ? formatDateShort(validUntilDate) : formatDateShort(new Date(new Date(cotizacion.created_at).getTime() + 30 * 24 * 60 * 60 * 1000));
    const companyInfo = {
      name: 'FullColor Cotizador',
      tagline: 'Soluciones grÃ¡ficas profesionales',
      address: 'Parque de Negocios Beraca 2, Guayaquil - Ecuador',
      phone: '+593 99 549 0880',
      email: 'contacto@fullcolor.ec'
    };
    const leadName = lead?.nombre || lead?.empresa || 'Cliente';
    const leadLines = [
      lead?.empresa && lead?.empresa !== leadName ? lead.empresa : null,
      lead?.ciudad ? `${lead.ciudad}` : null,
      lead?.telefono ? `TelÃ©fono: ${lead.telefono}` : null,
      lead?.email || null
    ].filter(Boolean);
    // ============================================
    // HEADER MODERNO CON DISEÃO LIMPIO
    // ============================================
    const headerTop = margin // Alineado con el margen superior
    ;
    const logoUrl = Deno.env.get('FULLCOLOR_LOGO_URL') || Deno.env.get('LOGO_URL') || '';
    const logoHeight = 22 // TamaÃ±o balanceado para el diseÃ±o
    ;
    let headerLeftBottom = headerTop;
    // Logo o marca con icono
    const drawFallbackBrand = (y)=>{
      // Icono de tienda pequeÃ±o con fondo azul
      doc.setFillColor(colorAzulPrimario[0], colorAzulPrimario[1], colorAzulPrimario[2]);
      doc.roundedRect(margin, y, 11, 11, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('FC', margin + 2.8, y + 7.5);
      // Nombre de la empresa al lado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
      doc.text(companyInfo.name, margin + 14, y + 7.5);
      return y + 11;
    };
    if (logoUrl) {
      const logoData = await fetchAsDataUrl(logoUrl);
      if (logoData) {
        try {
          const props = doc.getImageProperties?.(logoData.dataUrl);
          const ratio = props?.width && props?.height ? props.width / props.height : 2.5;
          const logoWidth = logoHeight * ratio;
          doc.addImage(logoData.dataUrl, logoData.format, margin, headerTop, logoWidth, logoHeight, undefined, 'FAST');
          headerLeftBottom = headerTop + logoHeight;
        } catch (_) {
          headerLeftBottom = drawFallbackBrand(headerTop);
        }
      } else {
        headerLeftBottom = drawFallbackBrand(headerTop);
      }
    } else {
      headerLeftBottom = drawFallbackBrand(headerTop);
    }
    const headerBottom = headerLeftBottom + 4;
    // LÃ­nea separadora sutil
    doc.setDrawColor(colorLinea[0], colorLinea[1], colorLinea[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, headerBottom + 6, pageWidth - margin, headerBottom + 6);
    let cursorY = headerBottom + 14;
    // ============================================
    // BLOQUE DE INFORMACIÃN SIN BORDES - DISEÃO LIMPIO
    // ============================================
    const summaryWidth = 65;
    const infoGap = 12;
    const infoWidth = contentWidth - summaryWidth - infoGap;
    const infoColumnsGap = 16;
    const infoColumnWidth = (infoWidth - infoColumnsGap) / 2;
    const infoBoxY = cursorY;
    const infoLabelColor = colorGrisClaro;
    let contentBottom = infoBoxY;
    const renderInfoColumn = (label, name, details, x)=>{
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(infoLabelColor[0], infoLabelColor[1], infoLabelColor[2]);
      const labelUpper = label.toUpperCase() + ':';
      doc.text(labelUpper, x, infoBoxY + 2);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
      doc.text(name || 'N/A', x, infoBoxY + 9);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
      const wrappedDetails = doc.splitTextToSize(details.join('\n'), infoColumnWidth - 2);
      doc.text(wrappedDetails, x, infoBoxY + 15);
      return infoBoxY + 15 + wrappedDetails.length * 4;
    };
    const fromDetails = [
      companyInfo.address,
      `TelÃ©fono: ${companyInfo.phone}`,
      companyInfo.email
    ];
    const toDetails = leadLines.length ? leadLines : [
      'InformaciÃ³n pendiente'
    ];
    const fromBottom = renderInfoColumn('De', companyInfo.name, fromDetails, margin);
    const toBottom = renderInfoColumn('Cliente', leadName, toDetails, margin + infoColumnWidth + infoColumnsGap);
    contentBottom = Math.max(fromBottom, toBottom);
    const infoBoxHeight = contentBottom - infoBoxY + 6;
    // InformaciÃ³n de la derecha (Invoice #, Date, Valid Until) SIN TARJETA
    const summaryX = margin + infoWidth + infoGap;
    const summaryItems = [
      {
        label: 'Factura #',
        value: invoiceCode
      },
      {
        label: 'Fecha',
        value: fechaCreacion
      },
      {
        label: 'VÃ¡lido Hasta',
        value: validUntil
      }
    ];
    let summaryY = infoBoxY + 2;
    summaryItems.forEach((item)=>{
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(infoLabelColor[0], infoLabelColor[1], infoLabelColor[2]);
      doc.text(item.label, summaryX, summaryY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
      doc.text(item.value, pageWidth - margin, summaryY, {
        align: 'right'
      });
      summaryY += 11;
    });
    cursorY += infoBoxHeight + 16;
    // ============================================
    // TABLA DE PRODUCTOS CON ESCALA DE GRISES
    // ============================================
    const productImages = await Promise.all(items.map(async (item)=>{
      const url = item.productos?.imagen_url;
      return url ? await fetchAsDataUrl(url) : null;
    }));
    const tableData = items.map((item)=>{
      const producto = item.productos || {};
      const nombre = producto.nombre || 'Sin nombre';
      const detalles = [];
      if (item.impresion) detalles.push(` ${item.impresion}`);
      if (item.color) detalles.push(` ${item.color}`);
      // DescripciÃ³n en una sola lÃ­nea con detalles separados por comas
      const descripcion = detalles.length ? `${nombre}, ${detalles.join(',')}` : nombre;
      return [
        '',
        descripcion,
        item.cantidad.toString(),
        formatCurrency(item.precio_unitario_aplicado),
        formatCurrency(item.cantidad * item.precio_unitario_aplicado)
      ];
    });
    const tableStartY = cursorY;
    autoTable(doc, {
      startY: tableStartY,
      head: [
        [
          'Item',
          'DescripciÃ³n',
          'Cantidad',
          'Precio Unitario',
          'Total'
        ]
      ],
      body: tableData,
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: {
          top: 6,
          right: 5,
          bottom: 6,
          left: 5
        },
        textColor: colorTexto,
        lineWidth: 0,
        lineColor: [
          220,
          220,
          220
        ],
        overflow: 'visible',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [
          0,
          104,
          164
        ],
        textColor: [
          255,
          255,
          255
        ],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
        cellPadding: {
          top: 7,
          right: 5,
          bottom: 7,
          left: 5
        }
      },
      alternateRowStyles: {
        fillColor: [
          250,
          250,
          250
        ] // Gris muy claro
      },
      columnStyles: {
        0: {
          cellWidth: 18,
          halign: 'center'
        },
        1: {
          cellWidth: 82,
          halign: 'left',
          overflow: 'visible'
        },
        2: {
          cellWidth: 20,
          halign: 'center'
        },
        3: {
          cellWidth: 28,
          halign: 'right'
        },
        4: {
          cellWidth: 26,
          halign: 'right'
        }
      },
      margin: {
        left: margin,
        right: margin
      },
      tableWidth: contentWidth,
      tableLineColor: [
        220,
        220,
        220
      ],
      tableLineWidth: 0,
      didParseCell: (data)=>{
        if (data.section === 'body') {
          if (data.column.index === 4) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = colorNegro;
          }
        }
      },
      didDrawCell: (data)=>{
        // ImÃ¡genes de productos
        if (data.section === 'body' && data.column.index === 0) {
          const img = productImages[data.row.index];
          if (img) {
            try {
              const imgSize = 14;
              const imgX = data.cell.x + (data.cell.width - imgSize) / 2;
              const imgY = data.cell.y + (data.cell.height - imgSize) / 2;
              doc.addImage(img.dataUrl, img.format, imgX, imgY, imgSize, imgSize, undefined, 'FAST');
            } catch (_) {}
          }
          // LÃ­nea divisoria entre rows
          if (data.row.index < tableData.length - 1) {
            const rowY = data.cell.y + data.cell.height;
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.line(margin, rowY, pageWidth - margin, rowY);
          }
        }
      }
    });
    const tableEndY = doc.lastAutoTable?.finalY || tableStartY;
    cursorY = tableEndY + 18;
    // ============================================
    // TERMS, BANK & TOTALS CON DISEÃO LIMPIO
    // ============================================
    const totalsWidth = 80;
    const totalsX = margin + contentWidth - totalsWidth;
    const notesWidth = totalsX - margin - 14;
    // TÃ©rminos y condiciones en caja
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    doc.text('TÃ©rminos y Condiciones', margin, cursorY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
    const termsText = doc.splitTextToSize('Pago dentro de 30 dÃ­as. Entrega entre 2-3 semanas despuÃ©s de la confirmaciÃ³n del pago. Todos los artÃ­culos sujetos a disponibilidad.', notesWidth);
    doc.text(termsText, margin, cursorY + 6);
    let notesBottomY = cursorY + 6 + termsText.length * 3.8;
    // SecciÃ³n de totales limpia sin bordes
    const totalsBoxY = cursorY;
    let totalsRowY = totalsBoxY;
    const drawValueRow = (label, value, isStrong = false)=>{
      if (isStrong) {
        // LÃ­nea separadora antes del total
        doc.setDrawColor(colorNegro[0], colorNegro[1], colorNegro[2]);
        doc.setLineWidth(0.5);
        doc.line(totalsX, totalsRowY, totalsX + totalsWidth, totalsRowY);
        totalsRowY += 8;
        // Total General en negrita sin fondo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
        doc.text(label, totalsX, totalsRowY);
        doc.text(value, totalsX + totalsWidth, totalsRowY, {
          align: 'right'
        });
        totalsRowY += 12;
      } else {
        // Subtotal e IVA con lÃ­nea punteada
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        doc.text(label, totalsX, totalsRowY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(value, totalsX + totalsWidth, totalsRowY, {
          align: 'right'
        });
        // LÃ­nea punteada sutil
        doc.setDrawColor(colorLinea[0], colorLinea[1], colorLinea[2]);
        doc.setLineWidth(0.2);
        doc.setLineDash([
          1,
          1
        ], 0);
        doc.line(totalsX, totalsRowY + 2, totalsX + totalsWidth, totalsRowY + 2);
        doc.setLineDash([], 0);
        totalsRowY += 10;
      }
    };
    drawValueRow('Subtotal', formatCurrency(totals.subtotal));
    drawValueRow('Impuestos (IVA 15%)', formatCurrency(totals.iva15));
    // Espacio antes del total
    totalsRowY += 2;
    drawValueRow('Total General', formatCurrency(totals.total), true);
    const rightBottomY = totalsRowY;
    cursorY = Math.max(notesBottomY, rightBottomY) + 20;
    // ============================================
    // FOOTER MODERNO Y LIMPIO
    // ============================================
    const footerY = pageHeight - 28;
    doc.setDrawColor(colorLinea[0], colorLinea[1], colorLinea[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colorNegro[0], colorNegro[1], colorNegro[2]);
    doc.text('Â¡Gracias por su preferencia!', pageWidth / 2, footerY + 7, {
      align: 'center'
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorMuted[0], colorMuted[1], colorMuted[2]);
    doc.text(`${companyInfo.email}  â¢  ${companyInfo.phone}`, pageWidth / 2, footerY + 12, {
      align: 'center'
    });
    const pdfOutput = doc.output('arraybuffer');
    const pdfBytes = new Uint8Array(pdfOutput);
    console.log('â PDF generado con jsPDF exitosamente');
    return pdfBytes;
  } catch (error) {
    console.error('â Error generando PDF con jsPDF:', error);
    throw error;
  }
}

