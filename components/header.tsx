'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { QuoteItem } from "@/src/hooks/useQuoteBuilder"

const STORAGE_KEY = "fullcolor_quote"

const getStoredQuoteItems = (): QuoteItem[] => {
  if (typeof window === "undefined") return []

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn("No se pudo leer la cotizacion desde localStorage", error)
    return []
  }
}

const getItemsCount = (items: QuoteItem[]) => {
  const uniqueProducts = new Set<number>()
  items.forEach((item) => {
    if (typeof item.productId === "number") {
      uniqueProducts.add(item.productId)
    }
  })
  return uniqueProducts.size
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [quoteCount, setQuoteCount] = useState(0)
  const [animateBadge, setAnimateBadge] = useState(false)

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMenuOpen)
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (typeof window === "undefined") return

    const syncQuoteCount = (items: QuoteItem[]) => {
      setQuoteCount(getItemsCount(items))
    }

    const handleCustomUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ items?: QuoteItem[] }>
      if (customEvent.detail?.items) {
        syncQuoteCount(customEvent.detail.items)
      } else {
        syncQuoteCount(getStoredQuoteItems())
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return

      if (event.newValue) {
        try {
          const items = JSON.parse(event.newValue) as QuoteItem[]
          syncQuoteCount(Array.isArray(items) ? items : [])
        } catch {
          syncQuoteCount([])
        }
      } else {
        syncQuoteCount([])
      }
    }

    syncQuoteCount(getStoredQuoteItems())

    window.addEventListener("fullcolor:quote-updated", handleCustomUpdate)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("fullcolor:quote-updated", handleCustomUpdate)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  useEffect(() => {
    if (quoteCount === 0) return

    setAnimateBadge(true)
    const timeout = window.setTimeout(() => setAnimateBadge(false), 260)

    return () => window.clearTimeout(timeout)
  }, [quoteCount])

  const closeMenu = () => setIsMenuOpen(false)

  const badgeClasses = useMemo(
    () =>
      [
        "absolute -top-2 -right-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white shadow-lg transition-transform duration-300",
        animateBadge ? "scale-110" : "scale-100"
      ].join(" "),
    [animateBadge]
  )

  const quoteCountLabel =
    quoteCount === 1 ? "1 producto en la cotizacion" : `${quoteCount} productos en la cotizacion`

  const headerBaseClasses =
    "border-b transition-colors duration-200 md:backdrop-blur md:supports-[backdrop-filter]:bg-background/60"

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full bg-white shadow-sm md:sticky md:bg-background/95 ${headerBaseClasses}`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className={`flex items-center space-x-2 transition-opacity duration-200 ${
              isMenuOpen ? "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto" : "opacity-100"
            }`}
        >
          <Image
            src="/logo-fullcolor.png"
            alt="FullColor"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 transform items-center space-x-6 md:flex">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/catalogo" className="text-sm font-medium transition-colors hover:text-primary">
            Catalogo
          </Link>
          <Link
            href="/cotizador"
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
          >
            <ShoppingCart className="h-4 w-4" />
            Cotizador
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative h-11 w-11 rounded-full border border-primary/30 text-primary"
          >
            <Link href="/cotizador" aria-live="polite" className="flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {quoteCount > 0 && (
                <span className={badgeClasses} role="status" aria-label={quoteCountLabel}>
                  {quoteCount}
                </span>
              )}
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary text-white transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Abrir menu de navegacion"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-controls="fullcolor-mobile-menu"
          >
            <Menu className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="relative bg-transparent px-3 sm:px-4"
          >
            <Link href="/cotizador" aria-live="polite" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Ver Cotizacion</span>
              <span className="sm:hidden text-sm font-semibold">Cotizacion</span>
              {quoteCount > 0 && (
                <span className={badgeClasses} role="status" aria-label={quoteCountLabel}>
                  {quoteCount}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-white hover:bg-primary-hover">
            <Link href="/catalogo">Cotizar Ahora</Link>
          </Button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[60] flex bg-white md:hidden transition-opacity duration-300 ${
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        role="presentation"
        onClick={closeMenu}
      >
        <aside
          id="fullcolor-mobile-menu"
          role="dialog"
          aria-modal="true"
          className={`ml-auto flex h-full w-[85%] max-w-sm flex-col bg-white text-[#1F2937] shadow-2xl transition-transform duration-300 ease-out will-change-transform ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <Link href="/" onClick={closeMenu} className="flex items-center space-x-2">
              <Image
                src="/logo-fullcolor.png"
                alt="FullColor"
                width={140}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Cerrar menu de navegacion"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#0066CC]/20 bg-[#0066CC]/5 text-[#1F2937] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <X className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-start gap-2 px-6 pt-8 pb-12">
            {[
              { href: "/", label: "Inicio" },
              { href: "/catalogo", label: "Catalogo" },
              { href: "/contacto", label: "Contacto" },
              { href: "/cotizador", label: "Cotizar Ahora" }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-lg font-semibold text-[#1F2937] transition-colors duration-200 hover:bg-[#0066CC]/10 hover:text-[#0066CC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </header>
    <div className="h-16 w-full md:hidden" aria-hidden="true" />
  </>
  )
}
