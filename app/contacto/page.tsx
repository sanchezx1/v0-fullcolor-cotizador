import type { Metadata } from "next"
import Link from "next/link"
import type { ElementType } from "react"
import { Mail, MessageCircle, PhoneCall } from "lucide-react"

import { Button } from "@/components/ui/button"

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
}

const contactMethods: ContactMethod[] = [
  {
    title: "Chatea con nosotros",
    icon: MessageCircle,
    description: "Ideal para consultas rápidas o soporte de pedidos.",
    details: [
      {
        label: "WhatsApp",
        value: "0988705311",
        href: "https://wa.me/message/NMOTUO5GTAI3C1"
      }
    ],
    cta: {
      label: "Abrir WhatsApp",
      href: "https://wa.me/message/NMOTUO5GTAI3C1"
    }
  },
  {
    title: "Llámanos",
    icon: PhoneCall,
    description: "Recibe asesoría personalizada de nuestro equipo comercial.",
    details: [
      {
        label: "Número",
        value: "0988705311",
        href: "tel:0988705311"
      },
      {
        label: "Importante",
        value: "Preferimos que nos envíes un mensaje de texto identificándote antes de llamarnos.",
        type: "note"
      },
      {
        label: "Horario",
        value: "Lunes a viernes 8h00 a 18h00 – Sábados 9h00 a 13h00.",
        type: "note"
      }
    ],
    cta: {
      label: "Llamar ahora",
      href: "tel:0988705311"
    }
  },
  {
    title: "Escríbenos por correo",
    icon: Mail,
    description: "Ideal para solicitudes de cotización o envío de archivos.",
    details: [
      {
        label: "Correo",
        value: "fullcolorecuador@yahoo.com",
        href: "mailto:fullcolorecuador@yahoo.com"
      },
      {
        label: "Tiempo estimado de respuesta",
        value: "Dentro del siguiente día hábil.",
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
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 flex justify-center"
      >
        <div className="h-[420px] w-[420px] rounded-full bg-primary/10 blur-[140px] md:h-[520px] md:w-[520px]" />
      </div>

      <section className="container mx-auto px-4 pb-12 pt-24 sm:pt-28 md:pb-16 lg:pb-20">
        <div className="mx-auto max-w-3xl text-center md:text-left">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            Estamos para ayudarte
          </span>
          <h1 className="mt-6 text-3xl font-semibold text-slate-900 sm:text-4xl md:text-5xl">
            ¿Cómo contactarnos?
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Mantén una comunicación directa con el equipo FullColor. Elige el
            canal que mejor se adapte a tus necesidades: estamos atentos para
            acompañarte en cada etapa de tu proyecto gráfico.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:mt-16 md:gap-8">
          {contactMethods.map((method) => {
            const Icon = method.icon

            return (
              <article
                key={method.title}
                className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur transition-transform hover:-translate-y-1 hover:shadow-[0_32px_72px_-32px_rgba(15,23,42,0.45)] md:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 right-[-40px] h-40 w-40 rounded-full bg-primary/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 md:h-48 md:w-48"
                />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:h-16 sm:w-16">
                    <Icon aria-hidden className="h-6 w-6 sm:h-7 sm:w-7" />
                  </span>

                  <div className="flex-1">
                    <div className="max-w-xl">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        {method.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 sm:text-base">
                        {method.description}
                      </p>
                    </div>

                    <dl className="mt-6 space-y-4">
                      {method.details.map((detail) => (
                        <div key={`${method.title}-${detail.label}`} className="space-y-1">
                          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {detail.label}
                          </dt>
                          <dd
                            className={
                              detail.type === "note"
                                ? "text-sm leading-relaxed text-slate-600"
                                : "text-lg font-semibold text-slate-900"
                            }
                          >
                            {detail.href ? (
                              <Link
                                href={detail.href}
                                className={
                                  detail.type === "note"
                                    ? "underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                                    : "text-primary transition-colors hover:text-primary/80"
                                }
                                target={
                                  detail.href.startsWith("http")
                                    ? "_blank"
                                    : undefined
                                }
                                rel={
                                  detail.href.startsWith("http")
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                              >
                                {detail.value}
                              </Link>
                            ) : (
                              detail.value
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {method.cta ? (
                      <div className="mt-6">
                        <Button
                          asChild
                          className="w-full rounded-full bg-primary text-white shadow-sm transition hover:bg-primary/90 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
                        >
                          <Link
                            href={method.cta.href}
                            target={
                              method.cta.href.startsWith("http") ? "_blank" : undefined
                            }
                            rel={
                              method.cta.href.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                          >
                            {method.cta.label}
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 flex justify-center pb-10"
      >
        <div className="h-48 w-[420px] bg-gradient-to-t from-[#FFD700]/30 to-transparent blur-3xl md:w-[560px]" />
      </div>
    </div>
  )
}
