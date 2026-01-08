import type { Metadata } from "next"
import Link from "next/link"
import { 
  Mail, 
  MessageCircle, 
  PhoneCall, 
  MapPin, 
  Clock, 
  ArrowRight,
  Sparkles,
  Send,
  Building2,
  Zap
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contacto | FullColor Cotizador",
  description:
    "Encuentra la forma ideal de comunicarte con FullColor: soporte por WhatsApp, atención telefónica y correo electrónico."
}

export default function ContactoPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background gradient similar to home page */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-8 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Respuesta en menos de 2 horas
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Conecta con <span className="text-primary">FullColor</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
              Elige el canal que prefieras. Nuestro equipo está listo para ayudarte 
              a materializar tu próximo proyecto de impresión.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Action - WhatsApp CTA */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-3xl">
          <Link 
            href="https://wa.me/message/NMOTUO5GTAI3C1"
            target="_blank"
            className="group block"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#25D366] to-[#128C7E] p-6 shadow-xl shadow-green-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1">
              <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute left-0 bottom-0 h-32 w-32 -translate-x-10 translate-y-10 rounded-full bg-white/10 blur-2xl" />
              
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-medium text-white/80">Método más rápido</p>
                    <h2 className="text-xl font-bold sm:text-2xl">Escríbenos por WhatsApp</h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-[#128C7E] shadow-lg transition-transform group-hover:scale-105">
                  <Zap className="h-4 w-4" />
                  <span>Chatear ahora</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              
              <p className="relative mt-4 text-center text-sm text-white/80 sm:text-left sm:pl-18">
                +593 98 870 5311 · Atención inmediata de Lunes a Viernes
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">Más formas de contacto</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phone Card */}
            <Card className="group overflow-hidden border-0 bg-white shadow-[0_18px_60px_-40px_rgba(0,102,161,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-35px_rgba(0,102,161,0.6)]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-slate-900">Llamada directa</h3>
                    <p className="mb-3 text-sm text-slate-600">
                      Para asesoría personalizada y consultas complejas
                    </p>
                    <Link 
                      href="tel:+593988705311"
                      className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
                    >
                      +593 98 870 5311
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      Lun-Vie: 8:00 - 18:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card className="group overflow-hidden border-0 bg-white shadow-[0_18px_60px_-40px_rgba(0,102,161,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_-35px_rgba(0,102,161,0.6)]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-slate-900">Correo electrónico</h3>
                    <p className="mb-3 text-sm text-slate-600">
                      Ideal para envío de archivos y solicitudes formales
                    </p>
                    <Link 
                      href="mailto:fullcolorecuador@yahoo.com"
                      className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline break-all"
                    >
                      fullcolorecuador@yahoo.com
                      <Send className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Sparkles className="h-3 w-3" />
                      Respuesta máx. 24 horas hábiles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                Visítanos en Machala
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Conoce nuestras instalaciones y revisa muestras de materiales en persona
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-5 lg:gap-12 items-start">
              {/* Location Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_18px_60px_-45px_rgba(0,102,161,0.65)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Planta de Producción</h3>
                      <address className="not-italic text-slate-600 leading-relaxed">
                        Rocafuerte 302 y 23 de Abril<br />
                        Machala, El Oro<br />
                        Ecuador
                      </address>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-[0_18px_60px_-45px_rgba(0,102,161,0.65)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Horario de Atención</h3>
                      <div className="space-y-1 text-slate-600">
                        <div className="flex justify-between gap-4">
                          <span>Lunes - Viernes</span>
                          <span className="font-medium text-slate-900">8:00 - 18:00</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Sábados</span>
                          <span className="font-medium text-slate-900">9:00 - 13:00</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-400">
                          <span>Domingos</span>
                          <span>Cerrado</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  asChild 
                  className="w-full rounded-xl h-12 text-base shadow-lg shadow-primary/20"
                >
                  <Link 
                    href="https://maps.google.com/?q=Rocafuerte+302+y+23+de+Abril,+Machala,+El+Oro,+Ecuador"
                    target="_blank"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Abrir en Google Maps
                  </Link>
                </Button>
              </div>

              {/* Map */}
              <div className="lg:col-span-3">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-2xl ring-1 ring-slate-900/5">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.3!2d-79.96!3d-3.26!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMTUnMzYuMCJTIDc5wrA1NiczNi4wIlc!5e0!3m2!1ses!2sec!4v1600000000000!5m2!1ses!2sec"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                    title="Ubicación de FullColor en Machala"
                  />
                  <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-inset ring-black/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border border-primary/10 bg-gradient-to-br from-white to-primary/5 p-8 shadow-[0_18px_60px_-40px_rgba(0,102,161,0.5)] lg:p-12">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 lg:text-3xl">
                ¿Listo para empezar tu proyecto?
              </h2>
              <p className="mb-8 max-w-xl text-slate-600">
                Explora nuestro catálogo de productos y usa el cotizador online 
                para recibir una proforma instantánea con precios escalonados.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                  <Link href="/catalogo">
                    Ver catálogo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl px-8">
                  <Link href="/cotizador">
                    Ir al cotizador
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
