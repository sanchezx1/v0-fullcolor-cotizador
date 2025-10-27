import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo-fullcolor.png"
            alt="FullColor"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/catalogo" className="text-sm font-medium transition-colors hover:text-primary">
            Catálogo
          </Link>
          <Link
            href="/cotizador"
            className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Cotizador
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cotizador">
            <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ver Cotización
            </Button>
          </Link>
          <Link href="/catalogo">
            <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
              Cotizar Ahora
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
