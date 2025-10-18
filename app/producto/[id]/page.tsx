"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ShoppingCart, Check, Package, Clock, Truck, AlertCircle } from "lucide-react"
import { getProductWithTiers, priceForQuantity, ProductWithTiers, PricingTier } from "@/src/lib/data"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params.id as string)

  const [product, setProduct] = useState<ProductWithTiers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(100)

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const productData = await getProductWithTiers(productId)
      
      if (!productData) {
        setError('Producto no encontrado')
        return
      }

      setProduct(productData)
      
      // Establecer cantidad inicial basada en el mínimo de pedido
      if (productData.pricingTiers.length > 0) {
        setQuantity(productData.pricingTiers[0].cantidad_min)
      }
    } catch (err) {
      console.error('Error loading product:', err)
      setError('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (product && product.pricingTiers.length > 0) {
      const minQuantity = product.pricingTiers[0].cantidad_min
      setQuantity(Math.max(minQuantity, newQuantity))
    }
  }

  const getCurrentPricing = () => {
    if (!product || product.pricingTiers.length === 0) {
      return null
    }

    // Convertir PrecioEscalonado[] a PricingTier[]
    const pricingTiers: PricingTier[] = product.pricingTiers.map((tier, index) => ({
      minQty: tier.cantidad_min,
      maxQty: index < product.pricingTiers.length - 1 
        ? product.pricingTiers[index + 1].cantidad_min - 1 
        : null,
      pricePerUnit: tier.precio_unitario
    }))

    return priceForQuantity(pricingTiers, quantity)
  }

  const currentPricing = getCurrentPricing()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Producto no encontrado'}
            </h1>
            <p className="text-gray-600 mb-6">
              No pudimos encontrar el producto que buscas.
            </p>
            <Button asChild>
              <Link href="/catalogo">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Catálogo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const minQuantity = product.pricingTiers.length > 0 ? product.pricingTiers[0].cantidad_min : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="p-0 h-auto">
            <Link href="/catalogo" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Volver al Catálogo
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-lg">
              <img
                src={product.imagen_url || "/placeholder.svg?height=500&width=500"}
                alt={product.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.categoria}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.nombre}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {product.descripcion}
              </p>
            </div>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Precios por Cantidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="quantity" className="text-base font-medium">
                    Cantidad
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={minQuantity}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(Number.parseInt(e.target.value) || minQuantity)
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cantidad mínima: {minQuantity} {product.unidad}
                  </p>
                </div>

                {currentPricing && (
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Precio unitario:</span>
                      <span className="font-semibold">
                        ${currentPricing.pricePerUnit?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Subtotal:</span>
                      <span className="text-xl font-bold text-primary">
                        ${currentPricing.subtotal.toFixed(2)}
                      </span>
                    </div>
                    {!currentPricing.isValid && (
                      <div className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Cantidad por debajo del mínimo
                      </div>
                    )}
                  </div>
                )}

                <Button className="w-full" size="lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Agregar a Cotización
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Tiempo de entrega</p>
                    <p className="text-sm text-muted-foreground">3-5 días hábiles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
              <TabsTrigger value="pricing">Precios</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    {product.descripcion}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categoría:</span>
                        <span className="font-medium">{product.categoria}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unidad:</span>
                        <span className="font-medium">{product.unidad}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mínimo de pedido:</span>
                        <span className="font-medium">{minQuantity} {product.unidad}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Escalas de Precio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {product.pricingTiers.map((tier, index) => {
                      const maxQty = index < product.pricingTiers.length - 1 
                        ? product.pricingTiers[index + 1].cantidad_min - 1 
                        : null
                      
                      return (
                        <Card
                          key={tier.id}
                          className={`${
                            currentPricing?.appliedTier?.minQty === tier.cantidad_min
                              ? "ring-2 ring-primary bg-primary/5"
                              : ""
                          }`}
                        >
                          <CardContent className="pt-4 text-center">
                            <div className="text-2xl font-bold text-primary">
                              ${tier.precio_unitario.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {tier.cantidad_min}+ unidades
                              {maxQty && ` - ${maxQty}`}
                            </div>
                            {currentPricing?.appliedTier?.minQty === tier.cantidad_min && (
                              <div className="mt-2">
                                <Badge variant="default" className="text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  Aplicado
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}