"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Mail, Phone, Building2, FileText, ArrowRight, Home } from "lucide-react"
import PDFGenerator from "@/components/pdf-generator"
import { supabase } from "@/src/services/supabaseClient"

interface QuoteData {
  cotizacion: {
    id: number
    estado: string
    total: number
    created_at: string
    pdf_url?: string
  }
  lead: {
    nombre: string
    email: string
    telefono: string
    empresa: string
    ruc_cedula?: string
    ciudad?: string
    notas?: string
  }
  items: Array<{
    cantidad: number
    precio_unitario_aplicado: number
    subtotal: number
    productos: {
      nombre: string
      categoria: string
      imagen_url?: string
    }
  }>
}

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quoteId')
  
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quoteId) {
      setLoading(false)
      return
    }

    loadQuoteData(parseInt(quoteId))
  }, [quoteId])

  const loadQuoteData = async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      // Obtener cotización completa con lead e items
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
        .eq('id', id)
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
        .eq('cotizacion_id', id)

      if (itemsError) {
        throw new Error(`Error obteniendo items: ${itemsError.message}`)
      }

      setQuoteData({
        cotizacion,
        lead: cotizacion.leads,
        items
      })

    } catch (err) {
      console.error('Error loading quote data:', err)
      setError(err instanceof Error ? err.message : 'Error cargando cotización')
    } finally {
      setLoading(false)
    }
  }

  const calculateSubtotal = () => {
    if (!quoteData) return 0
    return quoteData.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const calculateIVA = () => {
    return calculateSubtotal() * 0.15
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIVA()
  }

  // Si no hay quoteId, mostrar mensaje de error
  if (!quoteId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              No hay cotización para confirmar
            </h1>
            <p className="text-gray-600 mb-6">
              Por favor, crea una cotización primero.
            </p>
            <Link href="/catalogo">
              <Button className="w-full">
                Ir al Catálogo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Cargando cotización...
            </h1>
            <p className="text-gray-600">
              Obteniendo datos desde Supabase
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si hay error, mostrarlo
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Error cargando cotización
            </h1>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <Link href="/catalogo">
              <Button className="w-full">
                Ir al Catálogo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no hay datos, mostrar mensaje
  if (!quoteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Cotización no encontrada
            </h1>
            <p className="text-gray-600 mb-6">
              La cotización solicitada no existe.
            </p>
            <Link href="/catalogo">
              <Button className="w-full">
                Ir al Catálogo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const quoteNumber = `FC-2025-${quoteData.cotizacion.id.toString().padStart(3, '0')}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-balance">¡Cotización Enviada con Éxito!</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Hemos recibido tu solicitud de cotización y te responderemos pronto
            </p>
          </div>
          <Card className="inline-block mt-4">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Número de Cotización</p>
              <p className="text-2xl font-bold text-primary">{quoteNumber}</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-medium">{quoteData.lead.empresa}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{quoteData.lead.nombre}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{quoteData.lead.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{quoteData.lead.telefono || 'No especificado'}</p>
                </div>
              </div>
              {quoteData.lead.ruc_cedula && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">RUC/Cédula</p>
                    <p className="font-medium">{quoteData.lead.ruc_cedula}</p>
                  </div>
                </div>
              )}
              {quoteData.lead.ciudad && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ciudad</p>
                    <p className="font-medium">{quoteData.lead.ciudad}</p>
                  </div>
                </div>
              )}
            </div>
            {quoteData.lead.notas && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notas Adicionales</p>
                  <p className="text-sm">{quoteData.lead.notas}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quote Summary */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Resumen de Productos</h2>
            <div className="space-y-4">
              {quoteData.items.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{item.productos.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.cantidad} unidades × ${item.precio_unitario_aplicado.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (15%):</span>
                <span className="font-medium">${calculateIVA().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-lg">Total:</span>
                <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Generator */}
        <PDFGenerator 
          quoteId={quoteData.cotizacion.id}
          quoteNumber={quoteNumber}
          className="mb-6"
        />

        {/* Next Steps */}
        <Card className="mb-8 bg-muted/50">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Próximos Pasos</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Revisión de tu cotización</p>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo revisará tu solicitud y te contactará en las próximas 24 horas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Propuesta detallada</p>
                  <p className="text-sm text-muted-foreground">
                    Te enviaremos una propuesta detallada con tiempos de entrega y condiciones.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Confirmación y producción</p>
                  <p className="text-sm text-muted-foreground">
                    Una vez aprobada, iniciaremos la producción de tus productos.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/catalogo">
            <Button variant="outline" className="w-full sm:w-auto">
              <Package className="w-4 h-4 mr-2" />
              Ver Más Productos
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Ir al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}