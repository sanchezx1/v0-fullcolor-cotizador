import { createClient } from 'jsr:@supabase/supabase-js@2';
import { HttpError, requirePrivilegedAccess } from '../_shared/security.ts';
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { z } from 'https://deno.land/x/zod@v3.24.1/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Schema de validación para envío de email
const SendEmailSchema = z.object({
  quoteId: z.number().int().positive('ID de cotización inválido'),
  recipientEmail: z.string().email('Email inválido').optional(),
  quoteToken: z.string().optional(),
  emailType: z.enum(['quote_created', 'quote_updated', 'status_change']).default('quote_created'),
  newStatus: z.enum(['en_revision', 'aprobada', 'rechazada', 'vencida']).optional(),
});

const STATUS_LABELS: Record<string, string> = {
  enviada: 'Enviada',
  en_revision: 'En revision',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  vencida: 'Vencida'
};

const STATUS_MESSAGES: Record<string, string> = {
  en_revision: 'Tu cotizacion esta en revision por nuestro equipo. Te confirmaremos ajustes y tiempos en breve.',
  aprobada: 'Tu cotizacion fue aprobada. Podemos coordinar pago, produccion y entrega desde ahora.',
  rechazada: 'La cotizacion fue rechazada. Si necesitas alternativas o ajustes, estamos para ayudarte.',
  vencida: 'La validez de tu cotizacion expiro. Podemos actualizarla si aun la necesitas.'
};

const STATUS_SUBJECTS: Record<string, string> = {
  en_revision: 'Estamos revisando tu cotizacion',
  aprobada: '¡Tu cotizacion fue aprobada',
  rechazada: 'Actualizacion: cotizacion rechazada',
  vencida: 'Tu cotizacion vencio, podemos actualizarla'
};

async function logEmailAttempt(params: {
  quoteId: number;
  toEmail: string;
  tipoCorreo: string;
  estadoEnvio: 'sent' | 'error';
  errorMessage?: string | null;
  sendgridMessageId?: string | null;
}) {
  try {
    await supabase.from('email_logs').insert({
      quote_id: params.quoteId,
      to_email: params.toEmail,
      tipo_correo: params.tipoCorreo,
      estado_envio: params.estadoEnvio,
      error_message: params.errorMessage ?? null,
      sendgrid_message_id: params.sendgridMessageId ?? null
    });
  } catch (error) {
    console.warn('⚠️ No se pudo registrar el log de email:', error);
  }
}

function normalizePdfPath(rawPath) {
  if (!rawPath) return null;
  const match = rawPath.match(/cotizaciones\/(.+)$/);
  if (match) {
    return match[1];
  }
  return rawPath.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/cotizaciones\//, '');
}

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

  // Si no se envía quoteToken, aceptar llamadas privilegiadas o anónimas (para flujo público) sin bloquear el correo.
  const authHeader = req.headers.get('Authorization');
  const parsedToken = authHeader?.replace(/Bearer\s+/i, '').trim() || '';

  if (supabaseServiceKey && parsedToken === supabaseServiceKey) {
    console.log('⚠️ send-email: usando service key sin quoteToken');
    return;
  }

  if (supabaseAnonKey && parsedToken === supabaseAnonKey) {
    console.warn('⚠️ send-email: invocation anon sin quoteToken, se continuará con validación interna.');
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
 * Genera HTML para email de notificación al admin
 */ function generateAdminNotificationHTML(data) {
  const itemsHTML = data.items.map((item)=>`
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
  `).join('');
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Cotización ${data.cotizacionNumero}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f5c700 0%, #e6b800 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 700;">
                🔔 Nueva Cotización
              </h1>
              <p style="margin: 10px 0 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">
                ${data.cotizacionNumero}
              </p>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Se ha recibido una nueva solicitud de cotización desde el sitio web.
              </p>

              <!-- Info del cliente -->
              <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                👤 Información del Cliente
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; background-color: #f9fafb; border-radius: 6px; padding: 16px;">
                <tr>
                  <td style="padding: 4px 0;">
                    <strong style="color: #0066a1; font-size: 14px;">Nombre:</strong>
                    <span style="color: #1a1a1a; font-size: 14px; margin-left: 8px;">${data.clienteNombre}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">
                    <strong style="color: #0066a1; font-size: 14px;">Email:</strong>
                    <span style="color: #1a1a1a; font-size: 14px; margin-left: 8px;">${data.clienteEmail}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0;">
                    <strong style="color: #0066a1; font-size: 14px;">Fecha:</strong>
                    <span style="color: #1a1a1a; font-size: 14px; margin-left: 8px;">${data.fecha}</span>
                  </td>
                </tr>
              </table>

              <!-- Productos -->
              <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                📦 Productos Solicitados
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
                <tr style="border-top: 2px solid #0066a1;">
                  <td style="padding: 12px 0 0; text-align: right; color: #0066a1; font-size: 18px; font-weight: 700;">
                    TOTAL:
                  </td>
                  <td style="padding: 12px 0 0 20px; text-align: right; color: #0066a1; font-size: 18px; font-weight: 700; width: 120px;">
                    $${data.total.toFixed(2)}
                  </td>
                </tr>
              </table>

              <!-- Botón PDF -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${data.pdfUrl}" style="display: inline-block; padding: 16px 40px; background-color: #0066a1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      📄 Ver PDF de Cotización
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                Responde al cliente lo antes posible para cerrar la venta.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Notificación automática del sistema de cotizaciones FullColor
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateStatusEmailHTML(data) {
  const showPdf = Boolean(data.pdfUrl);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualizacion de cotizacion ${data.cotizacionNumero}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #0066a1 0%, #004a7c 100%); padding: 26px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Actualizacion de tu cotizacion</h1>
              <p style="margin: 8px 0 0; color: #f5c700; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">${data.cotizacionNumero}</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 14px; color: #1f2937; font-size: 17px; font-weight: 600;">Hola ${data.clienteNombre},</p>
              <p style="margin: 0 0 18px; color: #4b5563; font-size: 15px; line-height: 1.6;">${data.statusMessage}</p>

              <div style="margin: 0 0 20px; padding: 12px 14px; border-radius: 8px; background-color: #eef2ff; border: 1px solid #e0e7ff;">
                <strong style="color: #3730a3;">Estado: ${data.estadoLabel}</strong>
                <p style="margin: 6px 0 0; color: #4338ca; font-size: 13px;">Actualizada el ${data.fecha}</p>
                <p style="margin: 6px 0 0; color: #111827; font-size: 14px; font-weight: 600;">Total estimado: $${data.total.toFixed(2)}</p>
              </div>

              ${
                showPdf
                  ? `<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom: 16px;\">
                      <tr>
                        <td align=\"center\">
                          <a href=\"${data.pdfUrl}\" style=\"display: inline-block; padding: 14px 34px; background-color: #f5c700; color: #1f2937; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 15px;\">Ver PDF de la cotizacion</a>
                        </td>
                      </tr>
                    </table>`
                  : ''
              }

              <p style="margin: 0 0 10px; color: #111827; font-size: 15px; font-weight: 600;">Necesitas ayuda?</p>
              <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">Responde este correo o contactanos por WhatsApp. Estamos atentos para continuar con tu pedido.</p>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 26px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #0066a1; font-size: 15px; font-weight: 600;">FullColor - Impresion y Merchandising</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">Recibiste este correo porque solicitaste una cotizacion en nuestro sitio.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}


/**
 * Genera HTML profesional para el email de cotización
 * Diseño responsive con colores de marca FullColor (#0066a1, #f5c700)
 */ function generateEmailHTML(data) {
  const itemsHTML = data.items.map((item)=>`
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
  `).join('');
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
  `.trim();
}
/**
 * Edge Function para enviar emails de cotizaciones usando SendGrid
 */ Deno.serve(async (req)=>{
  const corsHeaders = getCorsHeaders(req);
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req);
  }
  try {
    console.log('📧 send-email function invoked');
    console.log('Method:', req.method);
    // Configuración de SendGrid
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'carlosmatiasflor@gmail.com';
    const fromName = Deno.env.get('FROM_NAME') || 'FullColor';
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || fromEmail;
    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
      supabaseServiceKey: supabaseServiceKey ? 'Present' : 'Missing',
      sendgridApiKey: sendgridApiKey ? 'Present' : 'Missing',
      fromEmail,
      fromName,
      adminEmail
    });
    // Validar variables de entorno
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials');
      return new Response(JSON.stringify({
        error: 'Configuración de Supabase incompleta',
        details: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    if (!sendgridApiKey) {
      console.error('❌ Missing SendGrid API Key');
      return new Response(JSON.stringify({
        error: 'Configuración de SendGrid incompleta',
        details: 'Falta SENDGRID_API_KEY'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Método no permitido'
      }), {
        status: 405,
        headers: corsHeaders
      });
    }
    // Obtener y validar datos del request
    const body = await req.json();

    // Validar con Zod
    const validationResult = SendEmailSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ Validación de datos falló:', validationResult.error.flatten());
      return new Response(JSON.stringify({
        error: 'Datos inválidos',
        details: validationResult.error.flatten().fieldErrors
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { quoteId, recipientEmail, quoteToken, emailType, newStatus } = validationResult.data;
    await ensureQuoteAccess(req, quoteId, quoteToken);
    console.log('📧 Iniciando envío de email para cotización:', quoteId);
    // 1. Obtener datos de la cotización desde la BD
    const { data: cotizacion, error: cotizacionError } = await supabase.from('cotizaciones').select(`
        *,
        leads (
          nombre,
          email,
          telefono,
          empresa
        )
      `).eq('id', quoteId).single();
    if (cotizacionError || !cotizacion) {
      console.error('❌ Error obteniendo cotización:', cotizacionError);
      return new Response(JSON.stringify({
        error: 'Cotización no encontrada',
        details: cotizacionError?.message
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    // 2. Obtener items de la cotización
    const { data: items, error: itemsError } = await supabase.from('items_cotizacion').select(`
        *,
        productos (
          nombre,
          categoria
        )
      `).eq('cotizacion_id', quoteId);
    if (itemsError || !items || items.length === 0) {
      console.error('❌ Error obteniendo items:', itemsError);
      return new Response(JSON.stringify({
        error: 'Items de cotización no encontrados',
        details: itemsError?.message
      }), {
        status: 404,
        headers: corsHeaders
      });
    }
    // 3. Determinar email destinatario
    const toEmail = recipientEmail || cotizacion.leads?.email;
    if (!toEmail) {
      console.error('❌ No hay email del lead ni email alternativo');
      return new Response(JSON.stringify({
        error: 'Email destinatario no especificado',
        details: 'El lead no tiene email configurado y no se proporcionó uno alternativo'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    const resolvedEmailType = emailType === 'quote_status_changed' || (newStatus && newStatus !== 'enviada')
      ? 'quote_status_changed'
      : 'quote_created';
    const estadoObjetivo = (newStatus || cotizacion.estado || "").toString();
    const isStatusEmail = resolvedEmailType === 'quote_status_changed';
    console.log('Email type:', { requested: emailType, resolved: resolvedEmailType, estadoObjetivo });
    if (isStatusEmail && (!estadoObjetivo || estadoObjetivo === 'enviada')) {
      console.log('? Estado enviada: no se envía correo de actualización.');
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        reason: 'estado_enviada_sin_email',
        recipient: toEmail,
        cotizacionNumero: cotizacion.numero || 'FC-2025-' + cotizacion.id.toString().padStart(3, '0')
      }), {
        status: 200,
        headers: corsHeaders
      });
    }
    const estadoLabel = STATUS_LABELS[estadoObjetivo] || 'Actualizada';
    const statusMessage = STATUS_MESSAGES[estadoObjetivo] || 'Hemos actualizado el estado de tu cotizacion.';
    const statusSubject = STATUS_SUBJECTS[estadoObjetivo] || `Actualizacion: tu cotizacion ${cotizacion.numero || 'FC-2025-' + cotizacion.id.toString().padStart(3, '0')} esta ${estadoLabel}`;
    const tipoCorreo = isStatusEmail ? 'quote_status_' + (estadoObjetivo || 'actualizado') : 'quote_created';
    const { data: previousEmail } = await supabase
      .from('email_logs')
      .select('id')
      .eq('quote_id', quoteId)
      .eq('tipo_correo', tipoCorreo)
      .eq('estado_envio', 'sent')
      .limit(1);
    if (previousEmail && previousEmail.length > 0) {
      console.log('? Email ya enviado previamente para este tipo y cotizaci¢n. Omitiendo duplicado.');
      return new Response(JSON.stringify({
        success: true,
        alreadySent: true,
        recipient: toEmail,
        cotizacionNumero: cotizacion.numero || 'FC-2025-' + cotizacion.id.toString().padStart(3, '0')
      }), {
        status: 200,
        headers: corsHeaders
      });
    }
    // 4. Validar que exista PDF (solo obligatorio para quote_created)
    let pdfSignedUrl: string | null = null;
    let pdfStoragePath: string | null = null;
    if (cotizacion.pdf_url) {
      pdfStoragePath = normalizePdfPath(cotizacion.pdf_url);
      if (pdfStoragePath) {
        const { data: pdfSignedUrlData, error: pdfSignedUrlError } = await supabase.storage
          .from('cotizaciones')
          .createSignedUrl(pdfStoragePath, 86400);
        if (!pdfSignedUrlError && pdfSignedUrlData) {
          pdfSignedUrl = pdfSignedUrlData.signedUrl;
        } else if (resolvedEmailType === 'quote_created') {
          console.error('? Error firmando PDF:', pdfSignedUrlError);
          return new Response(JSON.stringify({
            error: 'No se pudo firmar el PDF',
            details: pdfSignedUrlError?.message
          }), {
            status: 500,
            headers: corsHeaders
          });
        }
      }
    } else if (resolvedEmailType === 'quote_created') {
      console.error('? Cotizaci¢n sin PDF generado');
      return new Response(JSON.stringify({
        error: 'PDF no generado',
        details: 'Primero debe generarse el PDF de la cotizaci¢n'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    // 5. Calcular totales
    let subtotal = 0;
    items.forEach((item)=>{
      subtotal += item.cantidad * item.precio_unitario_aplicado;
    });
    const iva15 = subtotal * 0.15;
    const total = subtotal + iva15;
    // 6. Preparar datos para la plantilla
    const emailData = {
      cotizacionNumero: `FC-2025-${cotizacion.id.toString().padStart(3, '0')}`,
      fecha: new Date(cotizacion.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      clienteNombre: cotizacion.leads?.nombre || 'Cliente',
      clienteEmail: toEmail,
      items: items.map((item)=>({
          cantidad: item.cantidad,
          nombre: item.productos.nombre,
          categoria: item.productos.categoria,
          precioUnitario: parseFloat(item.precio_unitario_aplicado),
          subtotal: item.cantidad * parseFloat(item.precio_unitario_aplicado)
        })),
      subtotal: Math.round(subtotal * 100) / 100,
      iva15: Math.round(iva15 * 100) / 100,
      total: Math.round(total * 100) / 100,
      pdfUrl: pdfSignedUrl,
      validezDias: cotizacion.validez_dias || 30
    };
    console.log('✅ Datos preparados:', {
      to: toEmail,
      cotizacion: emailData.cotizacionNumero,
      items: emailData.items.length,
      total: emailData.total
    });
    // 7. Generar contenido del email
    const htmlContent = resolvedEmailType === 'quote_created'
      ? generateEmailHTML(emailData)
      : generateStatusEmailHTML({
          ...emailData,
          estadoLabel,
          statusMessage,
        });
    const emailSubject = resolvedEmailType === 'quote_created'
      ? 'Tu cotizacion ' + emailData.cotizacionNumero + ' - FullColor'
      : statusSubject;

    // 8. Enviar email usando SendGrid
    console.log('?? Enviando email via SendGrid...');
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [
              {
                email: toEmail
              }
            ],
            subject: emailSubject
          }
        ],
        from: {
          email: fromEmail,
          name: fromName
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent
          }
        ],
        reply_to: {
          email: fromEmail,
          name: fromName
        }
      })
    });
    if (!sendgridResponse.ok) {
      const errorText = await sendgridResponse.text();
      console.error('? SendGrid error:', errorText);
      await logEmailAttempt({
        quoteId,
        toEmail,
        tipoCorreo,
        estadoEnvio: 'error',
        errorMessage: errorText,
        sendgridMessageId: sendgridResponse.headers.get('x-message-id'),
      });
      throw new Error('Error enviando email: ' + sendgridResponse.status + ' - ' + errorText);
    }

    await logEmailAttempt({
      quoteId,
      toEmail,
      tipoCorreo,
      estadoEnvio: 'sent',
      sendgridMessageId: sendgridResponse.headers.get('x-message-id'),
    });
    console.log('📧 Email enviado exitosamente via SendGrid al cliente');

    // 8.5. Enviar notificacion al admin solo en cotizacion creada
    if (resolvedEmailType === 'quote_created') {
      console.log('📧 Enviando notificacion al admin:', adminEmail);
      console.log('📧 Tipo de email resuelto:', resolvedEmailType);

      try {
        const adminHtmlContent = generateAdminNotificationHTML(emailData);
        const adminSendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [
                  { email: adminEmail },
                ],
                subject: `🔔 Nueva Cotizacion ${emailData.cotizacionNumero} - ${emailData.clienteNombre}`,
              },
            ],
            from: { email: fromEmail, name: fromName },
            content: [
              { type: 'text/html', value: adminHtmlContent },
            ],
            reply_to: { email: toEmail, name: emailData.clienteNombre },
          }),
        });

        if (!adminSendgridResponse.ok) {
          const errorText = await adminSendgridResponse.text();
          console.error('❌ Error enviando notificacion al admin:', errorText);
          console.error('❌ Status code:', adminSendgridResponse.status);

          // Registrar intento fallido de email al admin
          await logEmailAttempt({
            quoteId,
            toEmail: adminEmail,
            tipoCorreo: 'admin_notification',
            estadoEnvio: 'error',
            errorMessage: errorText,
            sendgridMessageId: adminSendgridResponse.headers.get('x-message-id'),
          });
        } else {
          console.log('✅ Notificacion enviada al admin:', adminEmail);

          // Registrar envío exitoso al admin
          await logEmailAttempt({
            quoteId,
            toEmail: adminEmail,
            tipoCorreo: 'admin_notification',
            estadoEnvio: 'sent',
            sendgridMessageId: adminSendgridResponse.headers.get('x-message-id'),
          });
        }
      } catch (adminEmailError) {
        console.error('❌ Excepción al enviar email al admin:', adminEmailError);
        console.error('❌ Stack:', adminEmailError instanceof Error ? adminEmailError.stack : 'N/A');

        // Registrar excepción
        await logEmailAttempt({
          quoteId,
          toEmail: adminEmail,
          tipoCorreo: 'admin_notification',
          estadoEnvio: 'error',
          errorMessage: adminEmailError instanceof Error ? adminEmailError.message : String(adminEmailError),
        });
      }
    } else {
      console.log('ℹ️ No se envía notificación al admin porque el tipo de email es:', resolvedEmailType);
    }
// 9. Registrar evento en la base de datos
    const { error: eventoError } = await supabase.from('eventos').insert({
      cotizacion_id: quoteId,
      tipo: 'email_enviado',
      metadata: {
        recipient: toEmail,
        cotizacion_numero: emailData.cotizacionNumero,
        total: emailData.total,
        provider: 'sendgrid',
        storage_path: pdfStoragePath,
        sent_at: new Date().toISOString()
      }
    });
    if (eventoError) {
      console.warn('⚠️ Error registrando evento:', eventoError.message);
    }
    console.log('✅ Email enviado exitosamente a:', toEmail);
    // 10. Retornar respuesta exitosa
    return new Response(JSON.stringify({
      success: true,
      recipient: toEmail,
      cotizacionNumero: emailData.cotizacionNumero,
      message: `Email enviado exitosamente a ${toEmail}`
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('❌ Error en send-email:', error);
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : 'Error interno del servidor';
    return new Response(JSON.stringify({
      error: message,
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status,
      headers: corsHeaders
    });
  }
});
