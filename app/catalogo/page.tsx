"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listProducts, searchProducts, getProductsByCategory } from "@/src/lib/data"
import { supabase, Producto } from "@/src/services/supabaseClient"
import { formatCurrency, formatQuantity } from "@/src/lib/formatters"

const LOAD_ERROR_MESSAGE = "Error al cargar los productos"

export default function CatalogoPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [pricingByProduct, setPricingByProduct] = useState<Record<number, { fromPrice: number; fromQuantity: number }>>({})
  const pricingRequestRef = useRef(0)

  const loadPricingForProducts = useCallback(
    async (productList: Producto[]) => {
      const productIds = productList.map((product) => product.id)
      const requestId = ++pricingRequestRef.current

      if (productIds.length === 0) {
        if (pricingRequestRef.current === requestId) {
          setPricingByProduct({})
        }
        return
      }

      try {
        const { data, error } = await supabase
          .from("precios_escalonados")
          .select("producto_id, cantidad_min, precio_unitario")
          .in("producto_id", productIds)
          .order("cantidad_min", { ascending: true })
          .returns<Array<{ producto_id: number; cantidad_min: number; precio_unitario: number }>>()

        if (error) {
          console.error("Error loading pricing tiers:", error)
          return
        }

        if (pricingRequestRef.current !== requestId) {
          return
        }

        const nextPricing: Record<number, { fromPrice: number; fromQuantity: number }> = {}

        data?.forEach((tier) => {
          const current = nextPricing[tier.producto_id]
          if (!current || tier.cantidad_min > current.fromQuantity) {
            nextPricing[tier.producto_id] = {
              fromPrice: tier.precio_unitario,
              fromQuantity: tier.cantidad_min
            }
          } else if (tier.cantidad_min === current.fromQuantity && tier.precio_unitario < current.fromPrice) {
            nextPricing[tier.producto_id] = {
              fromPrice: tier.precio_unitario,
              fromQuantity: tier.cantidad_min
            }
          }
        })

        setPricingByProduct(nextPricing)
      } catch (pricingError) {
        console.error("Error processing pricing tiers:", pricingError)
      }
    },
    []
  )


  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const productsData = await listProducts()
      setProducts(productsData)
      void loadPricingForProducts(productsData)
    } catch (err) {
      console.error("Error loading products:", err)
      setError(LOAD_ERROR_MESSAGE)
    } finally {
      setLoading(false)
    }
  }, [loadPricingForProducts])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
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
    ordered.sort((a, b) => a.nombre.localeCompare(b.nombre))
    return ordered
  }, [filteredProducts])

  if (loading && products.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F6F9FF]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-white/50 via-transparent to-transparent" aria-hidden="true" />

        <div className="relative z-10">
          <div className="container mx-auto px-5 pb-20 pt-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
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
        <div className="relative z-10 flex min-h-screen items-center">
          <div className="container mx-auto px-5 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl rounded-[32px] border border-white/60 bg-white/90 p-10 text-center shadow-[0_40px_110px_-65px_rgba(0,102,204,0.55)] backdrop-blur">
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-[#0066a1]" />
              <h1 className="text-3xl font-semibold text-slate-800">Error al cargar productos</h1>
              <p className="mt-3 text-base text-slate-600">{error}</p>
              <Button className="mt-6 rounded-md bg-[#0066a1] px-6 py-2 text-sm font-semibold text-white hover:bg-[#005080]" onClick={() => void loadProducts()}>
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-white/40 via-white/0 to-transparent" aria-hidden="true" />

      <div className="relative z-10">
        <div className="container mx-auto px-5 pb-20 pt-16 sm:px-6 lg:px-8">
          <section className="mx-auto max-w-3xl text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4 text-balance">
              Todo para tu marca, <span className="text-[#0066a1]">en un solo lugar.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-balance">
              Explora nuestro catálogo de impresión y merchandising con precios escalonados y calidad garantizada.
            </p>
          </section>

          <section className="mx-auto w-full max-w-3xl mb-12">
            <div className="relative">
              {/* Barra de búsqueda minimalista */}
              <div className="relative flex items-center gap-3 rounded-md border border-slate-200 bg-white p-1 shadow-sm transition-all focus-within:border-[#0066a1] focus-within:shadow-md">
                {/* Input de búsqueda */}
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="h-11 w-full border-0 bg-transparent pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
                  />
                </div>

                {/* Separador */}
                <div className="h-6 w-px bg-slate-200" />

                {/* Select de categoría */}
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="h-11 w-[180px] border-0 bg-transparent text-sm font-medium text-slate-700 shadow-none hover:bg-slate-50 focus:ring-0">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-slate-200">
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contador de resultados y limpiar filtros */}
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <p>
                  <span className="font-semibold text-slate-700">{sortedProducts.length}</span> productos
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                    }}
                    className="font-medium text-[#0066a1] transition-colors hover:text-[#005080] hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="hidden sm:flex sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Explora la colección</h2>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-dashed border-[#0066a1]/30 bg-white/85 px-8 py-14 text-center shadow-[0_24px_80px_-60px_rgba(0,102,204,0.45)]">
                <AlertCircle className="mx-auto mb-5 h-14 w-14 text-[#0066a1]" />
                <h3 className="text-2xl font-semibold text-slate-800">No se encontraron productos</h3>
                <p className="mt-3 text-base text-slate-600">
                  Ajusta los filtros o realiza una nueva búsqueda para explorar más opciones.
                </p>
                <Button
                  className="mt-6 rounded-md bg-[#0066a1] px-6 py-2 text-sm font-semibold text-white hover:bg-[#005080]"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                >
                  Restablecer filtros
                </Button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
                {sortedProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      href={`/producto/${product.id}`}
                      className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
                      aria-label={`Ver detalles de ${product.nombre}${product.agotado ? ' (agotado)' : ''}`}
                    >
                      {product.mas_vendido && (
                        <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-md bg-amber-400 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                          Más vendido
                        </span>
                      )}
                      <img
                        src={product.imagen_url || "/placeholder.svg?height=320&width=400"}
                        alt={product.nombre}
                        className={`h-full w-full object-cover transition duration-700 ease-in-out group-hover:scale-105 ${product.agotado ? 'opacity-70 saturate-0' : ''}`}
                      />
                      {product.agotado && (
                        <div
                          className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px]"
                          role="status"
                          aria-live="polite"
                        >
                          <span className="rounded-md bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-lg">
                            Agotado
                          </span>
                        </div>
                      )}
                      <div
                        className="absolute inset-0 z-10 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {product.categoria}
                        </span>
                      </div>

                      <Link
                        href={`/producto/${product.id}`}
                        className="mb-2 block text-lg font-bold leading-tight text-slate-800 transition hover:text-[#0066a1]"
                      >
                        {product.nombre}
                      </Link>

                      <div className="mt-auto space-y-3 pt-4">
                        {(() => {
                          const pricingInfo = pricingByProduct[product.id]
                          if (pricingInfo && pricingInfo.fromPrice > 0) {
                            const formattedPrice = formatCurrency(pricingInfo.fromPrice)
                            const formattedQuantity = formatQuantity(pricingInfo.fromQuantity)
                            return (
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-500">Desde</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-bold text-[#0066a1]">{formattedPrice}</span>
                                  <span className="text-sm text-slate-500">/ ud.</span>
                                </div>
                                <span className="text-xs text-slate-400">
                                  Min. {formattedQuantity} {product.unidad}
                                </span>
                              </div>
                            )
                          }

                          if (product.minimo_pedido) {
                            const formattedQuantity = formatQuantity(product.minimo_pedido)
                            return (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-600">Cotizar precio</span>
                                <span className="text-xs text-slate-400">
                                  Min. {formattedQuantity} {product.unidad}
                                </span>
                              </div>
                            )
                          }

                          return <span className="text-sm font-medium text-slate-600">Precio a cotizar</span>
                        })()}

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <Link
                            href={`/producto/${product.id}`}
                            className="text-sm font-semibold text-[#0066a1] hover:text-[#005080] hover:underline"
                          >
                            Ver detalles
                          </Link>
                        </div>
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
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0066a1]/20 border-t-[#0066a1]" />
            Cargando catálogo...
          </div>
        </div>
      )}
    </div>
  )
}
