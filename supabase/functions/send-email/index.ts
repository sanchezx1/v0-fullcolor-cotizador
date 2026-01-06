import { createClient } from 'jsr:@supabase/supabase-js@2';
import { HttpError, requirePrivilegedAccess } from '../_shared/security.ts';
import { getCorsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { z } from 'https://deno.land/x/zod@v3.24.1/mod.ts';
import { formatDateLong } from '../_shared/formatters.ts';
import {
  generateQuoteCreatedEmail,
  generateAdminNotificationEmail,
  generateStatusChangeEmail,
  type QuoteEmailData,
  type StatusEmailData,
} from './email-templates.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Schema de validación para envío de email
const SendEmailSchema = z.object({
  quoteId: z.number().int().positive('ID de cotización inválido'),
  recipientEmail: z.string().email('Email inválido').optional(),
  quoteToken: z.string().optional(),
  emailType: z.enum(['quote_created', 'quote_updated', 'status_change', 'quote_status_changed']).default('quote_created'),
  newStatus: z.enum(['en_revision', 'aprobada', 'rechazada', 'vencida']).optional(),
});

const STATUS_LABELS: Record<string, string> = {
  enviada: 'Enviada',
  en_revision: 'En Revisión',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  vencida: 'Vencida'
};

const STATUS_MESSAGES: Record<string, string> = {
  en_revision: 'Su cotización se encuentra en revisión por nuestro equipo. Le confirmaremos ajustes y tiempos de entrega a la brevedad.',
  aprobada: 'Nos complace informarle que su cotización ha sido aprobada. Podemos proceder a coordinar el pago, producción y entrega de su pedido.',
  rechazada: 'Lamentamos informarle que la cotización no pudo ser aprobada en esta ocasión. Si necesita alternativas o ajustes, estamos a su disposición.',
  vencida: 'Le informamos que el período de validez de su cotización ha expirado. Si aún está interesado, con gusto podemos generar una cotización actualizada.'
};

const STATUS_SUBJECTS: Record<string, string> = {
  en_revision: 'Su cotización está en revisión',
  aprobada: 'Su cotización ha sido aprobada',
  rechazada: 'Actualización de su cotización',
  vencida: 'Su cotización ha vencido'
};

async function logEmailAttempt(params: {
  quoteId: number;
  toEmail: string;
  tipoCorreo: string;
  estadoEnvio: 'sent' | 'error';
  errorMessage?: string | null;
  providerMessageId?: string | null;
}) {
  try {
    await supabase.from('email_logs').insert({
      quote_id: params.quoteId,
      to_email: params.toEmail,
      tipo_correo: params.tipoCorreo,
      estado_envio: params.estadoEnvio,
      error_message: params.errorMessage ?? null,
      provider_message_id: params.providerMessageId ?? null
    });
  } catch (error) {
    console.warn('No se pudo registrar el log de email:', error);
  }
}

function normalizePdfPath(rawPath: string | null): string | null {
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

  const authHeader = req.headers.get('Authorization');
  const parsedToken = authHeader?.replace(/Bearer\s+/i, '').trim() || '';

  if (supabaseServiceKey && parsedToken === supabaseServiceKey) {
    console.log('send-email: usando service key sin quoteToken');
    return;
  }

  if (supabaseAnonKey && parsedToken === supabaseAnonKey) {
    console.warn('send-email: invocation anon sin quoteToken, se continuará con validación interna.');
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
 * Edge Function para enviar emails de cotizaciones usando Resend
 * Plantillas premium con diseño Editorial Luxury
 */
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req);
  }

  try {
    console.log('send-email function invoked');
    console.log('Method:', req.method);

    // Configuración de Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'ventas@fullcolor.com.ec';
    const fromName = Deno.env.get('FROM_NAME') || 'FullColor';
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'carlosmatiasflor@gmail.com';

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
      supabaseServiceKey: supabaseServiceKey ? 'Present' : 'Missing',
      resendApiKey: resendApiKey ? 'Present' : 'Missing',
      fromEmail,
      fromName,
      adminEmail
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return new Response(JSON.stringify({
        error: 'Configuración de Supabase incompleta',
        details: 'Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (!resendApiKey) {
      console.error('Missing Resend API Key');
      return new Response(JSON.stringify({
        error: 'Configuración de Resend incompleta',
        details: 'Falta RESEND_API_KEY'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Método no permitido'
      }), {
        status: 405,
        headers: corsHeaders
      });
    }

    const body = await req.json();
    const validationResult = SendEmailSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Validación de datos falló:', validationResult.error.flatten());
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
    console.log('Iniciando envío de email para cotización:', quoteId);

    // 1. Obtener datos de la cotización
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
      console.error('Error obteniendo cotización:', cotizacionError);
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
      console.error('Error obteniendo items:', itemsError);
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
      console.error('No hay email del lead ni email alternativo');
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
      console.log('Estado enviada: no se envía correo de actualización.');
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        reason: 'estado_enviada_sin_email',
        recipient: toEmail,
        cotizacionNumero: cotizacion.numero || 'FC-' + cotizacion.id.toString()
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const estadoLabel = STATUS_LABELS[estadoObjetivo] || 'Actualizada';
    const statusMessage = STATUS_MESSAGES[estadoObjetivo] || 'Hemos actualizado el estado de su cotización.';
    const statusSubject = STATUS_SUBJECTS[estadoObjetivo] || `Actualización: Cotización ${cotizacion.numero || 'FC-' + cotizacion.id.toString()}`;
    const tipoCorreo = isStatusEmail ? 'quote_status_' + (estadoObjetivo || 'actualizado') : 'quote_created';

    // Verificar si ya se envió este tipo de email
    const { data: previousEmail } = await supabase
      .from('email_logs')
      .select('id')
      .eq('quote_id', quoteId)
      .eq('tipo_correo', tipoCorreo)
      .eq('estado_envio', 'sent')
      .limit(1);

    if (previousEmail && previousEmail.length > 0) {
      console.log('Email ya enviado previamente para este tipo y cotización. Omitiendo duplicado.');
      return new Response(JSON.stringify({
        success: true,
        alreadySent: true,
        recipient: toEmail,
        cotizacionNumero: cotizacion.numero || 'FC-' + cotizacion.id.toString()
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 4. Validar y obtener URL firmada del PDF
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
          console.error('Error firmando PDF:', pdfSignedUrlError);
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
      console.error('Cotización sin PDF generado');
      return new Response(JSON.stringify({
        error: 'PDF no generado',
        details: 'Primero debe generarse el PDF de la cotización'
      }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // 5. Calcular totales
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.cantidad * item.precio_unitario_aplicado;
    });
    const iva15 = subtotal * 0.15;
    const total = subtotal + iva15;

    // 6. Preparar datos para las plantillas
    const emailData: QuoteEmailData = {
      cotizacionNumero: `FC-${cotizacion.id}`,
      fecha: formatDateLong(cotizacion.created_at),
      clienteNombre: cotizacion.leads?.nombre || 'Cliente',
      clienteEmail: toEmail,
      items: items.map((item) => ({
        cantidad: item.cantidad,
        nombre: item.productos.nombre,
        categoria: item.productos.categoria,
        precioUnitario: parseFloat(item.precio_unitario_aplicado),
        subtotal: item.cantidad * parseFloat(item.precio_unitario_aplicado)
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      iva15: Math.round(iva15 * 100) / 100,
      total: Math.round(total * 100) / 100,
      pdfUrl: pdfSignedUrl || '',
      validezDias: cotizacion.validez_dias || 30
    };

    console.log('Datos preparados:', {
      to: toEmail,
      cotizacion: emailData.cotizacionNumero,
      items: emailData.items.length,
      total: emailData.total
    });

    // 7. Generar contenido del email usando plantillas premium
    let htmlContent: string;
    let emailSubject: string;

    if (resolvedEmailType === 'quote_created') {
      htmlContent = generateQuoteCreatedEmail(emailData);
      emailSubject = `Cotización ${emailData.cotizacionNumero} - FullColor`;
    } else {
      const statusData: StatusEmailData = {
        ...emailData,
        estadoLabel,
        statusMessage,
      };
      htmlContent = generateStatusChangeEmail(statusData, estadoObjetivo);
      emailSubject = statusSubject;
    }

    // 8. Enviar email usando Resend
    console.log('Enviando email via Resend...');
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [toEmail],
        subject: emailSubject,
        html: htmlContent,
        reply_to: 'fullcolorecuador@yahoo.com'
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData);
      await logEmailAttempt({
        quoteId,
        toEmail,
        tipoCorreo,
        estadoEnvio: 'error',
        errorMessage: JSON.stringify(resendData),
        providerMessageId: resendData?.id || null,
      });
      throw new Error('Error enviando email: ' + resendResponse.status + ' - ' + JSON.stringify(resendData));
    }

    await logEmailAttempt({
      quoteId,
      toEmail,
      tipoCorreo,
      estadoEnvio: 'sent',
      providerMessageId: resendData?.id || null,
    });
    console.log('Email enviado exitosamente via Resend al cliente, ID:', resendData?.id);

    // 8.5. Enviar notificación al admin solo en cotización creada
    if (resolvedEmailType === 'quote_created') {
      console.log('Enviando notificación al admin:', adminEmail);

      try {
        const adminHtmlContent = generateAdminNotificationEmail(emailData);
        const adminResendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: [adminEmail],
            subject: `Nueva Cotización ${emailData.cotizacionNumero} - ${emailData.clienteNombre}`,
            html: adminHtmlContent,
            reply_to: toEmail
          }),
        });

        const adminResendData = await adminResendResponse.json();

        if (!adminResendResponse.ok) {
          console.error('Error enviando notificación al admin:', adminResendData);
          await logEmailAttempt({
            quoteId,
            toEmail: adminEmail,
            tipoCorreo: 'admin_notification',
            estadoEnvio: 'error',
            errorMessage: JSON.stringify(adminResendData),
            providerMessageId: adminResendData?.id || null,
          });
        } else {
          console.log('Notificación enviada al admin:', adminEmail, 'ID:', adminResendData?.id);
          await logEmailAttempt({
            quoteId,
            toEmail: adminEmail,
            tipoCorreo: 'admin_notification',
            estadoEnvio: 'sent',
            providerMessageId: adminResendData?.id || null,
          });
        }
      } catch (adminEmailError) {
        console.error('Excepción al enviar email al admin:', adminEmailError);
        await logEmailAttempt({
          quoteId,
          toEmail: adminEmail,
          tipoCorreo: 'admin_notification',
          estadoEnvio: 'error',
          errorMessage: adminEmailError instanceof Error ? adminEmailError.message : String(adminEmailError),
        });
      }
    }

    // 9. Registrar evento en la base de datos
    const { error: eventoError } = await supabase.from('eventos').insert({
      cotizacion_id: quoteId,
      tipo: 'email_enviado',
      metadata: {
        recipient: toEmail,
        cotizacion_numero: emailData.cotizacionNumero,
        total: emailData.total,
        provider: 'resend',
        message_id: resendData?.id,
        storage_path: pdfStoragePath,
        sent_at: new Date().toISOString()
      }
    });

    if (eventoError) {
      console.warn('Error registrando evento:', eventoError.message);
    }

    console.log('Email enviado exitosamente a:', toEmail);

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
    console.error('Error en send-email:', error);
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
