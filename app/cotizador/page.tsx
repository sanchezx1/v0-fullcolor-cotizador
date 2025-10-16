"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from "lucide-react"

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

export default function CotizadorPage() {
  const router = useRouter()
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  })

  // Load quote from localStorage
  useEffect(() => {
    const savedQuote = localStorage.getItem("quote")
    if (savedQuote) {
      setQuoteItems(JSON.parse(savedQuote))
    }
  }, [])

  // Save quote to localStorage whenever it changes
  useEffect(() => {
    if (quoteItems.length > 0) {
      localStorage.setItem("quote", JSON.stringify(quoteItems))
    }
  }, [quoteItems])

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setQuoteItems((items) =>
      items.map((item) => {
        if (item.productId === productId) {
          const newTotal = item.pricePerUnit * newQuantity
          return { ...item, quantity: newQuantity, total: newTotal }
        }
        return item
      }),
    )
  }

  const removeItem = (productId: number) => {
    const updatedItems = quoteItems.filter((item) => item.productId !== productId)
    setQuoteItems(updatedItems)
    localStorage.setItem("quote", JSON.stringify(updatedItems))
  }

  const calculateSubtotal = () => {
    return quoteItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateIVA = () => {
    return calculateSubtotal() * 0.15 // 15% IVA
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIVA()
  }

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault()

    if (quoteItems.length === 0) {
      alert("Por favor agrega productos a tu cotización")
      return
    }

    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone || !contactInfo.company) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    // Store contact info and navigate to confirmation
    localStorage.setItem("contactInfo", JSON.stringify(contactInfo))
    router.push("/confirmacion")
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-balance mb-3">Cotizador de Productos</h1>
          <p className="text-muted-foreground text-pretty">
            Revisa tu cotización y completa tus datos para recibir una propuesta personalizada
          </p>
        </div>

        {quoteItems.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Tu cotización está vacía</h2>
                <p className="text-muted-foreground text-pretty max-w-md mx-auto">
                  Explora nuestro catálogo y agrega productos para comenzar tu cotización
                </p>
              </div>
              <Link href="/catalogo">
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-white">
                  <Package className="mr-2 h-5 w-5" />
                  Ir al Catálogo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmitQuote}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Quote Items */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Productos en tu Cotización ({quoteItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quoteItems.map((item) => (
                      <div key={item.productId}>
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-balance">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  ${item.pricePerUnit.toFixed(2)} por unidad
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.productId)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 p-0 bg-transparent"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.productId, Number.parseInt(e.target.value) || 1)}
                                  className="w-20 text-center h-8"
                                  min="1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="h-8 w-8 p-0 bg-transparent"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-primary">${item.total.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}

                    <Link href="/catalogo">
                      <Button type="button" variant="outline" className="w-full bg-transparent">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Más Productos
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Completa tus datos para recibir la cotización detallada
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Nombre Completo <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          required
                          value={contactInfo.name}
                          onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">
                          Empresa <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="company"
                          required
                          value={contactInfo.company}
                          onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
                          placeholder="Mi Empresa S.A."
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                          placeholder="juan@empresa.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Teléfono <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          placeholder="+593 99 123 4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                      <Textarea
                        id="notes"
                        value={contactInfo.notes}
                        onChange={(e) => setContactInfo({ ...contactInfo, notes: e.target.value })}
                        placeholder="Detalles especiales, fecha de entrega deseada, etc."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Resumen de Cotización</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
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
                        <span className="font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Precios sujetos a confirmación final</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Recibirás una cotización detallada por email</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Tiempo de respuesta: 24-48 horas</span>
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary-hover text-white">
                      Solicitar Cotización
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
