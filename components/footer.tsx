import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0066A1] text-white mt-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-around items-start max-w-5xl mx-auto">
          <div className="text-center">
            <h3 className="font-bold mb-3 text-sm">Enlaces Rápidos</h3>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/" className="text-gray-100 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-gray-100 hover:text-white transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/cotizador" className="text-gray-100 hover:text-white transition-colors">
                  Cotizador
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <h3 className="font-bold mb-3 text-sm">Categorías</h3>
            <ul className="space-y-1.5 text-sm">
              <li className="text-gray-100">Papelería Corporativa</li>
              <li className="text-gray-100">Material Publicitario</li>
              <li className="text-gray-100">Merchandising</li>
            </ul>
          </div>

          <div className="text-center">
            <h3 className="font-bold mb-3 text-sm">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-center gap-2 text-gray-100">
                <Mail className="h-4 w-4" />
                info@fullcolor.com
              </li>
              <li className="flex items-center justify-center gap-2 text-gray-100">
                <Phone className="h-4 w-4" />
                +593 99 123 4567
              </li>
              <li className="flex items-center justify-center gap-2 text-gray-100">
                <MapPin className="h-4 w-4" />
                Quito, Ecuador
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 pt-4 text-center text-xs text-gray-100">
          <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
