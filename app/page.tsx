"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  Boxes,
  Clock,
  FileText,
  PenTool,
  PhoneCall,
  Quote,
  ShieldCheck,
  Truck,
} from "lucide-react"
import Link from "next/link"
import { HomeHero } from "@/components/home-hero"
import { WhatsAppHelp } from "@/components/whatsapp-help"
import { listProducts } from "@/src/lib/data"
import { Producto } from "@/src/services/supabaseClient"
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel"

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
      setFeaturedProducts(products.slice(0, 5))
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

      <HomeHero />

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
            <FeaturedProductsCarousel products={featuredProducts} />
          )}
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
          <div className="mx-auto max-w-5xl rounded-3xl border border-primary/10 bg-gradient-to-r from-primary/90 via-primary/80 to-primary px-8 py-12 text-white shadow-[0_28px_80px_-40px_rgba(0,102,161,0.9)]">
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
    </div>
  )
}
