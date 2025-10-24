"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ArrowRight, AlertCircle } from "lucide-react"
import { listProducts, searchProducts, getProductsByCategory } from "@/src/lib/data"
import { Producto } from "@/src/services/supabaseClient"

export default function CatalogoPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const productsData = await listProducts()
      setProducts(productsData)
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      await loadProducts()
      return
    }

    try {
      setLoading(true)
      const searchResults = await searchProducts(query)
      setProducts(searchResults)
    } catch (err) {
      console.error('Error searching products:', err)
      setError('Error al buscar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category)
    
    if (category === "all") {
      await loadProducts()
      return
    }

    try {
      setLoading(true)
      const categoryProducts = await getProductsByCategory(category)
      setProducts(categoryProducts)
    } catch (err) {
      console.error('Error filtering by category:', err)
      setError('Error al filtrar por categoría')
    } finally {
      setLoading(false)
    }
  }

  // Obtener categorías únicas
  const categories = Array.from(new Set(products.map(p => p.categoria)))

  // Filtrar productos (ya filtrados por búsqueda/categoría)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === "" || 
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.nombre.localeCompare(b.nombre)
      case "category":
        return a.categoria.localeCompare(b.categoria)
      case "price":
        // Ordenar por precio mínimo (primer tier)
        return 0 // Por ahora mantenemos el orden original
      default:
        return 0
    }
  })

  if (loading && products.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1d4ed8_0%,_transparent_55%)] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#f97316_0%,_transparent_45%)] opacity-20" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur">
            <div className="space-y-6 text-white">
              <div className="h-8 w-2/3 rounded-full bg-white/20" />
              <div className="h-12 rounded-2xl bg-white/10" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-white/10" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1d4ed8_0%,_transparent_55%)] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#f97316_0%,_transparent_45%)] opacity-20" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/10 p-10 text-center text-white backdrop-blur">
            <AlertCircle className="mx-auto mb-6 h-16 w-16 text-red-400" />
            <h1 className="mb-3 text-3xl font-bold">Error al cargar productos</h1>
            <p className="mb-8 text-sm text-white/70">{error}</p>
            <Button onClick={loadProducts} size="lg" className="rounded-full">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1d4ed8_0%,_transparent_55%)] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_#f97316_0%,_transparent_45%)] opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9)_0%,_rgba(15,23,42,0.6)_50%,_rgba(15,23,42,0.9)_100%)]" />
      <div className="relative">
        <div className="container mx-auto flex flex-col gap-12 px-4 py-16">
          {/* Header */}
          <div className="grid gap-6 lg:grid-cols-[3fr,2fr] lg:items-center">
            <div className="space-y-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Catálogo actualizado en tiempo real
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                  Encuentra el material perfecto para tu próxima campaña
                </h1>
                <p className="max-w-xl text-base text-white/70">
                  Explora nuestro portafolio de soluciones de impresión y merchandising personalizable.
                  Filtra por categoría, ordena por relevancia y descubre detalles clave en cada producto.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[{ label: "Categorías activas", value: categories.length || 0 }, { label: "Productos disponibles", value: sortedProducts.length }, { label: "Tiempo estimado de respuesta", value: "< 24h" }].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 backdrop-blur">
                    <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
                    <p className="text-2xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 text-white backdrop-blur lg:block">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.4)_0%,_transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(140deg,_rgba(255,255,255,0.12)_0%,_rgba(255,255,255,0)_50%)]" />
              <div className="relative space-y-6">
                <h2 className="text-2xl font-semibold">Filtros inteligentes</h2>
                <p className="text-sm text-white/70">
                  Nuestros filtros dinámicos te permiten localizar materiales por aplicación, formato o presupuesto en cuestión de segundos.
                </p>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Selecciona múltiples categorías y ordena por prioridad.</li>
                  <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Visualiza mínimos de producción antes de cotizar.</li>
                  <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Accede a fichas técnicas con un solo clic.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="grid gap-4 md:grid-cols-[1.6fr,1fr,1fr]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <Input
                    placeholder="Buscar por nombre, uso o descripción"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="h-12 rounded-2xl border-white/10 bg-white/10 pl-11 text-white placeholder:text-white/40 focus-visible:ring-white/40"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-white/50 focus:ring-0">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white">
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-white/50 focus:ring-0">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 text-white">
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="category">Categoría</SelectItem>
                    <SelectItem value="price">Precio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || selectedCategory !== "all") && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                  <span className="text-white/60">Filtros activos:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="rounded-full border border-white/20 bg-white/10 text-white">
                      Búsqueda: "{searchQuery}"
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="rounded-full border border-white/20 bg-white/10 text-white">
                      Categoría: {selectedCategory}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-8 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                      loadProducts()
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-white/60">
            <p className="text-sm">
              Mostrando <span className="font-semibold text-white">{sortedProducts.length}</span> producto{sortedProducts.length !== 1 ? 's' : ''}
            </p>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Inventario en constante actualización
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-16 text-center text-white/70">
              <AlertCircle className="mx-auto mb-6 h-16 w-16 text-white/40" />
              <h3 className="mb-3 text-2xl font-semibold text-white">No se encontraron productos</h3>
              <p className="mx-auto mb-8 max-w-md text-sm">
                Ajusta los filtros o restablece la búsqueda para explorar todo nuestro catálogo disponible.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  loadProducts()
                }}
                className="rounded-full"
              >
                Restaurar catálogo
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`}>
                  <Card className="group h-full overflow-hidden border-white/10 bg-white/5 transition-all duration-500 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={product.imagen_url || "/placeholder.svg?height=300&width=400"}
                        alt={product.nombre}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/0 to-slate-950/50" />
                      <div className="absolute inset-x-0 bottom-0 flex translate-y-6 flex-col gap-3 px-5 pb-5 text-white transition-all duration-500 group-hover:translate-y-0">
                        <div className="flex items-center gap-2 text-xs text-white/70">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 backdrop-blur">
                            <ArrowRight className="h-3 w-3" /> Ver ficha completa
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="flex h-full flex-col gap-4 p-5">
                      <Badge variant="secondary" className="w-fit rounded-full border border-white/10 bg-white/10 text-xs font-medium uppercase tracking-wider text-white">
                        {product.categoria}
                      </Badge>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-sky-200">
                          {product.nombre}
                        </h3>
                        <p className="text-sm leading-relaxed text-white/70 line-clamp-3">
                          {product.descripcion}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
                        <span>
                          Mínimo de pedido
                          <span className="ml-2 font-semibold text-white">{product.minimo_pedido} {product.unidad}</span>
                        </span>
                        <Button size="sm" className="rounded-full bg-white text-slate-900 hover:bg-slate-200">
                          Cotizar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay for subsequent loads */}
      {loading && products.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-6 py-3 text-white">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-sm font-medium">Actualizando resultados...</span>
          </div>
        </div>
      )}
    </div>
  )
}