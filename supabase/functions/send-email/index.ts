import { createClient } from 'jsr:@supabase/supabase-js@2'

// Headers CORS globales
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

interface EmailTemplateData {
  cotizacionNumero: string
  fecha: string
  clienteNombre: string
  clienteEmail: string
  items: Array<{
    cantidad: number
    nombre: string
    categoria: string
    precioUnitario: number
    subtotal: number
  }>
  subtotal: number
  iva15: number
  total: number
  pdfUrl: string
  validezDias: number
}

/**
 * Genera HTML profesional para el email de cotización
 * Diseño responsive con colores de marca FullColor (#0066a1, #f5c700)
 */
function generateEmailHTML(data: EmailTemplateData): string {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #1a1a1a; font-size: 14px;">${item.nombre}</strong><br/>
        <span style="color: #6b7280; font-size: 12px;">${item.categoria}</span>
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #1a1a1a;">
        ${item.cantidad}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1a1a1a;">
        $${item.precioUnitario.toFixed(2)}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #0066a1; font-weight: 600;">
        $${item.subtotal.toFixed(2)}
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Cotización ${data.cotizacionNumero} - FullColor</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header con colores de marca -->
          <tr>
            <td style="background: linear-gradient(135deg, #0066a1 0%, #004a7c 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                FullColor
              </h1>
              <p style="margin: 10px 0 0; color: #f5c700; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
                IMPRESIÓN Y MERCHANDISING
              </p>
            </td>
          </tr>

          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Saludo -->
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                ¡Hola ${data.clienteNombre}!
              </h2>
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Gracias por tu interés en nuestros servicios. Aquí está tu cotización personalizada:
              </p>

              <!-- Info de cotización -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; background-color: #f9fafb; border-radius: 6px; padding: 16px;">
                <tr>
                  <td style="padding: 4px 0;">
                    <strong style="color: #0066a1; font-size: 14px;">Cotización:</strong>
                    <span style="color: #1a1a1a; font-size: 14px; margin-left: 8px;">${data.cotizacionNumero}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">
                    <strong style="color: #0066a1; font-size: 14px;">Fecha:</strong>
                    <span style="color: #1a1a1a; font-size: 14px; margin-left: 8px;">${data.fecha}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">
                    <strong style="color: #0066a1; font-size: 14px;">Validez:</strong>
                    <span style="color: #1a1a1a; font-size: 14px; margin-left: 8px;">${data.validezDias} días</span>
                  </td>
                </tr>
              </table>

              <!-- Tabla de productos -->
              <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                Productos cotizados
              </h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #0066a1;">
                    <th style="padding: 12px 8px; text-align: left; color: #ffffff; font-size: 13px; font-weight: 600;">Producto</th>
                    <th style="padding: 12px 8px; text-align: center; color: #ffffff; font-size: 13px; font-weight: 600;">Cantidad</th>
                    <th style="padding: 12px 8px; text-align: right; color: #ffffff; font-size: 13px; font-weight: 600;">Precio Unit.</th>
                    <th style="padding: 12px 8px; text-align: right; color: #ffffff; font-size: 13px; font-weight: 600;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <!-- Totales -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; text-align: right; color: #6b7280; font-size: 15px;">
                    Subtotal:
                  </td>
                  <td style="padding: 8px 0 8px 20px; text-align: right; color: #1a1a1a; font-size: 15px; font-weight: 500; width: 120px;">
                    $${data.subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; text-align: right; color: #6b7280; font-size: 15px;">
                    IVA (15%):
                  </td>
                  <td style="padding: 8px 0 8px 20px; text-align: right; color: #1a1a1a; font-size: 15px; font-weight: 500;">
                    $${data.iva15.toFixed(2)}
                  </td>
                </tr>
                <tr style="border-top: 2px solid #0066a1;">
                  <td style="padding: 12px 0 0; text-align: right; color: #0066a1; font-size: 18px; font-weight: 700;">
                    TOTAL:
                  </td>
                  <td style="padding: 12px 0 0 20px; text-align: right; color: #0066a1; font-size: 18px; font-weight: 700;">
                    $${data.total.toFixed(2)}
                  </td>
                </tr>
              </table>

              <!-- Botón de descarga -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${data.pdfUrl}" style="display: inline-block; padding: 16px 40px; background-color: #f5c700; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(245, 199, 0, 0.3);">
                      📄 Descargar PDF Completo
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Nota adicional -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f5c700; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  💡 <strong>Nota:</strong> Esta cotización tiene una validez de ${data.validezDias} días. Los precios están sujetos a disponibilidad de stock.
                </p>
              </div>

              <!-- CTA -->
              <p style="margin: 0 0 10px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                ¿Listo para confirmar tu pedido?
              </p>
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Contáctanos por WhatsApp o responde este email. ¡Estamos para ayudarte!
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #0066a1; font-size: 16px; font-weight: 600;">
                FullColor - Impresión y Merchandising
              </p>
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                📧 info@fullcolor.com | 📱 +593 99 123 4567
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Recibiste este email porque solicitaste una cotización en nuestro sitio web.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Edge Function para enviar emails de cotizaciones usando SendGrid
 */
Deno.serve(async (req: Request) => {
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    console.log('📧 send-email function invoked')
    console.log('Method:', req.method)

    // Configuración de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Configuración de SendGrid
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'carlosmatiasflor@gmail.com'
    const fromName = Deno.env.get('FROM_NAME') || 'FullColor'

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
      supabaseServiceKey: supabaseServiceKey ? 'Present' : 'Missing',
      sendgridApiKey: sendgridApiKey ? 'Present' : 'Missing',
      fromEmail,
      fromName
    })

    // Validar variables de entorno
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials')
      return new Response(
        JSON.stringify({ 
          error: 'Configuración de Supabase incompleta',
          details: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
        }),
        { 
          status: 500,
          headers: corsHeaders
        }
      )
    }

    if (!sendgridApiKey) {
      console.error('❌ Missing SendGrid API Key')
      return new Response(
        JSON.stringify({ 
          error: 'Configuración de SendGrid incompleta',
          details: 'Falta SENDGRID_API_KEY'
        }),
        { 
          status: 500,
          headers: corsHeaders
        }
      )
    }

    // Inicializar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    const { quoteId, recipientEmail } = await req.json()
    
    if (!quoteId) {
      return new Response(
        JSON.stringify({ error: 'ID de cotización requerido' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    console.log('📧 Iniciando envío de email para cotización:', quoteId)

    // 1. Obtener datos de la cotización desde la BD
    const { data: cotizacion, error: cotizacionError } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        leads (
          nombre,
          email,
          telefono,
          empresa
        )
      `)
      .eq('id', quoteId)
      .single()

    if (cotizacionError || !cotizacion) {
      console.error('❌ Error obteniendo cotización:', cotizacionError)
      return new Response(
        JSON.stringify({ 
          error: 'Cotización no encontrada',
          details: cotizacionError?.message 
        }),
        { 
          status: 404,
          headers: corsHeaders
        }
      )
    }

    // 2. Obtener items de la cotización
    const { data: items, error: itemsError } = await supabase
      .from('items_cotizacion')
      .select(`
        *,
        productos (
          nombre,
          categoria
        )
      `)
      .eq('cotizacion_id', quoteId)

    if (itemsError || !items || items.length === 0) {
      console.error('❌ Error obteniendo items:', itemsError)
      return new Response(
        JSON.stringify({ 
          error: 'Items de cotización no encontrados',
          details: itemsError?.message 
        }),
        { 
          status: 404,
          headers: corsHeaders
        }
      )
    }

    // 3. Determinar email destinatario
    const toEmail = recipientEmail || cotizacion.leads?.email
    
    if (!toEmail) {
      console.error('❌ No hay email del lead ni email alternativo')
      return new Response(
        JSON.stringify({ 
          error: 'Email destinatario no especificado',
          details: 'El lead no tiene email configurado y no se proporcionó uno alternativo'
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    // 4. Validar que exista PDF
    if (!cotizacion.pdf_url) {
      console.error('❌ Cotización sin PDF generado')
      return new Response(
        JSON.stringify({ 
          error: 'PDF no generado',
          details: 'Primero debe generarse el PDF de la cotización'
        }),
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    // 5. Calcular totales
    let subtotal = 0
    items.forEach(item => {
      subtotal += item.cantidad * item.precio_unitario_aplicado
    })
    const iva15 = subtotal * 0.15
    const total = subtotal + iva15

    // 6. Preparar datos para la plantilla
    const emailData: EmailTemplateData = {
      cotizacionNumero: `FC-2025-${cotizacion.id.toString().padStart(3, '0')}`,
      fecha: new Date(cotizacion.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      clienteNombre: cotizacion.leads?.nombre || 'Cliente',
      clienteEmail: toEmail,
      items: items.map(item => ({
        cantidad: item.cantidad,
        nombre: item.productos.nombre,
        categoria: item.productos.categoria,
        precioUnitario: parseFloat(item.precio_unitario_aplicado),
        subtotal: item.cantidad * parseFloat(item.precio_unitario_aplicado)
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      iva15: Math.round(iva15 * 100) / 100,
      total: Math.round(total * 100) / 100,
      pdfUrl: cotizacion.pdf_url,
      validezDias: cotizacion.validez_dias || 30
    }

    console.log('✅ Datos preparados:', {
      to: toEmail,
      cotizacion: emailData.cotizacionNumero,
      items: emailData.items.length,
      total: emailData.total
    })

    // 7. Generar contenido del email
    const htmlContent = generateEmailHTML(emailData)

    // 8. Enviar email usando SendGrid
    console.log('📤 Enviando email vía SendGrid...')
    
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: toEmail }],
          subject: `Tu Cotización ${emailData.cotizacionNumero} - FullColor`
        }],
        from: {
          email: fromEmail,
          name: fromName
        },
        content: [{
          type: 'text/html',
          value: htmlContent
        }],
        reply_to: {
          email: fromEmail,
          name: fromName
        }
      })
    })

    if (!sendgridResponse.ok) {
      const errorText = await sendgridResponse.text()
      console.error('❌ SendGrid error:', errorText)
      throw new Error(`Error enviando email: ${sendgridResponse.status} - ${errorText}`)
    }

    console.log('📧 Email enviado exitosamente vía SendGrid')

    // 9. Registrar evento en la base de datos
    const { error: eventoError } = await supabase
      .from('eventos')
      .insert({
        cotizacion_id: quoteId,
        tipo: 'email_enviado',
        metadata: {
          recipient: toEmail,
          cotizacion_numero: emailData.cotizacionNumero,
          total: emailData.total,
          provider: 'sendgrid',
          sent_at: new Date().toISOString()
        }
      })

    if (eventoError) {
      console.warn('⚠️ Error registrando evento:', eventoError.message)
    }

    console.log('✅ Email enviado exitosamente a:', toEmail)

    // 10. Retornar respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true,
        recipient: toEmail,
        cotizacionNumero: emailData.cotizacionNumero,
        message: `Email enviado exitosamente a ${toEmail}`
      }),
      { 
        status: 200,
        headers: corsHeaders
      }
    )

  } catch (error) {
    console.error('❌ Error en send-email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
})
