"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedPagerIndicator } from "@/components/animated-pager-indicator"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/src/lib/formatters"
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
  const metricsRef = useRef({ itemWidthWithGap: 0, baseOffset: 0 })
  const [itemsPerPage, setItemsPerPage] = useState(1)
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [pageProgress, setPageProgress] = useState(0)

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
      const newItemsPerPage = mediaQuery.matches ? 3 : 1
      setItemsPerPage(newItemsPerPage)
    }

    updateItemsPerPage()
    mediaQuery.addEventListener("change", updateItemsPerPage)

    return () => mediaQuery.removeEventListener("change", updateItemsPerPage)
  }, [])

  const totalPages = useMemo(() => {
    if (!enrichedProducts.length) return 0
    // En móvil (itemsPerPage=1), cada producto es una página
    // En desktop (itemsPerPage=3), agrupamos de 3 en 3
    return Math.max(1, Math.ceil(enrichedProducts.length / itemsPerPage))
  }, [enrichedProducts.length, itemsPerPage])
  const maxIndex = Math.max(0, enrichedProducts.length - itemsPerPage)
  const canScrollPrev = activeCardIndex > 0
  const canScrollNext = activeCardIndex < maxIndex

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const { itemWidthWithGap, baseOffset } = metricsRef.current
    if (!itemWidthWithGap) return

    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
    const startOffset = Math.min(baseOffset, maxScroll)
    const endOffset = maxScroll
    const currentScroll = viewport.scrollLeft
    const clampedScroll = Math.min(Math.max(currentScroll, startOffset), endOffset)
    const normalizedScroll = Math.max(0, currentScroll - baseOffset)

    const rawIndex = normalizedScroll / itemWidthWithGap
    const index = Math.round(rawIndex)
    const safeIndex = Math.max(0, Math.min(index, maxIndex))
    setActiveCardIndex((prev) => (prev === safeIndex ? prev : safeIndex))

    const pageRange = Math.max(0, totalPages - 1)
    if (pageRange === 0) {
      setPageProgress((prev) => (prev === 0 ? prev : 0))
      return
    }

    // Mejorar cálculo de progress para móvil: mapear directamente el índice de tarjeta a página
    // En móvil cada tarjeta = 1 página, en desktop cada grupo de 3 = 1 página
    let progress: number
    if (itemsPerPage === 1) {
      // Móvil: progress basado directamente en el índice de la tarjeta
      progress = safeIndex
    } else {
      // Desktop: progress basado en scroll proporcional
      const denominator = Math.max(endOffset - startOffset, 1)
      const progressRatio = (clampedScroll - startOffset) / denominator
      progress = Math.max(0, Math.min(progressRatio * pageRange, pageRange))
    }
    
    setPageProgress((prev) => (Math.abs(prev - progress) < 0.001 ? prev : progress))
  }, [maxIndex, totalPages, itemsPerPage])

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const firstCard = viewport.querySelector<HTMLElement>("[data-carousel-card]")
    if (!firstCard) {
      metricsRef.current.itemWidthWithGap = 0
      metricsRef.current.baseOffset = 0
      handleScroll()
      return
    }

    const secondCard = firstCard.nextElementSibling as HTMLElement | null
    const cardWidth = firstCard.offsetWidth
    const gap = secondCard ? Math.max(0, secondCard.offsetLeft - firstCard.offsetLeft - cardWidth) : 0

    // En móvil (itemsPerPage=1), baseOffset debe ser 0 para empezar en el primer producto
    // En desktop (itemsPerPage=3), centramos las tarjetas
    const baseOffset = itemsPerPage === 1 
      ? 0 
      : Math.max(0, firstCard.offsetLeft - (viewport.clientWidth - cardWidth) / 2)

    metricsRef.current.itemWidthWithGap = cardWidth + gap
    metricsRef.current.baseOffset = baseOffset
    handleScroll()
  }, [handleScroll, itemsPerPage])

  useEffect(() => {
    updateMetrics()
    const handleResize = () => updateMetrics()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updateMetrics, enrichedProducts])

  useEffect(() => {
    setActiveCardIndex(0)
    setPageProgress(0)
    const viewport = viewportRef.current
    if (viewport) {
      const timeoutId = setTimeout(() => {
        updateMetrics()
        // Scroll al baseOffset calculado (0 en móvil, centrado en desktop)
        viewport.scrollTo({ left: metricsRef.current.baseOffset, behavior: "auto" })
        if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(() => handleScroll())
        } else {
          handleScroll()
        }
      }, 50)
      return () => clearTimeout(timeoutId)
    }
  }, [itemsPerPage, enrichedProducts.length, handleScroll, updateMetrics])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    handleScroll()
    const onScroll = () => handleScroll()

    viewport.addEventListener("scroll", onScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", onScroll)
  }, [handleScroll])

  const scrollToCard = (target: number, behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current
    if (!viewport) return
    const cards = viewport.querySelectorAll<HTMLElement>("[data-carousel-card]")
    if (!cards.length) return
    const clamped = Math.max(0, Math.min(target, cards.length - 1))
    const card = cards[clamped]
    const baseOffset = metricsRef.current.baseOffset
    const centerOffset = (viewport.clientWidth - card.clientWidth) / 2
    const targetLeft =
      itemsPerPage === 1
        ? card.offsetLeft - centerOffset
        : card.offsetLeft - baseOffset

    viewport.scrollTo({ left: Math.max(0, targetLeft), behavior })
  }

  const scrollByPage = (direction: number) => {
    const targetIndex = Math.max(0, Math.min(activeCardIndex + direction * itemsPerPage, maxIndex))
    scrollToCard(targetIndex)
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
            "flex gap-6 overflow-x-auto pb-6 justify-start mx-auto w-full max-w-[1120px] px-4 sm:px-10 lg:px-0",
            "snap-x snap-mandatory",
            "scroll-smooth",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "[scroll-snap-type:x_mandatory] [scroll-snap-stop:always]"
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
                  className="flex basis-full flex-shrink-0 snap-start flex-col items-center gap-3 w-[calc(100vw-2rem)] max-w-[320px] sm:w-[320px] sm:max-w-[320px] md:w-[320px] md:max-w-[320px] md:basis-[320px] lg:w-[360px] lg:max-w-[360px] lg:basis-[360px]"
                >
                  <Link
                    href={`/producto/${product.id}`}
                    className="group block w-full overflow-hidden rounded-3xl bg-white shadow-[0_12px_35px_-24px_rgba(0,104,165,0.45)]"
                    aria-label={`Ver detalles de ${product.nombre}`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-100">
                      <img
                        src={product.imagen_url || "/placeholder.svg?height=320&width=400"}
                        alt={product.nombre}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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

        <div className="pointer-events-none absolute top-0 -left-6 hidden h-[240px] w-16 items-center justify-center lg:flex">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="Anterior"
            disabled={!canScrollPrev}
            aria-disabled={!canScrollPrev}
            className={cn(
              "pointer-events-auto flex h-14 w-14 items-center justify-center rounded-md border-2 border-slate-200 bg-white text-[#0068A5] shadow-lg transition hover:border-[#0068A5] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C700]",
              !canScrollPrev && "cursor-default opacity-45 pointer-events-none"
            )}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="pointer-events-none absolute top-0 -right-6 hidden h-[240px] w-16 items-center justify-center lg:flex">
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Siguiente"
            disabled={!canScrollNext}
            aria-disabled={!canScrollNext}
            className={cn(
              "pointer-events-auto flex h-14 w-14 items-center justify-center rounded-md border-2 border-slate-200 bg-white text-[#0068A5] shadow-lg transition hover:border-[#0068A5] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C700]",
              !canScrollNext && "cursor-default opacity-45 pointer-events-none"
            )}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {totalPages > 0 ? (
        <div className="flex justify-center">
          <AnimatedPagerIndicator pageCount={totalPages} progress={pageProgress} className="mt-6" />
        </div>
      ) : null}

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline" className="rounded-md border-[#0068A5]/30 px-8 py-5 text-sm font-semibold text-[#0068A5] hover:border-[#0068A5] hover:bg-[#0068A5]/10">
          <Link href="/catalogo">Ver todo el catálogo</Link>
        </Button>
      </div>
    </div>
  )
}
