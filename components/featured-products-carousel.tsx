"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency } from "@/lib/utils"
import { Producto, PrecioEscalonado } from "@/src/services/supabaseClient"
import { getProductWithTiers, ProductWithTiers } from "@/src/lib/data"

interface FeaturedProductsCarouselProps {
  products: Producto[]
}

type EnrichedProduct = {
  product: Producto
  tiers: PrecioEscalonado[]
  minUnitPrice: number | null
}

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const [enrichedProducts, setEnrichedProducts] = useState<EnrichedProduct[]>([])
  const [loadingTiers, setLoadingTiers] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef({ itemWidthWithGap: 0 })
  const [itemsPerPage, setItemsPerPage] = useState(1)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [indicatorMetrics, setIndicatorMetrics] = useState({ dot: 0, step: 0, offset: 0 })
  const indicatorsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
    let active = true

    const loadPricing = async () => {
      if (!products.length) {
        setEnrichedProducts([])
        return
      }
      setLoadingTiers(true)
      try {
        const detailed = await Promise.all(
          products.map(async (product) => {
            try {
              const withTiers: ProductWithTiers | null = await getProductWithTiers(product.id)
              const tiers = withTiers?.pricingTiers ?? []
              const minUnitPrice = tiers.length
                ? Math.min(...tiers.map((tier) => tier.precio_unitario))
                : null
              return { product, tiers, minUnitPrice }
            } catch (error) {
              console.error("Error loading tiers for product", product.id, error)
              return { product, tiers: [], minUnitPrice: null }
            }
          })
        )
        if (active) {
          setEnrichedProducts(detailed)
        }
      } finally {
        if (active) {
          setLoadingTiers(false)
        }
      }
    }

    void loadPricing()

    return () => {
      active = false
    }
  }, [products])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const updateItemsPerPage = () => {
      setItemsPerPage(mediaQuery.matches ? 3 : 1)
    }

    updateItemsPerPage()
    mediaQuery.addEventListener("change", updateItemsPerPage)

    return () => mediaQuery.removeEventListener("change", updateItemsPerPage)
  }, [])

  const updateMetrics = () => {
    const viewport = viewportRef.current
    if (!viewport) return
    const firstCard = viewport.querySelector<HTMLElement>("[data-carousel-card]")
    if (!firstCard) return
    const firstRect = firstCard.getBoundingClientRect()
    const secondCard = firstCard.nextElementSibling as HTMLElement | null
    let gap = 0
    if (secondCard) {
      const secondRect = secondCard.getBoundingClientRect()
      gap = secondRect.left - firstRect.right
    }
    metricsRef.current.itemWidthWithGap = firstRect.width + gap
  }

  useEffect(() => {
    updateMetrics()
    const handleResize = () => updateMetrics()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [enrichedProducts])

  useEffect(() => {
    setActiveCardIndex(0)
    const viewport = viewportRef.current
    if (viewport) {
      viewport.scrollTo({ left: 0, behavior: "smooth" })
    }
  }, [itemsPerPage, enrichedProducts.length])

  const totalPages = useMemo(() => {
    if (!enrichedProducts.length) return 0
    return Math.max(1, Math.ceil(enrichedProducts.length / itemsPerPage))
  }, [enrichedProducts.length, itemsPerPage])

  useLayoutEffect(() => {
    const container = indicatorsRef.current
    if (!container) return

    const update = () => {
      const dots = container.querySelectorAll<HTMLButtonElement>('button[data-indicator-dot]')
      if (!dots.length) return

      const containerRect = container.getBoundingClientRect()
      const firstRect = dots[0].getBoundingClientRect()
      const secondRect = dots[1]?.getBoundingClientRect()

      const dot = firstRect.width
      const step = secondRect ? secondRect.left - firstRect.left : 0
      const offset = firstRect.left - containerRect.left

      setIndicatorMetrics((prev) => {
        if (prev.dot === dot && prev.step === step && prev.offset === offset) return prev
        return { dot, step, offset }
      })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [itemsPerPage, totalPages])

  const activePage = totalPages ? Math.min(totalPages - 1, Math.floor(activeCardIndex / itemsPerPage)) : 0
  const maxIndex = Math.max(0, enrichedProducts.length - itemsPerPage)
  const canScrollPrev = activeCardIndex > 0
  const canScrollNext = activeCardIndex < maxIndex

  const pillWidth = indicatorMetrics.step > 0
    ? Math.max(indicatorMetrics.dot * 2.4, indicatorMetrics.step + indicatorMetrics.dot)
    : indicatorMetrics.dot
  const pillTranslate = indicatorMetrics.offset
    + activePage * indicatorMetrics.step
    + indicatorMetrics.dot / 2
    - pillWidth / 2


  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleScroll = () => {
      const { itemWidthWithGap } = metricsRef.current
      if (!itemWidthWithGap) return
      const index = Math.round(viewport.scrollLeft / itemWidthWithGap)
      const safeIndex = Math.max(0, Math.min(index, maxIndex))
      setActiveCardIndex(safeIndex)
    }

    handleScroll()
    viewport.addEventListener("scroll", handleScroll)
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [maxIndex])

  useLayoutEffect(() => {
    const container = indicatorsRef.current
    if (!container) return
    const dots = container.querySelectorAll<HTMLButtonElement>('button[data-indicator-dot]')
    if (!dots.length) return

    const containerRect = container.getBoundingClientRect()
    const firstDot = dots[0]
    const secondDot = dots[1]
    const dotWidth = firstDot.offsetWidth
    let gap = dotWidth
    if (secondDot) {
      const rect1 = firstDot.getBoundingClientRect()
      const rect2 = secondDot.getBoundingClientRect()
      gap = rect2.left - rect1.left - dotWidth
    }
    const offset = firstDot.getBoundingClientRect().left - containerRect.left

    setIndicatorMetrics((prev) => {
      if (prev.dot === dotWidth && prev.gap === gap && prev.offset === offset) return prev
      return { dot: dotWidth, gap, offset }
    })
  }, [totalPages, itemsPerPage])

  const scrollByPage = (direction: number) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const { itemWidthWithGap } = metricsRef.current
    if (!itemWidthWithGap) return
    const targetIndex = Math.max(0, Math.min(activeCardIndex + direction * itemsPerPage, maxIndex))
    const left = targetIndex * itemWidthWithGap
    viewport.scrollTo({ left, behavior: "smooth" })
    setActiveCardIndex(targetIndex)
  }

  const scrollToPage = (pageIndex: number) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const { itemWidthWithGap } = metricsRef.current
    if (!itemWidthWithGap) return

    const targetIndex = Math.max(0, Math.min(pageIndex * itemsPerPage, maxIndex))
    viewport.scrollTo({ left: targetIndex * itemWidthWithGap, behavior: "smooth" })
    setActiveCardIndex(targetIndex)
  }

  if (!loadingTiers && enrichedProducts.length === 0) {
    return (
      <div className="rounded-3xl border border-primary/10 bg-white/80 p-12 text-center text-slate-600">
        No hay productos destacados disponibles en este momento.
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <div
          ref={viewportRef}
          className={cn(
            "flex gap-6 overflow-x-auto scroll-smooth pb-6 justify-center lg:justify-start mx-auto w-full max-w-[1120px]",
            "snap-x snap-mandatory",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          {loadingTiers && !enrichedProducts.length ? (
            <div className="flex w-full justify-center">
              <div className="h-64 w-full max-w-md animate-pulse rounded-3xl bg-slate-200" />
            </div>
          ) : (
            enrichedProducts.map(({ product, tiers, minUnitPrice }, index) => {
              const sortedTiers = [...tiers].sort((a, b) => a.cantidad_min - b.cantidad_min)
              const tierChips = sortedTiers.slice(0, 4).map((tier) => `${tier.cantidad_min}u`)
              const priceLabel = minUnitPrice
                ? `Desde ${formatCurrency(minUnitPrice)} por articulo`
                : "Precio bajo consulta"

              return (
                <div
                  key={product.id}
                  data-carousel-card
                  className="flex basis-full flex-shrink-0 snap-center flex-col items-center gap-3 w-[88vw] max-w-[320px] sm:w-[320px] sm:max-w-[320px] md:w-[320px] md:max-w-[320px] md:basis-[320px] lg:w-[360px] lg:max-w-[360px] lg:basis-[360px]"
                >
                  <Link
                    href={`/producto/${product.id}`}
                    className="group block w-full overflow-hidden rounded-3xl bg-white shadow-[0_12px_35px_-24px_rgba(0,104,165,0.45)]"
                    aria-label={`Ver detalles de ${product.nombre}`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#eeeeee]">
                      <img
                        src={product.imagen_url || "/placeholder.svg?height=320&width=400"}
                        alt={product.nombre}
                        className="w-full h-auto object-cover transition duration-500 group-hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </Link>

                  <div className="w-full space-y-[6px]">
                    <Link
                      href={`/producto/${product.id}`}
                      className="text-lg font-semibold text-slate-900 transition hover:text-[#0068A5] line-clamp-2"
                    >
                      {product.nombre}
                    </Link>

                    {tierChips.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {tierChips.map((chip, chipIndex) => (
                          <Badge
                            key={`${product.id}-tier-${chipIndex}`}
                            variant="outline"
                            className="rounded-full border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                          >
                            {chip}
                          </Badge>
                        ))}
                      </div>
                    ) : null}

                    <p className="text-sm font-medium text-slate-700">
                      {priceLabel}
                      {product.minimo_pedido ? (
                        <span className="text-slate-500">
                          {" "}(Min order {product.minimo_pedido})
                        </span>
                      ) : null}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0068A5]" aria-hidden="true" />
                      <span>{product.categoria}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 items-center justify-center pl-6 lg:flex">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="Anterior"
            disabled={!canScrollPrev}
            aria-disabled={!canScrollPrev}
            className={cn(
              "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/70 text-[#0068A5] shadow transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C700]",
              !canScrollPrev && "cursor-default opacity-45 pointer-events-none"
            )}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 items-center justify-center pr-6 lg:flex">
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Siguiente"
            disabled={!canScrollNext}
            aria-disabled={!canScrollNext}
            className={cn(
              "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/70 text-[#0068A5] shadow transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C700]",
              !canScrollNext && "cursor-default opacity-45 pointer-events-none"
            )}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {totalPages > 0 ? (
        <div
          className="relative mt-6 flex justify-center"
          ref={indicatorsRef}
          role="tablist"
          aria-label="Páginas de productos destacados"
        >
          {indicatorMetrics.dot > 0 ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 z-0 h-2.5 -translate-y-1/2 rounded-full bg-[#0068A5] transition-all duration-300 ease-out"
              style={{
                width: indicatorMetrics.dot * 2.8,
                transform: `translateX(${
                  indicatorMetrics.offset + activePage * (indicatorMetrics.dot + indicatorMetrics.step)
                }px) translateY(-50%)`,
              }}
            />
          ) : null}
          <div className="flex gap-2.5">
            {Array.from({ length: totalPages }).map((_, index) => {
              const isActive = index === activePage
              return (
                <button
                  key={index}
                  type="button"
                  data-indicator-dot
                  onClick={() => scrollToPage(index)}
                  aria-label={`Ver grupo ${index + 1} de productos destacados`}
                  aria-current={isActive}
                  className={cn(
                    "relative z-10 h-2.5 w-2.5 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0068A5]",
                    isActive ? "bg-transparent" : "bg-slate-300 hover:bg-slate-400"
                  )}
                >
                  <span className="sr-only">Productos destacados página {index + 1}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline" className="rounded-full border-[#0068A5]/30 px-8 py-5 text-sm font-semibold text-[#0068A5] hover:border-[#0068A5] hover:bg-[#0068A5]/10">
          <Link href="/catalogo">Ver todo el catalogo</Link>
        </Button>
      </div>
    </div>
  )
}
