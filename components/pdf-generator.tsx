"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { pdfGenerationService } from "@/src/services/pdfGenerationService"

interface PDFGeneratorProps {
  quoteId: number
  quoteNumber: string
  className?: string
}

export function PDFGenerator({ quoteId, quoteNumber, className }: PDFGeneratorProps) {
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Verificar si ya existe PDF al cargar
  useState(() => {
    checkExistingPDF()
  })

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

  const handleGeneratePDF = async () => {
    try {
      setPdfStatus('generating')
      setError(null)

      const result = await pdfGenerationService.generateQuotePDF(quoteId)
      
      if (result.success && result.pdfUrl) {
        setPdfUrl(result.pdfUrl)
        setPdfStatus('success')
      } else {
        setError(result.error || 'Error generando PDF')
        setPdfStatus('error')
      }
    } catch (err) {
      console.error('Error generating PDF:', err)
      setError('Error interno generando PDF')
      setPdfStatus('error')
    }
  }

  const handleDownloadPDF = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  const getButtonContent = () => {
    switch (pdfStatus) {
      case 'generating':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando PDF...
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle2 className="w-4 h-4" />
            PDF Generado
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            Error
          </>
        )
      default:
        return (
          <>
            <FileText className="w-4 h-4" />
            Generar PDF
          </>
        )
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Cotización PDF</h3>
            <p className="text-sm text-muted-foreground">
              Descarga tu cotización en formato PDF
            </p>
          </div>
          <FileText className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-4">
          {/* Botón principal */}
          <Button
            onClick={pdfStatus === 'success' ? handleDownloadPDF : handleGeneratePDF}
            disabled={pdfStatus === 'generating'}
            className="w-full"
            variant={pdfStatus === 'success' ? 'default' : 'outline'}
          >
            {getButtonContent()}
          </Button>

          {/* Mostrar error si existe */}
          {pdfStatus === 'error' && error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Información adicional */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Cotización: {quoteNumber}</p>
            <p>• PDF generado con datos frescos desde Supabase</p>
            <p>• Incluye todos los productos y precios actualizados</p>
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
        </div>
      </CardContent>
    </Card>
  )
}

export default PDFGenerator
