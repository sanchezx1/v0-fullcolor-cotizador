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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar productos
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadProducts}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Catálogo de Productos
          </h1>
          <p className="text-gray-600">
            Descubre nuestra amplia gama de productos de impresión y merchandising
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="category">Categoría</SelectItem>
                <SelectItem value="price">Precio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {sortedProducts.length} producto{sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar tus filtros de búsqueda
            </p>
            <Button onClick={() => {
              setSearchQuery("")
              setSelectedCategory("all")
              loadProducts()
            }}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
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

        {/* Loading overlay for subsequent loads */}
        {loading && products.length > 0 && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Cargando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}