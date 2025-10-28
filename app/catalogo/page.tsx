"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
      <div className="relative min-h-screen overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[320px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="space-y-10 animate-pulse">
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
                <div className="h-4 w-28 rounded-full bg-slate-200" />
                <div className="h-10 w-3/4 rounded-full bg-slate-200" />
                <div className="h-5 w-2/3 rounded-full bg-slate-200" />
              </div>
              <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-60px_rgba(0,104,165,0.45)] backdrop-blur">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-12 rounded-full bg-slate-200" />
                  ))}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="h-[320px] rounded-3xl bg-white/70 shadow-[0_20px_45px_-28px_rgba(0,104,165,0.35)]" />
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
      <div className="relative min-h-screen overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-[320px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-12 lg:py-16">
            <div className="mx-auto max-w-xl rounded-3xl border border-white/60 bg-white/90 p-10 text-center shadow-[0_30px_80px_-60px_rgba(0,104,165,0.45)] backdrop-blur">
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
              <h1 className="text-3xl font-semibold text-slate-900">Error al cargar productos</h1>
              <p className="mt-3 text-base text-slate-600">{error}</p>
              <Button className="mt-6 rounded-full px-6" onClick={loadProducts}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[320px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          {/* Header */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              Colección FullColor
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Catálogo de productos
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Descubre líneas de impresión, merchandising y acabados pensados para marcas que buscan impacto.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-10 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_30px_80px_-60px_rgba(0,104,165,0.45)] backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
              {/* Search */}
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700">Buscar</label>
                <div className="relative mt-2">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="h-12 rounded-full border-slate-200 bg-white pl-11 pr-4 text-sm placeholder:text-slate-400 focus-visible:ring-primary/40"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex-1 lg:max-w-xs">
                <label className="text-sm font-medium text-slate-700">Categoría</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="mt-2 h-12 w-full rounded-full border-slate-200 bg-white px-5 text-sm font-medium text-slate-700">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex-1 lg:max-w-xs">
                <label className="text-sm font-medium text-slate-700">Ordenar por</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="mt-2 h-12 w-full rounded-full border-slate-200 bg-white px-5 text-sm font-medium text-slate-700">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="name">Nombre</SelectItem>
                    <SelectItem value="category">Categoría</SelectItem>
                    <SelectItem value="price">Precio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <p className="font-medium text-slate-600">
                Mostrando {sortedProducts.length} producto{sortedProducts.length !== 1 ? "s" : ""}
              </p>
              {searchQuery || selectedCategory !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    void loadProducts()
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary/30 hover:text-primary"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-primary/20 bg-white/80 px-8 py-16 text-center shadow-[0_20px_60px_-45px_rgba(0,104,165,0.45)]">
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-primary/70" />
              <h3 className="text-2xl font-semibold text-slate-900">No se encontraron productos</h3>
              <p className="mt-3 text-base text-slate-600">
                Ajusta los filtros o realiza una nueva búsqueda para explorar más opciones.
              </p>
              <Button
                className="mt-6 rounded-full px-6"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  void loadProducts()
                }}
              >
                Restablecer filtros
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`} className="group block h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_28px_75px_-45px_rgba(0,104,165,0.55)] ring-1 ring-slate-100 transition duration-500 hover:-translate-y-1 hover:shadow-[0_35px_95px_-50px_rgba(0,104,165,0.55)]">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={product.imagen_url || "/placeholder.svg?height=320&width=400"}
                        alt={product.nombre}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between px-6 pb-5 text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="text-sm font-medium">Ver detalles</span>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-4 px-6 py-6">
                      <Badge
                        variant="outline"
                        className="w-fit rounded-full border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
                      >
                        {product.categoria}
                      </Badge>
                      <h3 className="text-lg font-semibold leading-tight text-slate-900 transition-colors group-hover:text-primary line-clamp-2">
                        {product.nombre}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {product.descripcion}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">
                          Mínimo: {product.minimo_pedido} {product.unidad}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary transition group-hover:border-primary/40 group-hover:bg-primary/10">
                          Cotizar
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {/* Loading overlay for subsequent loads */}
          {loading && products.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
              <div className="flex items-center gap-3 rounded-full bg-white/95 px-5 py-3 text-sm font-medium text-slate-700 shadow-[0_20px_45px_-28px_rgba(0,104,165,0.35)]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                Cargando catálogo…
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}