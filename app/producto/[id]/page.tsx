"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ShoppingCart, Check, Package, Clock, Truck } from "lucide-react"

// Product data (in a real app, this would come from a database)
const productsData: Record<
  string,
  {
    id: number
    name: string
    category: string
    image: string
    description: string
    fullDescription: string
    specifications: { label: string; value: string }[]
    pricingTiers: { minQty: number; maxQty: number | null; pricePerUnit: number }[]
    deliveryTime: string
  }
> = {
  "1": {
    id: 1,
    name: "Tarjetas de Presentación Premium",
    category: "Papelería Corporativa",
    image: "/premium-business-cards-stack.jpg",
    description: "Impresión de alta calidad en papel couché",
    fullDescription:
      "Tarjetas de presentación premium impresas en papel couché de 300g con acabado mate o brillante. Perfectas para causar una excelente primera impresión en tus clientes y socios comerciales.",
    specifications: [
      { label: "Material", value: "Papel Couché 300g" },
      { label: "Tamaño", value: "9 x 5 cm" },
      { label: "Impresión", value: "Full Color (CMYK)" },
      { label: "Acabado", value: "Mate o Brillante" },
    ],
    pricingTiers: [
      { minQty: 100, maxQty: 499, pricePerUnit: 0.25 },
      { minQty: 500, maxQty: 999, pricePerUnit: 0.18 },
      { minQty: 1000, maxQty: 2499, pricePerUnit: 0.12 },
      { minQty: 2500, maxQty: null, pricePerUnit: 0.08 },
    ],
    deliveryTime: "3-5 días hábiles",
  },
  "2": {
    id: 2,
    name: "Carpetas Corporativas",
    category: "Papelería Corporativa",
    image: "/corporate-folders-presentation.jpg",
    description: "Carpetas personalizadas con tu logo",
    fullDescription:
      "Carpetas corporativas de alta calidad con impresión personalizada. Ideales para presentaciones, propuestas comerciales y documentación empresarial.",
    specifications: [
      { label: "Material", value: "Cartulina Plegable 300g" },
      { label: "Tamaño", value: "23 x 31 cm" },
      { label: "Impresión", value: "Full Color (CMYK)" },
      { label: "Bolsillos", value: "2 bolsillos internos" },
    ],
    pricingTiers: [
      { minQty: 50, maxQty: 99, pricePerUnit: 3.0 },
      { minQty: 100, maxQty: 249, pricePerUnit: 2.5 },
      { minQty: 250, maxQty: 499, pricePerUnit: 2.0 },
      { minQty: 500, maxQty: null, pricePerUnit: 1.5 },
    ],
    deliveryTime: "5-7 días hábiles",
  },
  "3": {
    id: 3,
    name: "Banners Roll-Up",
    category: "Material Publicitario",
    image: "/roll-up-banner-display.jpg",
    description: "Banners portátiles para eventos",
    fullDescription:
      "Banners roll-up profesionales con estructura de aluminio y lona de alta calidad. Perfectos para ferias, eventos y presentaciones corporativas.",
    specifications: [
      { label: "Material", value: "Lona Frontlit 440g" },
      { label: "Tamaño", value: "85 x 200 cm" },
      { label: "Estructura", value: "Aluminio con base" },
      { label: "Impresión", value: "Full Color HD" },
    ],
    pricingTiers: [
      { minQty: 1, maxQty: 4, pricePerUnit: 45.0 },
      { minQty: 5, maxQty: 9, pricePerUnit: 40.0 },
      { minQty: 10, maxQty: 19, pricePerUnit: 35.0 },
      { minQty: 20, maxQty: null, pricePerUnit: 30.0 },
    ],
    deliveryTime: "7-10 días hábiles",
  },
  "4": {
    id: 4,
    name: "Tazas Personalizadas",
    category: "Merchandising",
    image: "/custom-branded-mugs.jpg",
    description: "Tazas cerámicas con impresión full color",
    fullDescription:
      "Tazas de cerámica blanca de 11 oz con impresión full color de alta calidad. Perfectas para regalos corporativos y merchandising de marca.",
    specifications: [
      { label: "Material", value: "Cerámica" },
      { label: "Capacidad", value: "11 oz (330 ml)" },
      { label: "Impresión", value: "Sublimación Full Color" },
      { label: "Apto", value: "Microondas y lavavajillas" },
    ],
    pricingTiers: [
      { minQty: 24, maxQty: 47, pricePerUnit: 7.5 },
      { minQty: 48, maxQty: 95, pricePerUnit: 6.5 },
      { minQty: 96, maxQty: 143, pricePerUnit: 5.5 },
      { minQty: 144, maxQty: null, pricePerUnit: 4.5 },
    ],
    deliveryTime: "7-10 días hábiles",
  },
  "5": {
    id: 5,
    name: "Bolígrafos Corporativos",
    category: "Merchandising",
    image: "/corporate-branded-pens.jpg",
    description: "Bolígrafos metálicos con grabado láser",
    fullDescription:
      "Bolígrafos metálicos de alta calidad con grabado láser personalizado. Elegantes y duraderos, perfectos para regalos corporativos y eventos empresariales.",
    specifications: [
      { label: "Material", value: "Metal (Aluminio)" },
      { label: "Tinta", value: "Azul o Negro" },
      { label: "Personalización", value: "Grabado Láser" },
      { label: "Presentación", value: "Estuche individual opcional" },
    ],
    pricingTiers: [
      { minQty: 50, maxQty: 99, pricePerUnit: 1.6 },
      { minQty: 100, maxQty: 249, pricePerUnit: 1.3 },
      { minQty: 250, maxQty: 499, pricePerUnit: 1.0 },
      { minQty: 500, maxQty: null, pricePerUnit: 0.8 },
    ],
    deliveryTime: "5-7 días hábiles",
  },
  "6": {
    id: 6,
    name: "Volantes Publicitarios",
    category: "Material Publicitario",
    image: "/promotional-flyers-stack.jpg",
    description: "Volantes en papel couché brillante",
    fullDescription:
      "Volantes publicitarios impresos en papel couché brillante de alta calidad. Ideales para promociones, eventos y campañas de marketing.",
    specifications: [
      { label: "Material", value: "Papel Couché 150g" },
      { label: "Tamaño", value: "A5 (14.8 x 21 cm)" },
      { label: "Impresión", value: "Full Color (CMYK)" },
      { label: "Acabado", value: "Brillante" },
    ],
    pricingTiers: [
      { minQty: 100, maxQty: 499, pricePerUnit: 0.35 },
      { minQty: 500, maxQty: 999, pricePerUnit: 0.25 },
      { minQty: 1000, maxQty: 2499, pricePerUnit: 0.18 },
      { minQty: 2500, maxQty: null, pricePerUnit: 0.12 },
    ],
    deliveryTime: "3-5 días hábiles",
  },
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const product = productsData[productId]

  const [quantity, setQuantity] = useState(product?.pricingTiers[0]?.minQty || 100)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <Link href="/catalogo">
          <Button variant="outline" className="bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Catálogo
          </Button>
        </Link>
      </div>
    )
  }

  // Calculate price based on quantity
  const getCurrentPrice = () => {
    const tier = product.pricingTiers.find(
      (tier) => quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty),
    )
    return tier?.pricePerUnit || product.pricingTiers[0].pricePerUnit
  }

  const currentPrice = getCurrentPrice()
  const totalPrice = currentPrice * quantity

  const handleAddToQuote = () => {
    // In a real app, this would add to a cart/quote state
    const quoteItem = {
      productId: product.id,
      name: product.name,
      quantity,
      pricePerUnit: currentPrice,
      total: totalPrice,
    }

    // Store in localStorage for now
    const existingQuote = JSON.parse(localStorage.getItem("quote") || "[]")
    const existingItemIndex = existingQuote.findIndex((item: any) => item.productId === product.id)

    if (existingItemIndex >= 0) {
      existingQuote[existingItemIndex] = quoteItem
    } else {
      existingQuote.push(quoteItem)
    }

    localStorage.setItem("quote", JSON.stringify(existingQuote))
    router.push("/cotizador")
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/catalogo" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Catálogo
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover w-full h-full" />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-accent text-accent-foreground">{product.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-balance mb-4">{product.name}</h1>
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">{product.fullDescription}</p>
            </div>

            {/* Quantity Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Selecciona la Cantidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={product.pricingTiers[0].minQty}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(product.pricingTiers[0].minQty, Number.parseInt(e.target.value) || 0))
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cantidad mínima: {product.pricingTiers[0].minQty} unidades
                  </p>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Precio por unidad:</span>
                    <span className="text-2xl font-bold text-primary">${currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleAddToQuote}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary-hover text-white"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Agregar a Cotización
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{product.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Envío a todo Ecuador</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="pricing" className="mb-12">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="pricing">Precios por Volumen</TabsTrigger>
            <TabsTrigger value="specs">Especificaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Precios por Volumen</CardTitle>
                <p className="text-sm text-muted-foreground">Obtén mejores precios al ordenar mayores cantidades</p>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {product.pricingTiers.map((tier, index) => (
                    <Card
                      key={index}
                      className={`${
                        quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty)
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {tier.minQty} - {tier.maxQty || "∞"} unidades
                            </p>
                            <p className="text-2xl font-bold text-primary">${tier.pricePerUnit.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">por unidad</p>
                          </div>
                          {quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty) && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Especificaciones Técnicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <Package className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{spec.label}</p>
                        <p className="text-sm text-muted-foreground">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
