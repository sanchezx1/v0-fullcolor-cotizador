"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Package, Truck, HeadphonesIcon, AlertCircle } from "lucide-react"
import { CategoryChips } from "@/components/category-chips"
import { FeaturedCards } from "@/components/featured-cards"
import { WhatsAppHelp } from "@/components/whatsapp-help"
import { listProducts } from "@/src/lib/data"
import { Producto } from "@/src/services/supabaseClient"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const products = await listProducts()
      // Tomar los primeros 6 productos como destacados
      setFeaturedProducts(products.slice(0, 6))
    } catch (err) {
      console.error('Error loading featured products:', err)
      setError('Error al cargar productos destacados')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: Package,
      title: "Calidad Premium",
      description: "Materiales de primera calidad y acabados profesionales",
    },
    {
      icon: Truck,
      title: "Entrega Rápida",
      description: "Tiempos de entrega optimizados para tu proyecto",
    },
    {
      icon: HeadphonesIcon,
      title: "Soporte 24/7",
      description: "Atención personalizada cuando la necesites",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Impresión y{" "}
              <span className="text-primary">Merchandising</span> de Calidad
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transformamos tus ideas en productos físicos de alta calidad. 
              Desde tarjetas de presentación hasta merchandising corporativo, 
              tenemos todo lo que necesitas para hacer brillar tu marca.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/catalogo">
                  Ver Catálogo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/cotizador">
                  Cotizar Ahora
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre nuestros productos más populares, diseñados para 
              satisfacer las necesidades de tu empresa.
            </p>
          </div>

          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Error al cargar productos
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={loadFeaturedProducts}>
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full border-border/50 hover:border-primary/30">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={product.imagen_url || "/placeholder.svg?height=300&width=400"}
                        alt={product.nombre}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Ver detalles</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          {product.categoria}
                        </Badge>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.descripcion}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-muted-foreground">
                            Mínimo: {product.minimo_pedido} {product.unidad}
                          </span>
                          <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Cotizar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/catalogo">
                Ver Todos los Productos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nos comprometemos a brindarte la mejor experiencia en impresión y merchandising
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cards Component */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <FeaturedCards />
        </div>
      </section>

      {/* Category Chips */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explora por Categorías
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra exactamente lo que necesitas navegando por nuestras categorías especializadas
            </p>
          </div>
          <CategoryChips />
        </div>
      </section>

      {/* WhatsApp Help */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <WhatsAppHelp />
        </div>
      </section>
    </div>
  )
}