import { supabase } from './supabaseClient'

/**
 * Servicio para gestionar el envío de emails de cotizaciones
 * Usa SendGrid a través de Edge Function de Supabase
 */

export interface SendEmailResult {
  success: boolean
  recipient?: string
  cotizacionNumero?: string
  error?: string
}

/**
 * Envía un email de cotización usando SendGrid
 * @param quoteId - ID de la cotización
 * @param recipientEmail - Email destinatario (opcional, usa el del lead si no se proporciona)
 */
type EmailSecurityOptions = {
  quoteToken?: string
}

export async function sendQuoteEmail(
  quoteId: number,
  recipientEmail?: string,
  options: EmailSecurityOptions = {}
): Promise<SendEmailResult> {
  try {
    console.log('📧 Enviando email de cotización:', { quoteId, recipientEmail })

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        quoteId,
        recipientEmail,
        quoteToken: options.quoteToken
      }
    })

    if (error) {
      console.error('❌ Error invocando función send-email:', error)
      return {
        success: false,
        error: error.message || 'Error al enviar el email'
      }
    }

    if (!data?.success) {
      console.error('❌ La función retornó error:', data)
      return {
        success: false,
        error: data?.error || 'Error desconocido al enviar email'
      }
    }

    console.log('✅ Email enviado exitosamente:', data)
    return {
      success: true,
      recipient: data.recipient,
      cotizacionNumero: data.cotizacionNumero
    }
  } catch (error) {
    console.error('❌ Error en sendQuoteEmail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado'
    }
  }
}

/**
 * Verifica si ya se envió un email para una cotización
 * @param quoteId - ID de la cotización
 */
export async function wasEmailSent(quoteId: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('id')
      .eq('cotizacion_id', quoteId)
      .eq('tipo', 'email_enviado')
      .limit(1)

    if (error) {
      console.error('Error verificando email enviado:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error en wasEmailSent:', error)
    return false
  }
}

/**
 * Obtiene el historial de emails enviados para una cotización
 * @param quoteId - ID de la cotización
 */
export async function getEmailHistory(quoteId: number) {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('cotizacion_id', quoteId)
      .eq('tipo', 'email_enviado')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo historial de emails:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error en getEmailHistory:', error)
    return []
  }
}

/**
 * Obtiene el email del lead asociado a una cotización
 * @param quoteId - ID de la cotización
 */
export async function getLeadEmail(quoteId: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select(`
        leads (
          email
        )
      `)
      .eq('id', quoteId)
      .single()

    if (error || !data) {
      console.error('Error obteniendo email del lead:', error)
      return null
    }

    return (data.leads as any)?.email || null
  } catch (error) {
    console.error('Error en getLeadEmail:', error)
    return null
  }
}
