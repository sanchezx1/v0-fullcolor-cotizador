'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Loader2, CheckCircle2, AlertCircle, Mail, Send } from 'lucide-react'
import { pdfGenerationService } from '@/src/services/pdfGenerationService'
import { sendQuoteEmail, getLeadEmail } from '@/src/services/emailService'
import { EmailSender } from './email-sender'

interface QuoteActionsProps {
  quoteId: number
  quoteNumber: string
  autoSendEmail?: boolean
  className?: string
}

export function QuoteActions({ quoteId, quoteNumber, autoSendEmail = false, className }: QuoteActionsProps) {
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [emailSent, setEmailSent] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [showManualEmail, setShowManualEmail] = useState(false)

  // Verificar si ya existe PDF al cargar
  useEffect(() => {
    checkExistingPDF()
  }, [quoteId])

  const checkExistingPDF = async () => {
    try {
      const existingUrl = await pdfGenerationService.getExistingPDFUrl(quoteId)
      if (existingUrl) {
        setPdfUrl(existingUrl)
        setPdfStatus('success')
      }
    } catch (err) {
      console.error('Error checking existing PDF:', err)
    }
  }

  const handleGeneratePDFAndSendEmail = async () => {
    try {
      // 1. Generar PDF
      setPdfStatus('generating')
      setPdfError(null)
      setEmailError(null)

      console.log('📄 Generando PDF...')
      const pdfResult = await pdfGenerationService.generateQuotePDF(quoteId)
      
      if (!pdfResult.success || !pdfResult.pdfUrl) {
        setPdfError(pdfResult.error || 'Error generando PDF')
        setPdfStatus('error')
        return
      }

      setPdfUrl(pdfResult.pdfUrl)
      setPdfStatus('success')
      console.log('✅ PDF generado exitosamente')

      // 2. Enviar email automáticamente si está habilitado
      if (autoSendEmail) {
        setEmailStatus('sending')
        console.log('📧 Enviando email automáticamente...')

        // Obtener email del lead
        const leadEmail = await getLeadEmail(quoteId)
        
        if (leadEmail) {
          const emailResult = await sendQuoteEmail(quoteId, leadEmail)
          
          if (emailResult.success) {
            setEmailSent(true)
            setEmailRecipient(emailResult.recipient || leadEmail)
            setEmailStatus('success')
            console.log('✅ Email enviado exitosamente a:', leadEmail)
          } else {
            setEmailError(emailResult.error || 'Error enviando email')
            setEmailStatus('error')
            console.error('❌ Error enviando email:', emailResult.error)
          }
        } else {
          setEmailError('No se encontró email del cliente')
          setEmailStatus('error')
        }
      }

    } catch (err) {
      console.error('Error en el proceso:', err)
      setPdfError('Error interno en el proceso')
      setPdfStatus('error')
    }
  }

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  const handleManualEmailSent = (recipient: string) => {
    setEmailSent(true)
    setEmailRecipient(recipient)
    setShowManualEmail(false)
  }

  const getMainButtonContent = () => {
    if (pdfStatus === 'generating') {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generando PDF...
        </>
      )
    }
    
    if (pdfStatus === 'success') {
      return (
        <>
          <CheckCircle2 className="w-4 h-4" />
          PDF Generado
        </>
      )
    }

    if (autoSendEmail) {
      return (
        <>
          <Send className="w-4 h-4" />
          Solicitar Cotización
        </>
      )
    }

    return (
      <>
        <FileText className="w-4 h-4" />
        Generar PDF
      </>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {autoSendEmail ? 'Solicitar Cotización' : 'Cotización PDF'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {autoSendEmail 
                ? 'Genera el PDF y recibe tu cotización por email' 
                : 'Descarga tu cotización en formato PDF'}
            </p>
          </div>
          {autoSendEmail ? (
            <Mail className="w-8 h-8 text-primary" />
          ) : (
            <FileText className="w-8 h-8 text-primary" />
          )}
        </div>

        <div className="space-y-4">
          {/* Botón principal */}
          <Button
            onClick={pdfStatus === 'success' ? handleDownloadPDF : handleGeneratePDFAndSendEmail}
            disabled={pdfStatus === 'generating' || emailStatus === 'sending'}
            className="w-full"
            variant={pdfStatus === 'success' ? 'default' : 'outline'}
            size="lg"
          >
            {getMainButtonContent()}
          </Button>

          {/* Estado del email automático */}
          {autoSendEmail && emailStatus === 'sending' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-700">Enviando email...</p>
            </div>
          )}

          {autoSendEmail && emailSent && emailRecipient && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700">
                ✅ Email enviado a <strong>{emailRecipient}</strong>
              </p>
            </div>
          )}

          {autoSendEmail && emailError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700">
                ⚠️ {emailError}. El PDF fue generado correctamente.
              </p>
            </div>
          )}

          {/* Error de PDF */}
          {pdfStatus === 'error' && pdfError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{pdfError}</p>
            </div>
          )}

          {/* Información adicional */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Cotización: {quoteNumber}</p>
            <p>• PDF generado con datos frescos desde Supabase</p>
            <p>• Incluye todos los productos y precios actualizados</p>
            {autoSendEmail && <p>• El email se enviará automáticamente al generar el PDF</p>}
          </div>

          {/* Botón de descarga si PDF está listo */}
          {pdfStatus === 'success' && pdfUrl && (
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          )}

          {/* Opción para reenviar email manualmente */}
          {pdfStatus === 'success' && pdfUrl && (
            <>
              <Separator className="my-4" />
              
              <Button
                onClick={() => setShowManualEmail(!showManualEmail)}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {showManualEmail ? 'Ocultar opciones de email' : 'Enviar a otro email'}
              </Button>

              {showManualEmail && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <EmailSender
                    quoteId={quoteId}
                    initialEmail={emailRecipient || undefined}
                    onEmailSent={handleManualEmailSent}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default QuoteActions
