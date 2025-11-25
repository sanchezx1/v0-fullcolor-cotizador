import type { Metadata } from "next"
import Link from "next/link"
import type { ElementType } from "react"
import { Mail, MessageCircle, PhoneCall, MapPin, Clock, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Detail = {
  label: string
  value: string
  href?: string
  type?: "default" | "note"
}

type ContactMethod = {
  title: string
  icon: ElementType
  description: string
  details: Detail[]
  cta?: { label: string; href: string }
  variant?: "primary" | "default"
}

const contactMethods: ContactMethod[] = [
  {
    title: "WhatsApp",
    icon: MessageCircle,
    description: "La forma más rápida de contactarnos. Ideal para consultas rápidas o soporte.",
    variant: "primary",
    details: [
      {
        label: "Número",
        value: "0988705311",
        href: "https://wa.me/message/NMOTUO5GTAI3C1"
      }
    ],
    cta: {
      label: "Chatear ahora",
      href: "https://wa.me/message/NMOTUO5GTAI3C1"
    }
  },
  {
    title: "Llamada Telefónica",
    icon: PhoneCall,
    description: "Habla directamente con nuestro equipo comercial para asesoría personalizada.",
    details: [
      {
        label: "Número",
        value: "0988705311",
        href: "tel:0988705311"
      },
      {
        label: "Horario",
        value: "Lun-Vie 8:00-18:00",
        type: "note"
      }
    ],
    cta: {
      label: "Llamar ahora",
      href: "tel:0988705311"
    }
  },
  {
    title: "Correo Electrónico",
    icon: Mail,
    description: "Para envío de archivos pesados, solicitudes formales o cotizaciones detalladas.",
    details: [
      {
        label: "Email",
        value: "fullcolorecuador@yahoo.com",
        href: "mailto:fullcolorecuador@yahoo.com"
      },
      {
        label: "Respuesta",
        value: "Máx. 24 horas hábiles",
        type: "note"
      }
    ],
    cta: {
      label: "Enviar correo",
      href: "mailto:fullcolorecuador@yahoo.com"
    }
  }
]

export const metadata: Metadata = {
  title: "Contacto | FullColor Cotizador",
  description:
    "Encuentra la forma ideal de comunicarte con FullColor: soporte por WhatsApp, atención telefónica y correo electrónico."
}

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-16 pt-24 lg:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
              Estamos en línea para ayudarte
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Hablemos de tu próximo <span className="text-primary">proyecto</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
              Ya sea que tengas una idea clara o necesites asesoría desde cero, 
              nuestro equipo está listo para escuchar tus necesidades y brindarte 
              la mejor solución gráfica.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards Grid */}
      <section className="container mx-auto px-4 py-12 lg:py-16 -mt-12 relative z-10">
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {contactMethods.map((method) => {
            const Icon = method.icon
            const isPrimary = method.variant === "primary"

            return (
              <Card 
                key={method.title} 
                className={`flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isPrimary ? "border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/10" : "hover:border-primary/20"
                }`}
              >
                <CardHeader>
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                    isPrimary ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{method.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {method.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    {method.details.map((detail, idx) => (
                      <div key={idx} className="group">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">
                          {detail.label}
                        </p>
                        {detail.href ? (
                          <Link 
                            href={detail.href}
                            className="text-base font-semibold text-slate-900 hover:text-primary transition-colors flex items-center gap-1"
                            target={detail.href.startsWith("http") ? "_blank" : undefined}
                          >
                            {detail.value}
                            {detail.href.startsWith("http") && <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />}
                          </Link>
                        ) : (
                          <p className="text-sm text-slate-700">{detail.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  {method.cta && (
                    <Button 
                      asChild 
                      className={`w-full ${isPrimary ? "bg-primary hover:bg-primary/90" : ""}`}
                      variant={isPrimary ? "default" : "outline"}
                    >
                      <Link 
                        href={method.cta.href}
                        target={method.cta.href.startsWith("http") ? "_blank" : undefined}
                      >
                        {method.cta.label}
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Additional Info / Location */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Visítanos en nuestra planta</h2>
              <p className="text-lg text-slate-600">
                Conoce nuestras instalaciones y revisa muestras físicas de nuestros materiales y acabados.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Ubicación</h3>
                  <p className="text-slate-600 mt-1">
                    Quito, Ecuador<br />
                    (Dirección exacta previa cita)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Horario de Atención</h3>
                  <p className="text-slate-600 mt-1">
                    Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                    Sábados: 9:00 AM - 1:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-2xl ring-1 ring-slate-900/5 lg:aspect-square">
             {/* Placeholder for map or office image */}
             <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 mx-auto opacity-20" />
                  <p className="text-sm font-medium">Mapa de ubicación</p>
                </div>
             </div>
             {/* If you have a real map iframe, put it here */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  )
}
