import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white">Full</span>
              <span className="text-2xl font-bold text-accent">Color</span>
            </div>
            <p className="text-sm text-gray-400">Tu socio en impresión y productos personalizados de alta calidad.</p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-gray-400 hover:text-white transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/cotizador" className="text-gray-400 hover:text-white transition-colors">
                  Cotizador
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">Papelería Corporativa</li>
              <li className="text-gray-400">Material Publicitario</li>
              <li className="text-gray-400">Merchandising</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                info@fullcolor.com
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                +593 99 123 4567
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                Quito, Ecuador
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} FullColor. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
