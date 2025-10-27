"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  FileText,
  PenTool,
  PhoneCall,
  Quote,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react"
import { CategoryChips } from "@/components/category-chips"
import { FeaturedCards } from "@/components/featured-cards"
import { WhatsAppHelp } from "@/components/whatsapp-help"
import { listProducts } from "@/src/lib/data"
import { Producto } from "@/src/services/supabaseClient"

const heroHighlights = [
  {
    icon: Clock,
    title: "Respuesta en menos de 24 h",
    description: "Equipo comercial dedicado a tu proyecto",
  },
  {
    icon: ShieldCheck,
    title: "Control de calidad",
    description: "Revisiones de color y materiales a medida",
  },
  {
    icon: Truck,
    title: "Envios nacionales",
    description: "Cobertura en Ecuador con aliados logisticos",
  },
]

const steps = [
  {
    icon: Boxes,
    title: "Elige producto",
    description: "Explora el catalogo y selecciona la linea ideal para tu marca.",
  },
  {
    icon: PenTool,
    title: "Personaliza",
    description: "Configura cantidades, acabados y agrega tus archivos o indicaciones.",
  },
  {
    icon: FileText,
    title: "Recibe tu proforma",
    description: "Validamos especificaciones y enviamos una cotizacion clara y transparente.",
  },
  {
    icon: PhoneCall,
    title: "Confirma por WhatsApp o email",
    description: "Ultimamos detalles y coordinamos produccion y entrega.",
  },
]

const benefits = [
  {
    icon: Clock,
    title: "Puntualidad garantizada",
    description: "Planificamos cada entrega con seguimiento en tiempo real.",
  },
  {
    icon: ShieldCheck,
    title: "Calidad FullColor",
    description: "Tintas premium, acabados precisos y control en cada lote.",
  },
  {
    icon: PenTool,
    title: "Personalizacion total",
    description: "Formatos a medida, empaques especiales y asesor creativo.",
  },
  {
    icon: Truck,
    title: "Envios en Ecuador",
    description: "Logistica confiable desde Machala hacia todo el pais.",
  },
]

const testimonials = [
  {
    quote:
      "FullColor nos ayudo a lanzar un kit corporativo en tiempo record. La calidad y la presentacion superaron las expectativas del equipo.",
    author: "Carolina Villacis",
    role: "Marketing Manager",
    company: "Grupo Andino",
  },
  {
    quote:
      "El equipo entiende perfectamente los requerimientos tecnicos y propone mejoras que optimizan costos sin sacrificar imagen.",
    author: "Roberto Mora",
    role: "Director Comercial",
    company: "Impulsa Agencia",
  },
  {
    quote:
      "Trabajar con FullColor nos permite mantener consistencia en cada evento. Siempre llegan a tiempo y con embalaje impecable.",
    author: "Daniela Cevallos",
    role: "Coordinadora de Eventos",
    company: "Universidad Pacifico",
  },
]

const faqs = [
  {
    question: "Cuales son los plazos de produccion?",
    answer:
      "Depende del volumen y acabados. En promedio manejamos 3 a 7 dias habiles luego de aprobar disenos y pago inicial.",
  },
  {
    question: "Existe un minimo de unidades?",
    answer:
      "Cada producto tiene su minimo tecnicamente viable. Encontraras la referencia en la ficha y podemos evaluar excepciones.",
  },
  {
    question: "Que archivos necesito enviar?",
    answer:
      "Trabajamos con PDF, AI o EPS en curvas. Si solo tienes PNG o JPG, nuestro equipo puede vectorizar con costo adicional.",
  },
  {
    question: "Realizan envios fuera de Machala?",
    answer:
      "Si, coordinamos envios a nivel nacional mediante aliados logisticos y brindamos seguimiento del despacho.",
  },
  {
    question: "Ofrecen muestras o pruebas de color?",
    answer:
      "Podemos producir muestras fisicas o pruebas impresas bajo solicitud para validar materiales y colorimetria.",
  },
  {
    question: "Aceptan pagos corporativos?",
    answer:
      "Si, trabajamos con transferencias, tarjetas y convenios para empresas con orden de compra.",
  },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const products = await listProducts()
      setFeaturedProducts(products.slice(0, 6))
    } catch (err) {
      console.error("Error loading featured products:", err)
      setError("No pudimos cargar el catalogo destacado. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-16 animate-pulse">
            <div className="max-w-4xl mx-auto space-y-6 text-center">
              <div className="h-6 bg-slate-200 rounded-full mx-auto w-32" />
              <div className="h-12 bg-slate-200 rounded-full" />
              <div className="h-20 bg-slate-200 rounded-3xl" />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-44 bg-slate-200 rounded-3xl" />
              ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-80 bg-slate-200 rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />
      <WhatsAppHelp
        variant="floating"
        message="Hola FullColor, me gustaria cotizar un proyecto."
      />

      <section className="relative">
        <div className="container mx-auto px-4 pb-20 pt-16 md:pt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
            <div className="relative space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" /> Produccion grafica profesional
              </span>
              <h1 className="text-pretty text-4xl font-semibold text-slate-900 sm:text-5xl lg:text-6xl">
                Impulsa tu marca con merchandising y impresos listos para sorprender.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                Acompanamos todo el proceso para que cotizar sea simple. Personaliza materiales,
                asegura tiempos y recibe soporte experto desde el primer briefing.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  asChild
                  className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
                >
                  <Link href="/cotizador" aria-label="Solicitar cotizacion en linea">
                    Solicitar cotizacion
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-full border-primary/30 px-8 py-6 text-base text-primary hover:border-primary hover:bg-primary/10"
                >
                  <Link href="/catalogo" aria-label="Ver catalogo de productos FullColor">
                    Ver catalogo
                  </Link>
                </Button>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {heroHighlights.map((item) => {
                  const Icon = item.icon
                  return (
                    <li
                      key={item.title}
                      className="flex items-start gap-3 rounded-3xl bg-white/70 p-5 shadow-[0_12px_60px_-32px_rgba(0,102,161,0.45)] backdrop-blur"
                    >
                      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
            <Card className="relative overflow-hidden rounded-[32px] border-none bg-white/90 shadow-xl shadow-primary/15 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              <div className="relative space-y-6 p-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
                    Experiencia FullColor
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Tu proyecto acompanado de principio a fin
                  </h2>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 text-sm shadow-inner">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      Asesoria especializada en materiales y acabados segun industria y objetivo.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 text-sm shadow-inner">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span>
                      Produccion bajo estandares ISO y evaluacion cromatica en cada tiraje.
                    </span>
                  </li>
                  <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 text-sm shadow-inner">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span>Trazabilidad y seguimiento en linea hasta la entrega final.</span>
                  </li>
                </ul>
                <div className="rounded-3xl border border-primary/20 bg-white/80 p-5 text-sm text-slate-600">
                  <strong className="font-semibold text-slate-900">Necesitas algo urgente?</strong>{" "}
                  Agenda una llamada y coordinamos produccion express segun disponibilidad.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Cotizar toma solo cuatro pasos claros
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Organizamos el flujo de trabajo para que puedas iniciar tu produccion sin friccion.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="group relative h-full rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_18px_60px_-40px_rgba(0,102,161,0.8)] transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-primary/20"
                >
                  <span className="absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                    {index + 1}
                  </span>
                  <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 flex max-w-4xl flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Productos destacados listos para personalizar
            </h2>
            <p className="text-base text-slate-600">
              Visualiza el potencial de tus impresos con nuestros best sellers. Puedes ajustar cantidades y acabados directamente en el cotizador.
            </p>
          </div>

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-red-700">Ups, algo salio mal</h3>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <Button className="mt-6 rounded-full px-6" onClick={loadFeaturedProducts}>
                Reintentar carga
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_18px_60px_-45px_rgba(0,102,161,0.65)] transition hover:-translate-y-1 hover:shadow-primary/25"
                >
                  <Link
                    href={`/producto/${product.id}`}
                    className="relative block aspect-[4/3] overflow-hidden"
                    aria-label={`Ver detalles del producto ${product.nombre}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <img
                      src={product.imagen_url || "/placeholder.svg?height=300&width=400"}
                      alt={product.nombre}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-700 backdrop-blur">
                      <span>{product.categoria}</span>
                      <ArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                  </Link>
                  <CardContent className="flex flex-1 flex-col gap-4 p-6">
                    <div className="space-y-2">
                      <Badge
                        variant="secondary"
                        className="rounded-full border border-primary/20 bg-primary/10 text-xs text-primary"
                      >
                        Minimo {product.minimo_pedido} {product.unidad}
                      </Badge>
                      <h3 className="text-lg font-semibold leading-tight text-slate-900">
                        {product.nombre}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 line-clamp-3">
                        {product.descripcion}
                      </p>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center gap-3">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Precio segun cantidad
                      </span>
                      <Button
                        size="sm"
                        className="rounded-full px-5 py-2 text-sm shadow-sm shadow-primary/20 transition group-hover:-translate-y-0.5"
                        asChild
                      >
                        <Link href={`/producto/${product.id}`}>Cotizar</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full border-primary/30 px-8 py-6 text-base text-primary hover:border-primary hover:bg-primary/10"
            >
              <Link href="/catalogo">Ver todo el catalogo</Link>
            </Button>
            <span className="text-sm text-slate-500">
              Mas de 150 referencias en papeleria, promocionales y gran formato.
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Por que FullColor</h2>
            <p className="mt-4 text-base text-slate-600">
              Somos aliados estrategicos para departamentos de marketing, agencias y emprendedores que necesitan ejecutar sin sorpresas.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_18px_60px_-45px_rgba(0,102,161,0.65)] transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-primary/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-slate-900">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Inspira tu proximo pedido
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Casos destacados de merchandising y material impreso que cumplieron objetivos de marca.
            </p>
          </div>
          <div className="mt-12">
            <FeaturedCards />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Categorias clave</h2>
            <p className="mt-4 text-base text-slate-600">
              Filtra por linea de producto para llegar directo a lo que necesitas cotizar.
            </p>
          </div>
          <div className="rounded-[32px] border border-primary/10 bg-gradient-to-br from-white via-white to-primary/5 p-6 shadow-[0_18px_60px_-45px_rgba(0,102,161,0.6)]">
            <CategoryChips />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Clientes que confian en FullColor
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Historias reales de equipos que encontraron un aliado en nuestra planta de produccion.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.author}
                className="flex h-full flex-col justify-between rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-[0_18px_60px_-45px_rgba(0,102,161,0.6)] backdrop-blur"
              >
                <Quote className="h-10 w-10 text-primary" aria-hidden="true" />
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p>
                    {testimonial.role} - {testimonial.company}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-[36px] border border-primary/10 bg-gradient-to-r from-primary/90 via-primary/80 to-primary px-8 py-12 text-white shadow-[0_28px_80px_-40px_rgba(0,102,161,0.9)]">
            <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold md:text-4xl">
                  Listo para cotizar? Nuestro equipo te acompana hoy mismo.
                </h2>
                <p className="text-base text-white/80">
                  Envianos tu brief o agenda una llamada para revisar ideas, materiales y tiempos ideales segun tu presupuesto.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    size="lg"
                    asChild
                    className="rounded-full bg-white px-8 py-6 text-base font-semibold text-primary transition hover:-translate-y-0.5"
                  >
                    <Link href="/cotizador">Crear cotizacion</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="rounded-full border-white/60 px-8 py-6 text-base text-white hover:bg-white/10"
                  >
                    <Link
                      href="https://wa.me/593999999999?text=Hola%20FullColor%2C%20quisiera%20informacion%20sobre%20un%20proyecto."
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chatee con nosotros por WhatsApp"
                    >
                      Chatee con nosotros
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="space-y-4 rounded-3xl bg-white/10 p-6 text-sm">
                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 flex-shrink-0 text-white" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Horarios de atencion</p>
                    <p>Lunes a viernes 8h00 a 18h00 - Sabados 9h00 a 13h00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneCall className="mt-1 h-5 w-5 flex-shrink-0 text-white" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Soporte especializado</p>
                    <p>Briefing tecnico, mockups y recomendaciones de empaque.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              Preguntas frecuentes
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Resolvemos las dudas mas habituales para que avances sin frenos.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_18px_60px_-55px_rgba(0,102,161,0.6)] transition hover:border-primary/30 hover:shadow-primary/20"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-base font-semibold text-slate-900 marker:hidden">
                  {faq.question}
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <WhatsAppHelp message="Hola FullColor, necesito apoyo con mi cotizacion." />
        </div>
      </section>
    </div>
  )
}
