"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Mail, Phone, Building2, FileText, ArrowRight, Home } from "lucide-react"

interface QuoteItem {
  productId: number
  name: string
  quantity: number
  pricePerUnit: number
  total: number
}

interface ContactInfo {
  name: string
  email: string
  phone: string
  company: string
  notes: string
}

export default function ConfirmacionPage() {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [quoteNumber, setQuoteNumber] = useState("")

  useEffect(() => {
    // Load data from localStorage
    const savedQuote = localStorage.getItem("quote")
    const savedContact = localStorage.getItem("contactInfo")

    if (savedQuote) {
      setQuoteItems(JSON.parse(savedQuote))
    }

    if (savedContact) {
      setContactInfo(JSON.parse(savedContact))
    }

    // Generate a quote number
    const number = `FC-${Date.now().toString().slice(-8)}`
    setQuoteNumber(number)

    // Clear the quote after confirmation
    localStorage.removeItem("quote")
    localStorage.removeItem("contactInfo")
  }, [])

  const calculateSubtotal = () => {
    return quoteItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateIVA = () => {
    return calculateSubtotal() * 0.15
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIVA()
  }

  if (!contactInfo || quoteItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">No hay cotización para confirmar</h1>
          <p className="text-muted-foreground">Por favor, crea una cotización primero.</p>
          <Link href="/catalogo">
            <Button className="bg-primary hover:bg-primary-hover text-white">Ir al Catálogo</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-balance">¡Cotización Enviada con Éxito!</h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Hemos recibido tu solicitud de cotización y te responderemos pronto
              </p>
            </div>
            <Card className="inline-block">
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
                    <p className="font-medium">{contactInfo.company}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{contactInfo.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{contactInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{contactInfo.phone}</p>
                  </div>
                </div>
              </div>
              {contactInfo.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notas Adicionales</p>
                    <p className="text-sm">{contactInfo.notes}</p>
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
                {quoteItems.map((item) => (
                  <div key={item.productId}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} unidades × ${item.pricePerUnit.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">${item.total.toFixed(2)}</p>
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
                    <p className="font-medium">Revisión de tu Solicitud</p>
                    <p className="text-sm text-muted-foreground">
                      Nuestro equipo revisará tu cotización y verificará disponibilidad
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Cotización Detallada</p>
                    <p className="text-sm text-muted-foreground">
                      Recibirás una cotización detallada por email en 24-48 horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Confirmación y Producción</p>
                    <p className="text-sm text-muted-foreground">
                      Una vez aprobada, iniciaremos la producción de tus productos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                <Home className="mr-2 h-5 w-5" />
                Volver al Inicio
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-white w-full sm:w-auto">
                Explorar Más Productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-sm text-muted-foreground">¿Tienes preguntas sobre tu cotización?</p>
            <p className="text-sm">
              Contáctanos en{" "}
              <a href="mailto:info@fullcolor.com" className="text-primary hover:underline font-medium">
                info@fullcolor.com
              </a>{" "}
              o llámanos al{" "}
              <a href="tel:+593991234567" className="text-primary hover:underline font-medium">
                +593 99 123 4567
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
