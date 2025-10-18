"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { listProducts } from "@/src/lib/data"
import { Producto } from "@/src/services/supabaseClient"

export function FeaturedCards() {
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const products = await listProducts()
      // Tomar los primeros 3 productos como destacados para el componente
      setFeaturedProducts(products.slice(0, 3))
    } catch (err) {
      console.error('Error loading featured products:', err)
      setError('Error al cargar productos destacados')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="hidden lg:grid lg:grid-cols-2 lg:grid-rows-2 gap-4 h-[500px]">
          <div className="row-span-2 bg-gray-200 rounded"></div>
          <div className="bg-gray-200 rounded"></div>
          <div className="bg-gray-200 rounded"></div>
        </div>
        <div className="lg:hidden">
          <div className="flex gap-4 overflow-x-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] h-[360px] bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || featuredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {error || 'No hay productos destacados'}
        </h3>
        <p className="text-gray-600 mb-6">
          {error || 'No se encontraron productos para mostrar'}
        </p>
        <button 
          onClick={loadFeaturedProducts}
          className="text-primary hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Desktop: Grid layout */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:grid-rows-2 gap-4 h-[500px]">
        {/* First card - spans 2 rows */}
        <Link
          href={`/producto/${featuredProducts[0].id}`}
          className="row-span-2"
          onMouseEnter={() => setHoveredCard(0)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card className="group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img
              src={featuredProducts[0].imagen_url || "/placeholder.svg?height=500&width=400"}
              alt={featuredProducts[0].nombre}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
              <p className="text-sm opacity-90 mb-2">{featuredProducts[0].categoria}</p>
              <h3 className="text-xl font-semibold mb-3 text-balance">{featuredProducts[0].nombre}</h3>
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/80 transition-all duration-300 ${
                  hoveredCard === 0 ? "bg-white/20 scale-110" : "bg-transparent"
                }`}
              >
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Second card */}
        {featuredProducts[1] && (
          <Link
            href={`/producto/${featuredProducts[1].id}`}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Card className="group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
              <img
                src={featuredProducts[1].imagen_url || "/placeholder.svg?height=240&width=400"}
                alt={featuredProducts[1].nombre}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
                <p className="text-xs opacity-90 mb-1">{featuredProducts[1].categoria}</p>
                <h3 className="text-base font-semibold mb-2 text-balance">{featuredProducts[1].nombre}</h3>
                <div
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-white/80 transition-all duration-300 ${
                    hoveredCard === 1 ? "bg-white/20 scale-110" : "bg-transparent"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Third card */}
        {featuredProducts[2] && (
          <Link
            href={`/producto/${featuredProducts[2].id}`}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Card className="group relative h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
              <img
                src={featuredProducts[2].imagen_url || "/placeholder.svg?height=240&width=400"}
                alt={featuredProducts[2].nombre}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
                <p className="text-xs opacity-90 mb-1">{featuredProducts[2].categoria}</p>
                <h3 className="text-base font-semibold mb-2 text-balance">{featuredProducts[2].nombre}</h3>
                <div
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-white/80 transition-all duration-300 ${
                    hoveredCard === 2 ? "bg-white/20 scale-110" : "bg-transparent"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>
        )}
      </div>

      {/* Mobile: Horizontal scroll carousel */}
      <div className="lg:hidden">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide -mx-5 px-5">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/producto/${product.id}`}
              className="flex-shrink-0 w-[280px] snap-center first:ml-0"
            >
              <Card className="group relative h-[360px] overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                <img
                  src={product.imagen_url || "/placeholder.svg?height=360&width=280"}
                  alt={product.nombre}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white">
                  <p className="text-sm opacity-90 mb-2 font-medium">{product.categoria}</p>
                  <h3 className="text-lg font-semibold mb-4 text-balance leading-tight">{product.nombre}</h3>
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border-2 border-white/90 bg-white/20 backdrop-blur-sm">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-5">
          {featuredProducts.map((_, index) => (
            <div key={index} className="w-2 h-2 rounded-full bg-primary/30" />
          ))}
        </div>
      </div>
    </>
  )
}