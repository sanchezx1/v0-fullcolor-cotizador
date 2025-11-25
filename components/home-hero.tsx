"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "Branding profesional a su medida",
    subtitle: "Diseñamos y producimos papelería y kits corporativos listos para impresionar al directorio.",
    primaryCta: {
      label: "Cotizar branding corporativo",
      href: "/cotizador",
    },
    image: "/herofoto1.webp",
    imageAlt: "Mockup de papelería corporativa FullColor sobre fondo azul",
    useNextImage: true,
  },
  {
    id: 2,
    title: "Regalos corporativos navideños",
    subtitle: "Curamos experiencias premium para agradecer a sus clientes en temporada festiva con entregas garantizadas.",
    primaryCta: {
      label: "Cotizar regalos navideños",
      href: "/cotizador",
    },
    image: "/placeholder.svg?height=760&width=1440",
    imageAlt: "Caja de obsequios navideños personalizados con la marca de la empresa",
    useNextImage: false,
  },
  {
    id: 3,
    title: "Activaciones y eventos memorables",
    subtitle: "Producción de displays, señalética y piezas promocionales que elevan cada lanzamiento.",
    primaryCta: {
      label: "Cotizar activación",
      href: "/cotizador",
    },
    image: "/placeholder.svg?height=760&width=1440",
    imageAlt: "Equipo creativo instalando material gráfico en un evento corporativo",
    useNextImage: false,
  },
]

const MOBILE_LOOP_GROUPS = 3
const MOBILE_LOOP_CENTER_INDEX = 1
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)"
const DESKTOP_AUTOPLAY_INTERVAL = 6000

export function HomeHero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [announcement, setAnnouncement] = useState(`${slides[0].title}. ${slides[0].subtitle}`)
  const [isDesktop, setIsDesktop] = useState(false)
  const totalSlides = slides.length
  const trackRef = useRef<HTMLDivElement>(null)
  const virtualIndexRef = useRef(totalSlides * MOBILE_LOOP_CENTER_INDEX)
  const mobileSlides = useMemo(
    () =>
      Array.from({ length: MOBILE_LOOP_GROUPS }, (_, groupIndex) =>
        slides.map((slide, originalIndex) => ({
          slide,
          originalIndex,
          isReplica: groupIndex !== MOBILE_LOOP_CENTER_INDEX,
          loopKey: `${groupIndex}-${slide.id}`,
        }))
      ).flat(),
    []
  )

  const setTrackScrollQuietly = useCallback((targetIndex: number) => {
    const track = trackRef.current
    if (!track) return
    const width = track.offsetWidth
    if (!width) return

    const previousBehavior = track.style.scrollBehavior
    track.style.scrollBehavior = "auto"
    track.scrollLeft = width * targetIndex

    requestAnimationFrame(() => {
      track.style.scrollBehavior = previousBehavior
    })
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const updateMatches = () => setIsDesktop(mediaQuery.matches)

    updateMatches()
    mediaQuery.addEventListener("change", updateMatches)
    return () => mediaQuery.removeEventListener("change", updateMatches)
  }, [])

    const goToSlide = useCallback(
    (index: number) => {
      if (totalSlides === 0) return
      const normalized = ((index % totalSlides) + totalSlides) % totalSlides
      setActiveIndex(normalized)
    },
    [totalSlides]
  )

  useEffect(() => {
    setAnnouncement(`${slides[activeIndex].title}. ${slides[activeIndex].subtitle}`)
  }, [activeIndex])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const syncToVirtualIndex = () => {
      setTrackScrollQuietly(virtualIndexRef.current)
    }

    syncToVirtualIndex()

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(syncToVirtualIndex)
      observer.observe(track)
      return () => observer.disconnect()
    }

    const handleResize = () => syncToVirtualIndex()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [setTrackScrollQuietly, totalSlides])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frameId: number | null = null

    const handleScroll = () => {
      if (frameId) cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        if (!track) return
        const { scrollLeft, offsetWidth } = track
        if (!offsetWidth) return

        const rawIndex = scrollLeft / offsetWidth
        virtualIndexRef.current = rawIndex

        const normalizedIndex =
          ((Math.round(rawIndex) % totalSlides) + totalSlides) % totalSlides
        setActiveIndex((previous) => (normalizedIndex === previous ? previous : normalizedIndex))

        const start = totalSlides * MOBILE_LOOP_CENTER_INDEX
        const end = totalSlides * (MOBILE_LOOP_CENTER_INDEX + 1)

        if (rawIndex < start) {
          const newIndex = rawIndex + totalSlides
          virtualIndexRef.current = newIndex
          setTrackScrollQuietly(newIndex)
        } else if (rawIndex >= end) {
          const newIndex = rawIndex - totalSlides
          virtualIndexRef.current = newIndex
          setTrackScrollQuietly(newIndex)
        }
        frameId = null
      })
    }

    track.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      track.removeEventListener("scroll", handleScroll)
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [setTrackScrollQuietly, totalSlides])

  useEffect(() => {
    if (typeof window === "undefined" || !isDesktop || totalSlides <= 1) {
      return
    }

    const timer = setInterval(() => {
      goToSlide(activeIndex + 1)
    }, DESKTOP_AUTOPLAY_INTERVAL)

    return () => clearInterval(timer)
  }, [activeIndex, goToSlide, isDesktop, totalSlides])

  const handleArrowKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      goToSlide(activeIndex + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      goToSlide(activeIndex - 1)
    }
  }

  const renderProgressBars = (className?: string, options?: { animate?: boolean }) => {
    const shouldAnimate = Boolean(options?.animate)

    return (
      <div className={cn("flex justify-center gap-2", className)}>
        {slides.map((slide, index) => {
          const isActive = index === activeIndex

          return (
            <div
              key={slide.id}
              className={cn(
                "relative h-1.5 w-12 overflow-hidden rounded-full transition-colors duration-300",
                isActive ? "bg-[#F5C700]/25" : "bg-[#ADCEE2] lg:bg-[#0068A5]/30"
              )}
              role="presentation"
            >
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full bg-[#F5C700]",
                  isActive && shouldAnimate ? "animate-progress-loading" : "w-0 opacity-0"
                )}
                style={{
                  animationDuration: `${DESKTOP_AUTOPLAY_INTERVAL}ms`,
                }}
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section className="relative">
      <div className="lg:hidden">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-6 scrollbar-hide"
          aria-roledescription="Carrusel de beneficios FullColor"
        >
          {mobileSlides.map(({ slide, originalIndex, isReplica, loopKey }) => {
            const isPrimarySlide = !isReplica
            const shouldPrioritize = isPrimarySlide && originalIndex === 0
            const isActive = originalIndex === activeIndex

            return (
              <article
                key={loopKey}
                className={cn("relative flex min-w-full snap-center flex-col", !isActive ? "pointer-events-none" : "")}
                aria-hidden={isReplica || !isActive ? true : undefined}
                aria-label={isPrimarySlide ? `Slide ${originalIndex + 1} de ${slides.length}` : undefined}
                role={isReplica ? "presentation" : undefined}
              >
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  {slide.useNextImage ? (
                    <Image
                      src={slide.image}
                      alt={slide.imageAlt}
                      fill
                      priority={shouldPrioritize}
                      quality={85}
                      sizes="100vw"
                      className="object-cover"
                      aria-hidden={isReplica ? true : undefined}
                    />
                  ) : (
                    <img
                      src={slide.image}
                      alt={slide.imageAlt}
                      className="h-full w-full object-cover"
                      loading={shouldPrioritize ? "eager" : "lazy"}
                      aria-hidden={isReplica ? true : undefined}
                    />
                  )}
                </div>
                <div className="flex min-h-[340px] flex-col justify-between rounded-t-3xl bg-[#0068A5] px-6 py-10 text-white">
                  <div className="space-y-5">
                  <h2 className="text-3xl font-bold leading-tight text-center">{slide.title}</h2>
                  <p className="text-base leading-relaxed text-white/90 text-center">
                    {slide.subtitle}
                  </p>
                </div>
                <div className="mt-8 flex justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-[#F5C700] px-7 py-5 text-base font-semibold text-slate-900 transition hover:bg-[#f2c000] shadow-lg"
                    tabIndex={isActive ? 0 : -1}
                    aria-hidden={isReplica || !isActive ? true : undefined}
                  >
                    <Link href={slide.primaryCta.href} tabIndex={isActive ? 0 : -1}>
                      {slide.primaryCta.label}
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
            )
          })}
        </div>
        {renderProgressBars("mt-2 px-6")}
      </div>

      <div
        className="relative hidden lg:block"
        tabIndex={0}
        onKeyDown={handleArrowKey}
        aria-roledescription="Carrusel hero FullColor"
        aria-label="Promociones destacadas de FullColor"
      >
        <div className="relative h-[70vh] min-h-[560px] w-full overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 flex h-full w-full items-center justify-start transition-opacity duration-700 ease-out",
                index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
              )}
              aria-hidden={index !== activeIndex}
            >
              {slide.useNextImage ? (
                <Image
                  src={slide.image}
                  alt=""
                  aria-hidden="true"
                  fill
                  priority={index === 0}
                  quality={85}
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <img
                  src={slide.image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0068A5]/88 via-[#0068A5]/52 to-transparent" />
              <div className="relative z-10 flex h-full items-center pl-40 pr-16">
                <div className="max-w-2xl text-white">
                  <h2 className="text-5xl font-semibold leading-tight text-white">{slide.title}</h2>
                  <p className="mt-6 text-lg leading-relaxed text-white/85">{slide.subtitle}</p>
                  <div className="mt-9">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full bg-[#F5C700] px-9 py-6 text-base font-semibold text-slate-900 transition hover:bg-[#f2c000]"
                      tabIndex={index === activeIndex ? 0 : -1}
                      aria-hidden={index !== activeIndex}
                    >
                      <Link href={slide.primaryCta.href} tabIndex={index === activeIndex ? 0 : -1}>
                        {slide.primaryCta.label}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goToSlide(activeIndex - 1)}
          className="group absolute left-6 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/40 text-white transition hover:border-white/60 hover:bg-slate-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C700] lg:flex"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => goToSlide(activeIndex + 1)}
          className="group absolute right-6 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/40 text-white transition hover:border-white/60 hover:bg-slate-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C700] lg:flex"
          aria-label="Slide siguiente"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 hidden lg:flex">
        {renderProgressBars("w-full", { animate: isDesktop })}
      </div>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </section>
  )
}
