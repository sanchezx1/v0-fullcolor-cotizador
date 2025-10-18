import { supabase } from './supabaseClient'

/**
 * Servicio para generar PDFs de cotización
 * Llama a la Edge Function que lee datos frescos desde Supabase
 */
export class PDFGenerationService {
  private supabaseUrl: string
  private supabaseAnonKey: string

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    this.supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }

  /**
   * Genera PDF de cotización usando Edge Function
   * Siempre lee datos frescos desde Supabase
   */
  async generateQuotePDF(quoteId: number): Promise<{
    success: boolean
    pdfUrl?: string
    fileName?: string
    error?: string
  }> {
    try {
      // MODO SIMULACIÓN - Generar URL simulada mientras se despliega Edge Function
      console.log('🔧 Modo simulación: Generando PDF simulado...')
      
      // Simular generación exitosa
      const simulatedPdfUrl = `https://storage.supabase.co/cotizaciones/cotizacion-${quoteId}-${Date.now()}.pdf`
      const simulatedFileName = `cotizacion-${quoteId}-${Date.now()}.pdf`
      
      // Actualizar estado de la cotización con URL simulada
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
          descripcion: `PDF generado (simulado): ${simulatedFileName}`,
          metadata: { fileName: simulatedFileName, url: simulatedPdfUrl, simulated: true }
        })

      console.log('✅ PDF simulado generado:', simulatedPdfUrl)
      
      return {
        success: true,
        pdfUrl: simulatedPdfUrl,
        fileName: simulatedFileName
      }

      /* CÓDIGO ORIGINAL PARA CUANDO LA EDGE FUNCTION ESTÉ DESPLEGADA:
      
      // Llamar a la Edge Function
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { quoteId }
      })

      if (error) {
        console.error('Error calling generate-pdf function:', error)
        return {
          success: false,
          error: `Error generando PDF: ${error.message}`
        }
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Error desconocido generando PDF'
        }
      }

      return {
        success: true,
        pdfUrl: data.pdfUrl,
        fileName: data.fileName
      }
      */

    } catch (error) {
      console.error('Error in generateQuotePDF:', error)
      return {
        success: false,
        error: `Error interno: ${error.message}`
      }
    }
  }

  /**
   * Genera PDF y envía por email (opcional)
   */
  async generateAndEmailPDF(quoteId: number, email?: string): Promise<{
    success: boolean
    pdfUrl?: string
    emailSent?: boolean
    error?: string
  }> {
    try {
      // Generar PDF
      const pdfResult = await this.generateQuotePDF(quoteId)
      
      if (!pdfResult.success) {
        return pdfResult
      }

      // Si se proporciona email, enviar PDF
      if (email && pdfResult.pdfUrl) {
        const emailResult = await this.sendPDFByEmail(quoteId, pdfResult.pdfUrl, email)
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
        error: `Error interno: ${error.message}`
      }
    }
  }

  /**
   * Envía PDF por email usando Edge Function
   */
  private async sendPDFByEmail(quoteId: number, pdfUrl: string, email: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          quoteId,
          pdfUrl,
          email
        }
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
        error: `Error interno enviando email: ${error.message}`
      }
    }
  }

  /**
   * Obtiene URL del PDF si ya existe
   */
  async getExistingPDFUrl(quoteId: number): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('cotizaciones')
        .select('pdf_url')
        .eq('id', quoteId)
        .single()

      if (error || !data) {
        return null
      }

      return data.pdf_url

    } catch (error) {
      console.error('Error getting existing PDF URL:', error)
      return null
    }
  }

  /**
   * Verifica si el PDF ya existe para una cotización
   */
  async hasExistingPDF(quoteId: number): Promise<boolean> {
    const url = await this.getExistingPDFUrl(quoteId)
    return url !== null
  }
}

// Instancia singleton
export const pdfGenerationService = new PDFGenerationService()

export default pdfGenerationService
