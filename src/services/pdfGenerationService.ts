import { supabase } from './supabaseClient'

type QuoteSecurityOptions = {
  quoteToken?: string
}

/**
 * Servicio para generar PDFs de cotización
 * Usa Edge Functions al operar con administradores y rutas internas seguras para clientes públicos
 */
export class PDFGenerationService {
  constructor() {
    // Las variables de entorno se cargan automáticamente por el cliente Supabase
  }

  private async requestPublicPdfEndpoint(
    quoteId: number,
    quoteToken: string,
    init: RequestInit
  ) {
    const response = await fetch(`/api/public/quotes/${quoteId}/pdf`, {
      ...init,
      headers: {
        'x-quote-token': quoteToken,
        ...(init.headers ?? {})
      }
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload?.error || 'Error procesando PDF')
    }

    return response.json()
  }

  /**
   * Genera PDF de cotización usando Edge Function
   */
  async generateQuotePDF(
    quoteId: number,
    options: QuoteSecurityOptions = {}
  ): Promise<{
    success: boolean
    pdfUrl?: string
    fileName?: string
    emailSent?: boolean
    emailRecipient?: string
    emailError?: string
    error?: string
  }> {
    try {
      console.log('🧾 Generando PDF real para cotización:', quoteId)

      if (options.quoteToken) {
        const data = await this.requestPublicPdfEndpoint(quoteId, options.quoteToken, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        return {
          success: true,
          pdfUrl: data.pdfUrl,
          fileName: data.fileName,
          emailSent: data.emailSent || false,
          emailRecipient: data.emailRecipient,
          emailError: data.emailError
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { quoteId }
      })

      if (error) {
        console.error('❌ Error llamando Edge Function:', error.message)
        return {
          success: false,
          error: `Error de servidor: ${error.message}`
        }
      }

      if (!data.success) {
        console.error('⚠️ Edge Function retornó error:', data.error)
        return {
          success: false,
          error: `Error generando PDF: ${data.error}`
        }
      }

      return {
        success: true,
        pdfUrl: data.pdfUrl,
        fileName: data.fileName,
        emailSent: data.emailSent || false,
        emailRecipient: data.emailRecipient,
        emailError: data.emailError
      }
    } catch (error) {
      console.error('❌ Error general en generateQuotePDF:', error)
      return {
        success: false,
        error: `Error interno: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  /**
   * Genera PDF y envía por email (opcional)
   */
  async generateAndEmailPDF(
    quoteId: number,
    email?: string,
    options: QuoteSecurityOptions = {}
  ): Promise<{
    success: boolean
    pdfUrl?: string
    emailSent?: boolean
    error?: string
  }> {
    try {
      const pdfResult = await this.generateQuotePDF(quoteId, options)

      if (!pdfResult.success) {
        return pdfResult
      }

      if (email && pdfResult.pdfUrl) {
        const emailResult = await this.sendPDFByEmail(quoteId, pdfResult.pdfUrl, email, options)
        return {
          ...pdfResult,
          emailSent: emailResult.success
        }
      }

      return pdfResult
    } catch (error) {
      console.error('Error in generateAndEmailPDF:', error)
      return {
        success: false,
        error: `Error interno: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  /**
   * Envía PDF por email usando Edge Function
   */
  private async sendPDFByEmail(
    quoteId: number,
    pdfUrl: string,
    email: string,
    options: QuoteSecurityOptions = {}
  ): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const payload = {
        quoteId,
        pdfUrl,
        email,
        quoteToken: options.quoteToken
      }

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: payload
      })

      if (error) {
        return {
          success: false,
          error: `Error enviando email: ${error.message}`
        }
      }

      return {
        success: data.success || false,
        error: data.error
      }
    } catch (error) {
      return {
        success: false,
        error: `Error interno enviando email: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  /**
   * Obtiene URL firmada del PDF si existe
   */
  async getExistingPDFUrl(
    quoteId: number,
    options: QuoteSecurityOptions = {}
  ): Promise<string | null> {
    try {
      if (options.quoteToken) {
        const response = await fetch(`/api/public/quotes/${quoteId}/pdf`, {
          headers: {
            'x-quote-token': options.quoteToken
          }
        })

        if (!response.ok) {
          return null
        }

        const payload = await response.json()
        return payload.pdfUrl ?? null
      }

      const { data, error } = await supabase
        .from('cotizaciones')
        .select('pdf_url')
        .eq('id', quoteId)
        .single()

      if (error || !data || !(data as any).pdf_url) {
        return null
      }

      const { data: signedUrlData, error: signedError } = await supabase.storage
        .from('cotizaciones')
        .createSignedUrl((data as any).pdf_url, 3600)

      if (signedError || !signedUrlData) {
        console.error('Error firmando URL del PDF:', signedError)
        return null
      }

      return signedUrlData.signedUrl
    } catch (error) {
      console.error('Error getting existing PDF URL:', error)
      return null
    }
  }

  /**
   * Verifica si el PDF ya existe para una cotización
   */
  async hasExistingPDF(quoteId: number, options: QuoteSecurityOptions = {}): Promise<boolean> {
    const url = await this.getExistingPDFUrl(quoteId, options)
    return url !== null
  }
}

// Instancia singleton
export const pdfGenerationService = new PDFGenerationService()

export default pdfGenerationService
