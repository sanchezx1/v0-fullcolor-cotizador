"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listProducts, searchProducts, getProductsByCategory } from "@/src/lib/data"
import { supabase, Producto } from "@/src/services/supabaseClient"

const LOAD_ERROR_MESSAGE = "Error al cargar los productos"

export default function CatalogoPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [pricingByProduct, setPricingByProduct] = useState<Record<number, { fromPrice: number; fromQuantity: number }>>({})
  const pricingRequestRef = useRef(0)

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
    []
  )

  const quantityFormatter = useMemo(() => new Intl.NumberFormat("es-EC"), [])

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
      void loadPricingForProducts(searchResults)
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
      void loadPricingForProducts(categoryProducts)
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
              <Button className="mt-6 rounded-md bg-[#0066CC] px-6 py-2 text-sm font-semibold text-white hover:bg-[#005bb5]" onClick={() => void loadProducts()}>
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
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Catálogo de productos</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Descubre líneas de impresión, merchandising y acabados pensados para marcas que buscan impacto.
            </p>
          </section>

          <section className="mx-auto mt-10 w-full max-w-2xl">
            <div className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-[0_40px_110px_-65px_rgba(0,102,204,0.55)] backdrop-blur">
              <div className="space-y-6">
                <div className="flex flex-col gap-2 text-left">
                  <span id="catalogo-buscar-label" className="text-xs font-semibold uppercase tracking-[0.28em] text-[#005a99]">Buscar</span>
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
                      aria-labelledby="catalogo-buscar-label"
                      className="h-12 rounded-full border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-[#0066CC] focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <span id="catalogo-categoria-label" className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Categoría</span>
                    <Select value={selectedCategory} onValueChange={(value) => void handleCategoryChange(value)}>
                      <SelectTrigger aria-labelledby="catalogo-categoria-label" aria-label="Filtrar por categoría" className="h-12 rounded-full border border-slate-200 bg-slate-50/80 px-4 text-left text-sm font-medium text-slate-700 focus:ring-0 focus:ring-offset-0">
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
                    <span id="catalogo-orden-label" className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Ordenar por</span>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                      <SelectTrigger aria-labelledby="catalogo-orden-label" aria-label="Ordenar resultados" className="h-12 rounded-full border border-slate-200 bg-slate-50/80 px-4 text-left text-sm font-medium text-slate-700 focus:ring-0 focus:ring-offset-0">
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
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-4">
                {sortedProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/95 shadow-[0_26px_85px_-60px_rgba(0,102,204,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_32px_105px_-58px_rgba(0,102,204,0.6)]"
                  >
                    <Link
                      href={`/producto/${product.id}`}
                      className="relative block overflow-hidden rounded-[24px] bg-white p-2.5 transition duration-300 group-hover:bg-white sm:p-3"
                      aria-label={`Ver detalles de ${product.nombre}${product.agotado ? ' (agotado)' : ''}`}
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-slate-100">
                        {product.mas_vendido && (
                          <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-[#FFD700] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1F2937] shadow-[0_12px_30px_-18px_rgba(31,41,55,0.7)]">
                            Más vendido
                          </span>
                        )}
                        <img
                          src={product.imagen_url || "/placeholder.svg?height=320&width=400"}
                          alt={product.nombre}
                          className={`h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105 ${product.agotado ? 'opacity-70 saturate-[65%]' : ''}`}
                        />
                        {product.agotado && (
                          <div
                            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-slate-900/65 backdrop-blur-sm text-white"
                            role="status"
                            aria-live="polite"
                          >
                            <span className="rounded-full border border-white/40 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[#1F2937]">
                              Agotado
                            </span>
                            <span className="text-xs text-white/80">Disponible nuevamente muy pronto</span>
                          </div>
                        )}
                        <div
                          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-900/18 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-5 sm:py-6">
                      <div className="flex flex-1 flex-col gap-3">
                        <Link
                          href={`/producto/${product.id}`}
                          className="block text-lg font-semibold leading-tight text-slate-900 transition hover:text-[#0066CC] sm:text-xl"
                        >
                          {product.nombre}
                        </Link>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex max-w-max items-center gap-2 rounded-full bg-[#0066CC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0066CC]">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FFD700]" aria-hidden="true" />
                            {product.categoria}
                          </span>
                          {product.mas_vendido && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#FFD700]/40 bg-[#FFD700]/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1F2937]">
                              Más vendido
                            </span>
                          )}
                          {product.agotado && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#1F2937]/20 bg-[#1F2937]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                              Agotado
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm sm:text-base">
                        {(() => {
                          const pricingInfo = pricingByProduct[product.id]
                          if (pricingInfo && pricingInfo.fromPrice > 0) {
                            const formattedPrice = currencyFormatter.format(pricingInfo.fromPrice)
                            const formattedQuantity = quantityFormatter.format(pricingInfo.fromQuantity)
                            return (
                              <p className="leading-relaxed text-slate-600">
                                <span className="font-semibold text-[#0066CC]">Desde {formattedPrice}</span> por artículo{" "}
                                <span className="text-slate-500">
                                  (pedido mínimo {formattedQuantity} {product.unidad})
                                </span>
                              </p>
                            )
                          }

                          if (product.minimo_pedido) {
                            const formattedQuantity = quantityFormatter.format(product.minimo_pedido)
                            return (
                              <p className="leading-relaxed text-slate-600">
                                Tarifas disponibles al cotizar{" "}
                                <span className="text-slate-500">
                                  (pedido mínimo {formattedQuantity} {product.unidad})
                                </span>
                              </p>
                            )
                          }

                          return <p className="leading-relaxed text-slate-600">Tarifas disponibles al cotizar.</p>
                        })()}
                        {product.agotado && (
                          <p className="flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#FFD700]" aria-hidden="true" />
                            Producto temporalmente agotado. Revisa otras opciones del catálogo.
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/producto/${product.id}`}
                        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#0066CC] transition hover:text-[#005bb5]"
                      >
                        Ver detalles
                        <span aria-hidden="true" className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1">
                          &rarr;
                        </span>
                      </Link>
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
