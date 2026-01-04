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
    console.warn("No se pudo leer la cotización desde localStorage", error)
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

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [quoteCount, setQuoteCount] = useState(0)
  const [animateBadge, setAnimateBadge] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, isAdmin, user: authUser, status: authStatus } = useAuthSession()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
      toast.success("Sesión cerrada correctamente")
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error cerrando sesión:", error)
      toast.error("No pudimos cerrar tu sesión")
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
        "absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#f5c700] px-1.5 text-[11px] font-bold text-slate-900 shadow-md ring-2 ring-white transition-transform duration-300",
        animateBadge ? "scale-125" : "scale-100"
      ].join(" "),
    [animateBadge]
  )

  const quoteCountLabel =
    quoteCount === 1 ? "1 producto en la cotización" : `${quoteCount} productos en la cotización`

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 md:sticky ${
          scrolled
            ? "bg-white/95 shadow-lg shadow-primary/5 backdrop-blur-md"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto flex h-[72px] items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link
            href="/"
            className={`group relative flex items-center transition-all duration-300 ${
              isMenuOpen ? "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto" : "opacity-100"
            }`}
          >
            <div className="relative">
              <Image
                src="/logo-fullcolor.png"
                alt="FullColor"
                width={180}
                height={45}
                className="h-11 w-auto transition-transform duration-300 group-hover:scale-[1.02]"
                priority
              />
            </div>
          </Link>

          {/* Navegación Desktop - Centrada */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-[#0066a1]"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[#f5c700] transition-all duration-300 group-hover:w-3/4" />
              </Link>
            ))}
          </nav>

          {/* Acciones Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/cotizador"
              aria-live="polite"
              className="relative flex h-11 w-11 items-center justify-center rounded-md bg-[#0066a1]/5 text-[#0066a1] transition-all duration-200 hover:bg-[#0066a1]/10 active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {quoteCount > 0 && (
                <span className={badgeClasses} role="status" aria-label={quoteCountLabel}>
                  {quoteCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#0066a1] to-[#005080] text-white shadow-lg shadow-[#0066a1]/25 transition-all duration-200 hover:shadow-xl hover:shadow-[#0066a1]/30 active:scale-95"
              aria-label="Abrir menú de navegación"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              aria-controls="fullcolor-mobile-menu"
            >
              <Menu className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>

          {/* Acciones Desktop */}
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

            <Link
              href="/cotizador"
              aria-live="polite"
              className="group relative flex items-center gap-2.5 rounded-md bg-gradient-to-r from-[#0066a1] to-[#0077b8] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0066a1]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0066a1]/30"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span>Cotizar</span>
              {quoteCount > 0 && (
                <span
                  className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#f5c700] px-1.5 text-[11px] font-bold text-slate-900 shadow-inner"
                  role="status"
                  aria-label={quoteCountLabel}
                >
                  {quoteCount}
                </span>
              )}
              <div className="absolute inset-0 -z-10 rounded-md bg-gradient-to-r from-[#f5c700]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </header>

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
            <span className="text-sm font-semibold text-muted-foreground">Menú</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMenu}
              className="h-9 w-9 rounded-md hover:bg-muted"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Cerrar menú</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-1">
              {[
                { href: "/", label: "Inicio", icon: Home },
                { href: "/catalogo", label: "Catálogo", icon: Package },
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
                    {signingOut ? "Cerrando..." : "Cerrar sesión"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="px-2 text-sm text-muted-foreground">
                  Inicia sesión para ver tus cotizaciones y pedidos.
                </p>
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  <UserRound className="h-4 w-4" />
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Espaciador para el header fixed en mobile */}
      <div className="h-[72px] w-full md:hidden" aria-hidden="true" />
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
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
        <span className="h-4 w-4 animate-pulse rounded-full bg-slate-300" aria-hidden="true" />
        <span className="sr-only">Cargando</span>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group flex h-10 w-10 items-center justify-center rounded-md bg-[#0066a1]/5 text-[#0066a1] transition-all hover:bg-[#0066a1]/10">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-md p-2">
          <DropdownMenuLabel className="px-3 py-2">
            <p className="text-xs text-slate-500">Sesión activa</p>
            <p className="truncate text-sm font-medium text-slate-800">{userEmail || "Usuario"}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              onNavigate()
            }}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm"
          >
            {isAdmin ? (
              <>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Panel de administración
              </>
            ) : (
              <>
                <UserRound className="mr-2 h-4 w-4" />
                Mi cuenta
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              onSignOut()
            }}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {signingOut ? "Cerrando..." : "Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <button
      className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-[#0066a1]/30 hover:bg-[#0066a1]/5 hover:text-[#0066a1]"
      onClick={onNavigate}
    >
      <UserRound className="h-4 w-4" aria-hidden="true" />
      <span>Iniciar sesión</span>
    </button>
  )
}
