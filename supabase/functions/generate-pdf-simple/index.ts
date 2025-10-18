import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Cliente con permisos de servicio para leer datos
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Edge Function para generar PDF de cotización
 * Versión simplificada para Supabase Edge Functions
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

    console.log('🔍 Generando PDF para cotización:', quoteId)

    // Obtener datos de la cotización
    const quoteData = await getQuoteData(quoteId)
    
    // Generar HTML usando plantilla simple
    const html = generateSimpleHTML(quoteData)
    
    // Simular generación de PDF (por ahora)
    const pdfBuffer = new TextEncoder().encode(html)
    
    // Crear URL simulada del PDF
    const fileName = `cotizacion-${quoteId}-${Date.now()}.pdf`
    const simulatedPdfUrl = `https://storage.supabase.co/cotizaciones/${fileName}`

    // Actualizar estado de la cotización con URL del PDF
    const { error: updateError } = await supabase
      .from('cotizaciones')
      .update({ 
        pdf_url: simulatedPdfUrl,
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
        metadata: { fileName, url: simulatedPdfUrl }
      })

    console.log('✅ PDF generado exitosamente:', simulatedPdfUrl)

    return new Response(
      JSON.stringify({ 
        success: true,
        pdfUrl: simulatedPdfUrl,
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
 * Obtiene datos de la cotización desde Supabase
 */
async function getQuoteData(quoteId: number) {
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

  return {
    cotizacion,
    lead: cotizacion.leads,
    items
  }
}

/**
 * Genera HTML simple para la cotización
 */
function generateSimpleHTML(data: any): string {
  const { cotizacion, lead, items } = data
  
  const itemsHTML = items.map((item: any) => `
    <tr>
      <td>${item.cantidad}</td>
      <td>${item.productos.nombre}</td>
      <td>$${item.precio_unitario_aplicado.toFixed(2)}</td>
      <td>$${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cotización ${cotizacion.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { background-color: #0066a1; color: white; padding: 20px; }
        .total { font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>COTIZACIÓN FC-2025-${cotizacion.id.toString().padStart(3, '0')}</h1>
        <p>Fecha: ${new Date(cotizacion.created_at).toLocaleDateString('es-ES')}</p>
      </div>
      
      <h2>Cliente</h2>
      <p><strong>${lead.nombre}</strong></p>
      <p>RUC/Cédula: ${lead.ruc_cedula || 'No especificado'}</p>
      <p>Email: ${lead.email}</p>
      <p>Teléfono: ${lead.telefono || 'No especificado'}</p>
      <p>Ciudad: ${lead.ciudad || 'No especificado'}</p>
      
      <h2>Productos</h2>
      <table>
        <thead>
          <tr>
            <th>Cantidad</th>
            <th>Producto</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div class="total">
        <p>Total: $${cotizacion.total.toFixed(2)}</p>
      </div>
      
      <p><em>Precios en USD. Validez 30 días.</em></p>
    </body>
    </html>
  `
}
