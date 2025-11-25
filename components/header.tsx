'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Menu, ShoppingCart, UserRound, X, Home, Package, Phone, LogOut, LayoutDashboard, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthSession } from "@/src/hooks/useAuthSession"
import { supabase } from "@/src/services/supabaseClient"
import { toast } from "sonner"
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
  const [signingOut, setSigningOut] = useState(false)
  const { isAuthenticated, isAdmin, user: authUser, status: authStatus } = useAuthSession()
  const router = useRouter()

  const handleAccountNavigate = () => {
    if (isAdmin) {
      router.push("/admin")
    } else if (isAuthenticated) {
      router.push("/mi-cuenta")
    } else {
      router.push("/auth/login")
    }
    setIsMenuOpen(false)
  }

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
      toast.success("Sesion cerrada correctamente")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error cerrando sesion:", error)
      toast.error("No pudimos cerrar tu sesion")
    } finally {
      setSigningOut(false)
    }
  }

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
          <Link href="/contacto" className="text-sm font-medium transition-colors hover:text-primary">
            Contacto
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
          <AccountButton
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            userEmail={authUser?.email ?? ""}
            status={authStatus}
            signingOut={signingOut}
            onNavigate={handleAccountNavigate}
            onSignOut={handleSignOut}
          />
          <Button
            asChild
            variant="outline"
            size="sm"
            className="relative bg-transparent px-3 sm:px-4"
          >
            <Link href="/cotizador" aria-live="polite" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Mis cotizaciones</span>
              <span className="sm:hidden text-sm font-semibold">Mis cotizaciones</span>
              {quoteCount > 0 && (
                <span className={badgeClasses} role="status" aria-label={quoteCountLabel}>
                  {quoteCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${
          isMenuOpen ? "visible" : "invisible delay-300"
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        />
        
        <aside
          id="fullcolor-mobile-menu"
          role="dialog"
          aria-modal="true"
          className={`absolute right-0 top-0 h-full w-[85%] max-w-xs flex flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <span className="text-sm font-semibold text-muted-foreground">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMenu}
              className="h-9 w-9 rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar menu</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-1">
              {[
                { href: "/", label: "Inicio", icon: Home },
                { href: "/catalogo", label: "Catalogo", icon: Package },
                { href: "/contacto", label: "Contacto", icon: Phone },
                { href: "/cotizador", label: "Cotizar Ahora", icon: ShoppingCart, highlight: true }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                    item.highlight 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-foreground hover:bg-muted hover:text-primary"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${item.highlight ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                  {item.label}
                  {item.highlight && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t bg-muted/30 p-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">
                      {authUser?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "Administrador" : "Cliente"}
                    </p>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Link
                    href={isAdmin ? "/admin" : "/mi-cuenta"}
                    onClick={closeMenu}
                    className="flex w-full items-center gap-2 rounded-md border bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
                  >
                    {isAdmin ? <LayoutDashboard className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                    {isAdmin ? "Panel Admin" : "Mi Cuenta"}
                  </Link>
                  
                  <button
                    onClick={() => {
                      closeMenu()
                      handleSignOut()
                    }}
                    disabled={signingOut}
                    className="flex w-full items-center gap-2 rounded-md border border-transparent px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {signingOut ? "Cerrando..." : "Cerrar sesion"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="px-2 text-sm text-muted-foreground">
                  Inicia sesion para ver tus cotizaciones y pedidos.
                </p>
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  <UserRound className="h-4 w-4" />
                  Iniciar Sesion
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
    <div className="h-16 w-full md:hidden" aria-hidden="true" />
  </>
  )
}

interface AccountButtonProps {
  isAuthenticated: boolean
  isAdmin: boolean
  userEmail: string
  status: "loading" | "authenticated" | "unauthenticated"
  signingOut: boolean
  onNavigate: () => void
  onSignOut: () => void
}

function AccountButton({
  isAuthenticated,
  isAdmin,
  userEmail,
  status,
  signingOut,
  onNavigate,
  onSignOut,
}: AccountButtonProps) {
  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled className="bg-transparent px-3 sm:px-4">
        <span className="h-4 w-4 animate-pulse rounded-full bg-primary/60" aria-hidden="true" />
        <span className="sr-only">Cargando</span>
      </Button>
    )
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative bg-transparent px-3 sm:px-4">
            <UserRound className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{isAdmin ? "Admin" : "Mi cuenta"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
            {userEmail || "Sesion activa"}
          </DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              onNavigate()
            }}
          >
            {isAdmin ? "Ir al panel admin" : "Abrir Mi cuenta"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              onSignOut()
            }}
            className="text-destructive"
          >
            {signingOut ? "Cerrando..." : "Cerrar sesion"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="relative bg-transparent px-3 sm:px-4"
      onClick={onNavigate}
    >
      <UserRound className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Mi cuenta</span>
    </Button>
  )
}
