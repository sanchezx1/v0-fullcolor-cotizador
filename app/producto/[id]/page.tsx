"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ShoppingCart, Check, Package, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { getProductWithTiers, priceForQuantity, ProductWithTiers, PricingTier } from "@/src/lib/data"
import { useQuoteBuilder } from "@/src/hooks/useQuoteBuilder"
import { ProductImageCarousel } from "@/components/product-image-carousel"
import { fetchProductGallery } from "@/src/lib/product-gallery"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params.id as string)

  const [product, setProduct] = useState<ProductWithTiers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<string>("100")
  const [addingToQuote, setAddingToQuote] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [galleryImages, setGalleryImages] = useState<{ src: string; alt: string }[]>([])
  const [activeTab, setActiveTab] = useState("pricing")
  const isMountedRef = useRef(true)
  const pricingSectionRef = useRef<HTMLDivElement | null>(null)

  const parsedQuantity = Number.parseInt(quantity, 10)
  const quantityValue = Number.isNaN(parsedQuantity) ? 0 : Math.max(0, parsedQuantity)

  // Hook para manejar cotizaciones
  const { addItemToQuote, loading: quoteLoading } = useQuoteBuilder()

  const showQuoteToast = () => {
    toast.custom((id) => (
      <div className="w-full max-w-sm rounded-2xl border border-primary/10 bg-white p-4 shadow-lg ring-1 ring-black/5 transition-all duration-300 ease-out dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary">Producto agregado</p>
              <p className="text-sm text-slate-600 dark:text-slate-200">Que deseas hacer ahora?</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                size="sm"
                className="w-full bg-primary text-white hover:bg-primary-hover focus-visible:ring-[#FFD700] sm:w-auto"
                onClick={() => {
                  toast.dismiss(id)
                  router.push("/cotizador")
                }}
              >
                Finalizar cotizacion
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full border border-primary/30 bg-white/80 text-primary hover:bg-primary/10 hover:text-primary focus-visible:ring-[#FFD700] dark:border-primary/40 dark:bg-slate-900 sm:w-auto"
                onClick={() => {
                  toast.dismiss(id)
                  router.push("/catalogo")
                }}
              >
                Seguir comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: 6000,
      closeButton: false
    })
  }

  const showOutOfStockToast = () => {
    toast.custom((id) => (
      <div className="w-full max-w-sm rounded-2xl border border-[#0066CC]/20 bg-white p-4 shadow-lg ring-1 ring-[#0066CC]/15 transition-all duration-300 ease-out dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0066CC]/10 text-[#0066CC]">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#0066CC]">Lo sentimos, este producto está agotado.</p>
              <p className="text-sm text-slate-600 dark:text-slate-200">Explora otras opciones disponibles en el catálogo.</p>
            </div>
            <Button
              type="button"
              size="sm"
              className="w-full bg-[#0066CC] text-white hover:bg-[#005bb5] focus-visible:ring-[#FFD700]"
              onClick={() => {
                toast.dismiss(id)
                router.push("/catalogo")
              }}
            >
              Ver más opciones en el catálogo
            </Button>
          </div>
        </div>
      </div>
    ), {
      duration: 6000,
      closeButton: false
    })
  }

  const handleScrollToPricing = () => {
    setActiveTab("pricing")
    if (pricingSectionRef.current) {
      pricingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const productData = await getProductWithTiers(productId)
      if (!productData) {
        if (isMountedRef.current) {
          setError('Producto no encontrado')
        }
        return
      }
      if (!isMountedRef.current) {
        return
      }
      setProduct(productData)
      const fallbackGallery = productData.imagen_url
        ? [{ src: productData.imagen_url, alt: productData.nombre }]
        : []
      setGalleryImages(fallbackGallery)
      const galleryItems = await fetchProductGallery(productData.id)
      if (!isMountedRef.current) {
        return
      }
      if (galleryItems.length > 0) {
        const merged = new Map<string, { src: string; alt: string }>()
        fallbackGallery.forEach((item) => merged.set(item.src, item))
        galleryItems.forEach((item, index) => {
          if (!merged.has(item.url)) {
            merged.set(item.url, {
              src: item.url,
              alt: `${productData.nombre} - vista ${index + 1}`,
            })
          }
        })
        setGalleryImages(Array.from(merged.values()))
      }
      // Establecer cantidad inicial basada en el mínimo de pedido
      if (productData.pricingTiers.length > 0) {
        setQuantity(productData.pricingTiers[0].cantidad_min.toString())
      } else if (productData.minimo_pedido && productData.minimo_pedido > 0) {
        setQuantity(productData.minimo_pedido.toString())
      } else {
        setQuantity("1")
      }
    } catch (err) {
      console.error('Error loading product:', err)
      if (isMountedRef.current) {
        setError('Error al cargar el producto')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [productId])

  useEffect(() => {
    isMountedRef.current = true
    void loadProduct()

    return () => {
      isMountedRef.current = false
    }
  }, [loadProduct])

  const handleAddToQuote = async () => {
    if (!product) return
    if (product.agotado) {
      showOutOfStockToast()
      return
    }

    const minimumFromTier = product.pricingTiers.length > 0 ? product.pricingTiers[0].cantidad_min : null
    const minimumOrder = minimumFromTier ?? (product.minimo_pedido && product.minimo_pedido > 0 ? product.minimo_pedido : 1)

    if (quantityValue < minimumOrder) {
      toast.error(`El pedido mínimo de este producto es ${minimumOrder}.`)
      return
    }

    try {
      setAddingToQuote(true)
      setAddSuccess(false)
      
      await addItemToQuote(product.id, product.nombre, product.categoria, quantityValue)

      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 3000)
      showQuoteToast()
    } catch (err) {
      console.error('Error adding to quote:', err)
      if (err instanceof Error && (err as any).code === 'PRODUCTO_AGOTADO') {
        showOutOfStockToast()
      }
    } finally {
      setAddingToQuote(false)
    }
  }

  const handleQuantityChange = (value: string) => {
    const sanitizedValue = value.replace(/[^\d]/g, "")
    setQuantity(sanitizedValue)
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

    return priceForQuantity(pricingTiers, quantityValue)
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

  const minQuantity = product.pricingTiers.length > 0
    ? product.pricingTiers[0].cantidad_min
    : product.minimo_pedido && product.minimo_pedido > 0
      ? product.minimo_pedido
      : 1
  const outOfStock = Boolean(product.agotado)
  const isBelowMinimum = !outOfStock && quantity !== "" && quantityValue < minQuantity
  const quantityErrorId = `quantity-error-${product.id}`

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
            <ProductImageCarousel
              images={galleryImages}
              aspectRatioClassName="aspect-square"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {product.categoria}
                </Badge>
                {product.mas_vendido && (
                  <Badge variant="outline" className="border-[#FFD700]/40 bg-[#FFD700]/20 text-[#1F2937]">
                    Más vendido
                  </Badge>
                )}
                {outOfStock && (
                  <Badge variant="outline" className="border-[#1F2937]/30 bg-[#1F2937]/90 text-white">
                    Agotado
                  </Badge>
                )}
              </div>
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
                  inputMode="numeric"
                  pattern="[0-9]*"
                  data-testid="quantity-input"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  aria-invalid={isBelowMinimum}
                  aria-describedby={isBelowMinimum ? quantityErrorId : undefined}
                    className={`mt-2 ${outOfStock ? 'cursor-not-allowed opacity-80' : ''}`}
                    disabled={outOfStock}
                    aria-disabled={outOfStock || undefined}
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
                    {isBelowMinimum && (
                      <div
                        id={quantityErrorId}
                        role="alert"
                        aria-live="polite"
                        className="mt-2 flex items-center gap-1 text-sm text-amber-600"
                      >
                        <AlertCircle className="w-4 h-4" aria-hidden="true" />
                        El pedido mínimo de este producto es {minQuantity}.
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleScrollToPricing}
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 transition-colors"
                >
                  Ver listas de precios
                </button>

                {outOfStock && (
                  <div className="flex items-start gap-3 rounded-lg border border-[#1F2937]/15 bg-[#1F2937]/5 px-4 py-3 text-sm text-[#1F2937]">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-[#0066CC]" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Producto temporalmente agotado</p>
                      <p className="text-[#4B5563]">Puedes revisar el catálogo para encontrar alternativas similares.</p>
                    </div>
                  </div>
                )}

                <Button 
                  className={`w-full transition-colors ${outOfStock ? 'bg-slate-300 text-slate-600 hover:bg-slate-300 focus-visible:ring-[#FFD700] cursor-not-allowed' : ''}`} 
                  size="lg"
                  onClick={handleAddToQuote}
                  disabled={addingToQuote || quoteLoading}
                  aria-disabled={outOfStock || undefined}
                >
                  {addingToQuote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Agregando...
                    </>
                  ) : addSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      ¡Agregado!
                    </>
                  ) : (
                    <>
                      {outOfStock ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Producto agotado
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Agregar a Cotización
                        </>
                      )}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12" ref={pricingSectionRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pricing">Precios</TabsTrigger>
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
            </TabsList>

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
          </Tabs>
        </div>
      </div>
    </div>
  )
}
