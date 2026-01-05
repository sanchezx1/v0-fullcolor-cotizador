import Link from "next/link"
import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react"

const quickLinks = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Cotizador", href: "/cotizador" },
]

const serviceHighlights = [
  "Papelería corporativa",
  "Material promocional",
  "Merchandising personalizado",
  "Gran formato y señalética",
]

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "WhatsApp", href: "https://wa.me/message/NMOTUO5GTAI3C1", icon: MessageCircle },
]

export function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-[#003d63] via-[#005f99] to-[#003d63] text-white">
      <div className="border-t border-white/10 bg-white/5 backdrop-blur">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div>
              <h3 className="text-2xl font-semibold text-white">
                Soluciones gráficas integrales desde Machala
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                Acompañamos a marcas, agencias y emprendimientos con producción de alta calidad,
                tiempos confiables y asesoría experta en cada paso.
              </p>
              <div className="mt-6 inline-flex items-center rounded-full bg-white/15 px-5 py-3 text-sm text-white">
                <MessageCircle className="mr-3 h-4 w-4 text-[#25D366]" aria-hidden="true" />
                Respuesta comercial en menos de 24 horas
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Enlaces rápidos
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 rounded-full px-0 py-1 text-white/80 transition hover:text-white"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Servicios destacados
              </h4>
              <ul className="mt-4 space-y-3 text-sm text-white/80">
                {serviceHighlights.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Contacto
              </h4>
              <ul className="mt-4 space-y-4 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" aria-hidden="true" />
                  <span>
                    Av. 25 de Junio y Sucre<br />
                    Machala, El Oro - Ecuador
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 flex-shrink-0 text-white" aria-hidden="true" />
                  <a className="hover:text-white transition" href="tel:+593988705311">
                    0988705311
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 flex-shrink-0 text-white" aria-hidden="true" />
                  <a className="hover:text-white transition" href="mailto:hola@fullcolor.ec">
                    hola@fullcolor.ec
                  </a>
                </li>
              </ul>
              <div className="mt-6 flex gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white hover:bg-white/10"
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} FullColor. Todos los derechos reservados.</p>
            <p>
              Políticas de privacidad y tratamiento de datos disponibles a solicitud en{" "}
              <a className="underline hover:text-white" href="mailto:hola@fullcolor.ec">
                hola@fullcolor.ec
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
