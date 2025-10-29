"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listProducts, searchProducts, getProductsByCategory } from "@/src/lib/data"
import { Producto } from "@/src/services/supabaseClient"

const LOAD_ERROR_MESSAGE = "Error al cargar los productos"

export default function CatalogoPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  useEffect(() => {
    void loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const productsData = await listProducts()
      setProducts(productsData)
    } catch (err) {
      console.error("Error loading products:", err)
      setError(LOAD_ERROR_MESSAGE)
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
      console.error("Error searching products:", err)
      setError("Error al buscar productos")
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
      console.error("Error filtering by category:", err)
      setError("Error al filtrar por categoría")
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.categoria))).filter(Boolean),
    [products]
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const matchesSearch =
        normalizedQuery.length === 0 ||
        product.nombre.toLowerCase().includes(normalizedQuery) ||
        product.descripcion?.toLowerCase().includes(normalizedQuery)

      const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const sortedProducts = useMemo(() => {
    const ordered = [...filteredProducts]
    ordered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.nombre.localeCompare(b.nombre)
        case "category":
          return a.categoria.localeCompare(b.categoria)
        case "price":
          return 0
        default:
          return 0
      }
    })
    return ordered
  }, [filteredProducts, sortBy])

  if (loading && products.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F9FF]">
        <div className="pointer-events-none absolute -left-24 top-8 h-60 w-60 rounded-full bg-[#FFD700]/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[-14%] -top-40 h-80 w-80 rounded-full bg-[#0066CC]/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-white/50 via-transparent to-transparent" aria-hidden="true" />

        <div className="relative z-10">
          <div className="container mx-auto px-5 pb-20 pt-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <div className="inline-flex animate-pulse items-center justify-center rounded-full border border-white/70 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#0066CC]">
                Colección FullColor
              </div>
              <div className="mt-6 space-y-3 animate-pulse">
                <div className="mx-auto h-9 w-3/4 rounded-full bg-slate-200/70" />
                <div className="mx-auto h-4 w-2/3 rounded-full bg-slate-200/70" />
              </div>
            </div>

            <div className="mx-auto mt-10 w-full max-w-2xl space-y-5">
              <div className="h-24 rounded-[28px] border border-white/50 bg-white/80 shadow-[0_40px_110px_-65px_rgba(0,102,204,0.35)] backdrop-blur animate-pulse" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-48 rounded-3xl bg-white/80 shadow-[0_24px_70px_-55px_rgba(0,102,204,0.35)] backdrop-blur animate-pulse" />
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
      <div className="relative min-h-screen overflow-hidden bg-[#F6F9FF]">
        <div className="pointer-events-none absolute -left-28 top-16 h-64 w-64 rounded-full bg-[#FFD700]/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[-10%] -top-24 h-72 w-72 rounded-full bg-[#0066CC]/18 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex min-h-screen items-center">
          <div className="container mx-auto px-5 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl rounded-[32px] border border-white/60 bg-white/90 p-10 text-center shadow-[0_40px_110px_-65px_rgba(0,102,204,0.55)] backdrop-blur">
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-[#0066CC]" />
              <h1 className="text-3xl font-semibold text-slate-900">Error al cargar productos</h1>
              <p className="mt-3 text-base text-slate-600">{error}</p>
              <Button className="mt-6 rounded-full bg-[#0066CC] px-6 py-2 text-sm font-semibold text-white hover:bg-[#005bb5]" onClick={() => void loadProducts()}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F9FF]">
      <div className="pointer-events-none absolute -left-24 top-10 h-60 w-60 rounded-full bg-[#FFD700]/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-12%] -top-32 h-72 w-72 rounded-full bg-[#0066CC]/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-white/40 via-white/0 to-transparent" aria-hidden="true" />

      <div className="relative z-10">
        <div className="container mx-auto px-5 pb-20 pt-16 sm:px-6 lg:px-8">
          <section className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center justify-center rounded-full border border-[#0066CC]/15 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#0066CC] shadow-sm">
              Colección FullColor
            </span>
            <h1 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl">Catálogo de productos</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Descubre líneas de impresión, merchandising y acabados pensados para marcas que buscan impacto.
            </p>
          </section>

          <section className="mx-auto mt-10 w-full max-w-2xl">
            <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_40px_110px_-65px_rgba(0,102,204,0.55)] backdrop-blur">
              <div className="space-y-6">
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0066CC]/80">Buscar</span>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0066CC]"
                      aria-hidden="true"
                    />
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => void handleSearch(event.target.value)}
                      placeholder="Buscar productos..."
                      className="h-12 rounded-full border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-[#0066CC] focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Categoría</span>
                    <Select value={selectedCategory} onValueChange={(value) => void handleCategoryChange(value)}>
                      <SelectTrigger className="h-12 rounded-full border border-slate-200 bg-slate-50/80 px-4 text-left text-sm font-medium text-slate-700 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border border-slate-100 bg-white shadow-xl">
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Ordenar por</span>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                      <SelectTrigger className="h-12 rounded-full border border-slate-200 bg-slate-50/80 px-4 text-left text-sm font-medium text-slate-700 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border border-slate-100 bg-white shadow-xl">
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="category">Categoría</SelectItem>
                        <SelectItem value="price">Precio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1 rounded-2xl bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                  <p className="font-semibold text-slate-600">
                    Mostrando {sortedProducts.length} producto{sortedProducts.length !== 1 ? "s" : ""}
                  </p>
                  <span>Actualizamos inventario en tiempo real.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Explora la colección</h2>
              {searchQuery || selectedCategory !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    void loadProducts()
                  }}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-[#0066CC] hover:text-[#0066CC]"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>

            {sortedProducts.length === 0 ? (
              <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-dashed border-[#0066CC]/30 bg-white/85 px-8 py-14 text-center shadow-[0_24px_80px_-60px_rgba(0,102,204,0.45)]">
                <AlertCircle className="mx-auto mb-5 h-14 w-14 text-[#0066CC]" />
                <h3 className="text-2xl font-semibold text-slate-900">No se encontraron productos</h3>
                <p className="mt-3 text-base text-slate-600">
                  Ajusta los filtros o realiza una nueva búsqueda para explorar más opciones.
                </p>
                <Button
                  className="mt-6 rounded-full bg-[#0066CC] px-6 py-2 text-sm font-semibold text-white hover:bg-[#005bb5]"
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
              <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
                {sortedProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group flex h-full flex-col rounded-[28px] bg-white/90 p-3 sm:p-4 shadow-[0_28px_80px_-60px_rgba(0,102,204,0.45)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_32px_95px_-55px_rgba(0,102,204,0.55)]"
                  >
                    <Link
                      href={`/producto/${product.id}`}
                      className="block overflow-hidden rounded-2xl bg-[#eeeeee]"
                      aria-label={`Ver detalles de ${product.nombre}`}
                    >
                      <div className="aspect-[4/3] w-full">
                        <img
                          src={product.imagen_url || "/placeholder.svg?height=320&width=400"}
                          alt={product.nombre}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    </Link>

                    <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                      <Link
                        href={`/producto/${product.id}`}
                        className="block text-base sm:text-lg font-semibold leading-tight text-slate-900 transition hover:text-[#0066CC] line-clamp-2"
                      >
                        {product.nombre}
                      </Link>

                      {product.minimo_pedido ? (
                        <p className="text-xs sm:text-sm font-medium text-slate-500">
                          Mín: {product.minimo_pedido} {product.unidad}
                        </p>
                      ) : null}

                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500">
                        <span className="inline-block h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#0066CC]" aria-hidden="true" />
                        <span className="line-clamp-1">{product.categoria}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {loading && products.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full bg-white/95 px-5 py-3 text-sm font-medium text-slate-700 shadow-[0_20px_45px_-28px_rgba(0,104,165,0.35)]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0066CC]/20 border-t-[#0066CC]" />
            Cargando catálogo...
          </div>
        </div>
      )}
    </div>
  )
}
