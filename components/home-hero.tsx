"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
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
    image: "/placeholder.svg?height=760&width=1440",
    imageAlt: "Mockup de papelería corporativa FullColor sobre fondo azul",
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
  },
]

export function HomeHero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [announcement, setAnnouncement] = useState(`${slides[0].title}. ${slides[0].subtitle}`)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAnnouncement(`${slides[activeIndex].title}. ${slides[activeIndex].subtitle}`)
  }, [activeIndex])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const handleScroll = () => {
      const { scrollLeft, offsetWidth } = track
      if (!offsetWidth) return
      const index = Math.round(scrollLeft / offsetWidth)
      setActiveIndex((previous) => (index === previous ? previous : index))
    }

    track.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      track.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const goToSlide = (index: number) => {
    const nextIndex = (index + slides.length) % slides.length
    setActiveIndex(nextIndex)
  }

  const handleArrowKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      goToSlide(activeIndex + 1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      goToSlide(activeIndex - 1)
    }
  }

  const renderProgressBars = (className?: string) => (
    <div className={cn("flex justify-center gap-2", className)}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "h-1.5 w-12 rounded-full transition-colors duration-300",
            index === activeIndex ? "bg-[#F5C700] shadow-[0_0_14px_rgba(245,199,0,0.55)]" : "bg-white/50 lg:bg-[#0068A5]/30"
          )}
          role="presentation"
        />
      ))}
    </div>
  )

  return (
    <section className="relative">
      <div className="lg:hidden">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-6 scrollbar-hide"
          aria-roledescription="Carrusel de beneficios FullColor"
        >
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className="relative flex min-w-full snap-center flex-col"
              aria-label={`Slide ${index + 1} de ${slides.length}`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="-mt-8 rounded-t-[32px] bg-[#0068A5] px-6 py-8 text-white shadow-[0_20px_60px_-32px_rgba(0,104,165,0.85)]">
                <div className="space-y-4">
                  <p className="text-sm font-medium text-[#F5C700]">FullColor</p>
                  <h1 className="text-3xl font-semibold leading-tight">{slide.title}</h1>
                  <p className="text-base leading-relaxed text-white/90">{slide.subtitle}</p>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-[#F5C700] px-7 py-5 text-base font-semibold text-slate-900 shadow-lg shadow-[#F5C700]/40 transition hover:bg-[#f2c000]"
                  >
                    <Link href={slide.primaryCta.href}>{slide.primaryCta.label}</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
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
              <img
                src={slide.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0068A5]/90 via-[#0068A5]/55 to-transparent" />
              <div className="relative z-10 flex h-full items-center pl-36 pr-16">
                <div className="max-w-2xl text-white">
                  <p className="text-sm font-medium text-[#F5C700] uppercase tracking-[0.3em]">
                    FullColor
                  </p>
                  <h2 className="mt-6 text-5xl font-semibold leading-tight text-white">{slide.title}</h2>
                  <p className="mt-6 text-lg leading-relaxed text-white/85">{slide.subtitle}</p>
                  <div className="mt-9">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full bg-[#F5C700] px-9 py-6 text-base font-semibold text-slate-900 shadow-lg shadow-[#F5C700]/40 transition hover:bg-[#f2c000]"
                    >
                      <Link href={slide.primaryCta.href}>{slide.primaryCta.label}</Link>
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
          className="group absolute left-6 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/40 text-white transition hover:border-white/60 hover:bg-slate-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C700] lg:flex"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => goToSlide(activeIndex + 1)}
          className="group absolute right-6 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/40 text-white transition hover:border-white/60 hover:bg-slate-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C700] lg:flex"
          aria-label="Slide siguiente"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 hidden lg:flex">
        {renderProgressBars("w-full")}
      </div>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </section>
  )
}
